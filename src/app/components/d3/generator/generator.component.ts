import { ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Input, OnInit, Pipe, PipeTransform, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faChartBar, faTable, faPalette, faShareSquare, faStar, faSpinner, faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Title } from "@angular/platform-browser";
import { GRAPHS } from 'src/app/models/graph-data';
import { Graph } from 'src/app/models/Graphs';
import { GenericGraphComponent } from '../../generic-graph/generic-graph.component';
import { GraphContent } from 'src/app/models/graphContent';
import { Papa } from 'ngx-papaparse';
import { GraphService } from 'src/app/services/graph.service';
import { TokenStorageService } from 'src/app/services/TokenStorageService';

type HeaderType = { header: string; type: string };

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

  headerRow: any[] = [];
  parsedData: any;

  typeIcon = faChartBar;
  dataIcon = faTable;
  styleIcon = faPalette;
  exportIcon = faShareSquare;
  animationsIcon = faStar;
  spinnerIcon = faSpinner;
  downloadIcon = faDownload;
  infoIcon = faInfoCircle;

  componentRef: ComponentRef<any>;
  genericGraphRef: ComponentRef<any>;

  titleForm: FormGroup;
  styleForm: FormGroup;
  graphForm: FormGroup;
  attributeForm: FormGroup;

  title: String = 'Sin título';
  graphList: Graph[] = GRAPHS;
  formattedMessage: String;
  username: String;


  fileUpload: boolean = false;
  fileToUpload: File = null;
  fileUploaded: boolean = false;
  requiredItems: boolean = false;
  invalidFile: boolean = false;
  showSpinner: boolean = false;
  showSpinnerGraph: boolean = false;
  isLoggedIn: boolean = false;
  saved: boolean = false;
  errorSaved: boolean = false;
  saveSpinner: boolean = false;

  // Para impedir que pueda generar la gráfica sin data ni type
  ready: boolean = false;
  created: boolean = false;

  typeList: HeaderType[] = new Array();
  data: any[] = new Array();

  graphContent: GraphContent = {
    id: null, 
    type: '',
    title: 'Sin título',
    data: [],
    color: [],
    width: 1000,
    height: 1000,
    attributes: [],
    owner: ''
  };

  @ViewChild("genericGraphContainer", { read: ViewContainerRef }) GenericGraphContainer;

  constructor(private resolver: ComponentFactoryResolver, private formBuilder: FormBuilder, private papa: Papa, private cdRef: ChangeDetectorRef, private titleService: Title, private graphService: GraphService, private tokenService: TokenStorageService) {
    this.titleService.setTitle("Generador");
    this.isLoggedIn = !!this.tokenService.getToken() || !!this.tokenService.getLocalToken();
  }

  ngOnInit() {

    $('#customFileLang').on('change', function () {
      var fileName = $(this).val();
      this.fileName = $(this).val();
      $(this).next('.custom-file-label').html(fileName.split("\\").pop());
    })

    this.titleForm = this.formBuilder.group({
      title: ['', { validators: [Validators.required], updateOn: "blur" }]
    });
    this.styleForm = this.formBuilder.group({
      color: ['#6bc1d6', { validators: [Validators.required], updateOn: "blur" }],
      width: ['', { validators: [Validators.required], updateOn: "blur" }],
      height: ['', { validators: [Validators.required], updateOn: "change" }],
      range: ['', { validators: [Validators.required], updateOn: "change" }]
    });
    this.graphForm = this.formBuilder.group({
      type: ['', { validators: [Validators.required], updateOn: "blur" }]
    });
    this.attributeForm = this.formBuilder.group({})


    // Escuchan si los campos obtenidos cambian
    this.titleForm.controls['title'].valueChanges.subscribe(value => {
      this.title = value
      this.graphContent.title = value;
      this.updateGraphContent();
    });

    this.styleForm.controls['color'].valueChanges.subscribe(value => {
      this.graphContent.color = value;
      this.updateGraphContent();
    });
    this.styleForm.controls['width'].valueChanges.subscribe(value => {
      this.graphContent.width = value;
      this.updateGraphContent();
    });
    this.styleForm.controls['range'].valueChanges.subscribe(value => {

    });
    this.styleForm.controls['height'].valueChanges.subscribe(value => {
      this.graphContent.height = value;
      this.updateGraphContent();
    });
    this.graphForm.controls['type'].valueChanges.subscribe(value => {
      this.graphContent.type = value;
      console.log("cahnge type")
      this.ready = true;
      if (this.created) {
        this.updateGraphContent();
      }

    });
  }

  // Cargar el componente segun el tipo elegido para que devuelva su graphContent
  loadComponent() {
    // Comparar el tipo elegido con la lista de componentes de tipos
    let component = this.graphList.find(el => el.type == this.graphContent.type).component;
    if (component != undefined) {
      this.GenericGraphContainer.clear();

      // Crea el generico de tipo bar (por ejemplo)
      const factory: ComponentFactory<GenericGraphComponent<typeof component>> = this.resolver.resolveComponentFactory(GenericGraphComponent);

      // Crea la componente 
      this.genericGraphRef = this.GenericGraphContainer.createComponent(factory);  // Esto llega al constructor y al resto

      // Darle el tipo de la componente a la instancia
      this.genericGraphRef.instance.component = component;
      console.log(this.genericGraphRef.instance)

      // Cuando se crea correctamente el hijo (genericGraph)
      setTimeout(() => {
        if (this.genericGraphRef.instance.container) {
          console.log(this.genericGraphRef.instance)

          // Llama al setter de graphContent
          this.graphContent = this.genericGraphRef.instance.graphContent;
          console.log(this.genericGraphRef.instance)
        }
      }, 1000);

      this.genericGraphRef.instance.output.subscribe(event => console.log("event " + event));
    }
    else {
      console.log("La componente elegida no fue encontrada")
    }
  }

  // Activar panel especificado
  activatePanel(panel) {
    let tabs = document.querySelector(panel)
    tabs.setAttribute("data-toggle", "pill")
    tabs.classList.remove("disabled")
  }

  // Cuando se han especificado los campos que pertenecen a cada atributo, se crea la gráfica y se renderiza
  createComponent() {

    this.saved = false;
    if (this.isLoggedIn) {
      this.username = this.tokenService.getUsername();
      this.graphContent.owner = this.username
    }

    // Si hay una gráfica creada anteriormente se borra
    if (document.querySelector('#svg')) {
      document.querySelector('#svg').remove();
    }

    // Mostrar el spinner mientras se crea la gráfica
    this.showSpinnerGraph = true;

    setTimeout(() => {
      this.genericGraphRef.instance.createComponent();
      this.showSpinnerGraph = false;
      if (document.getElementById('svg')) {
        this.created = true;
  
        // Activar panel de estilo, animaciones y exportar
        this.activatePanel("#v-pills-export-tab")
        this.activatePanel("#v-pills-animations-tab")
        // this.activatePanel("#v-pills-style-tab")
  
      } else {
        console.log('The element does not exists in the page.')
      }
    });


    // Si se ha creado el svg
    
  }

  updateGraphContent() {
    if (this.genericGraphRef) {
      this.genericGraphRef.instance.graphContent = this.graphContent
    }
  }

  // ------- 2 ------- Comprobar el nombre y extensión del fichero especificado
  previewFile(files: FileList) {
    this.saved = false;

    if (files.item(0)) {
      let ext = files.item(0).name.split('.').pop();

      if ((ext == "json") || (ext == "csv") || (ext == "xls") || (ext == "xlsx")) {
        this.fileToUpload = files.item(0)
        this.fileUpload = true;
        this.loadComponent();
      }
      else
        this.fileUpload = false;
    }
  }


  // ---------3---------
  // Cuando el fichero es válido, se parsea y se extraen las cabeceras y los valores dentro del graphContent.data
  uploadFile() {
    // Reset invalid condition
    this.invalidFile = false
    this.fileUploaded = false;

    //Borrar typelist para que no haya conflicto entre consultas distintas
    this.typeList.length = 0;

    if (this.fileUpload) {
      console.log(this.genericGraphRef.instance)


      this.showSpinner = true;
      setTimeout(() => {
        if (this.genericGraphRef.instance.container) {
          this.papa.parse(this.fileToUpload, {
            skipEmptyLines: true,
            dynamicTyping: true, // Para que parsee numeros y boolean correctamente, y no como strings
            complete: parsedData => {
              // Guardar la primera fila con las etiquetas
              if (parsedData.data[0].every(el => typeof el == 'string')) {
    
                this.headerRow = parsedData.data[0]
                // this.graphContent.data.push(parsedData.data[0])
    
                // Recorrer la segunda línea para guardar los tipos de cada campo
                parsedData.data[1].forEach((element, index) => {
                  this.typeList.push({ header: this.headerRow[index], type: typeof element })
                });
    
                this.parsedData = parsedData
                this.fillGraphData();
                this.fileUploaded = true;
              }
              else {
                this.invalidFile = true;
                this.fileUploaded = false;
                console.log("El fichero csv no incluye una fila de etiquetas de los campos")
              }
              this.showSpinner = false;    
            }
          });
        }
      }, 1000);     

    }
  }

  fillGraphData() {

    this.graphContent.data.push(this.headerRow)

    // Comprobar para cada elemento que coincide con el tipo
    this.parsedData.data.forEach((element, index) => {
      if (index != 0 && index != 1) {

        let valid = true;
        element.forEach((el, inx) => {
          // console.log(el + " " + inx)
          // console.log(typeof el + " " + this.typeList[inx].header + this.typeList[inx].type)
          if (typeof el != this.typeList[inx].type)
            valid = false
          if (el < 0)
            element[inx] = 0;
        })
        if (valid && this.graphContent.data.length < 1000)
          this.graphContent.data.push(element)
      }
    });

    this.graphContent.attributes.forEach(attribute => {
      attribute.headers = []
    });
    this.graphContent.attributes.forEach(attribute => {
      this.typeList.forEach(header => {
        if (attribute.types.includes(header.type)){
          attribute.headers.push(header)
        }
      });
    }); 
  }

  saveGraph() {

    this.errorSaved = false;
    this.saved = false;
    this.saveSpinner = true;

    // Get definitive colors
    var colors = [];
    var figure = document.querySelector("#figure > svg > g");
    var elements;
    
    if(this.graphContent.type == "bar")
      elements = figure.getElementsByTagName("rect");
    else if (this.graphContent.type == "pie" || this.graphContent.type == "donut")
      elements = figure.getElementsByTagName("path");

    Array.prototype.forEach.call(elements, function(el) {
      colors.push(el.getAttribute("fill"));
    })

    this.graphContent.color = colors;

    // Call service save method
    this.graphService.save(this.graphContent).subscribe(
      data => {
        this.saved = true;
      },
      error => {
        this.saveSpinner = false;
        this.errorSaved = true;
        console.log("Error from observable", error)
      },
      () => { this.saveSpinner = false; })
  }

  changeAttributes(item, data) {
    
    this.graphContent.attributes.forEach(el => {
      if (el.name == item) {
        el.value = data
      }
    })

    if (this.graphContent.attributes.filter(el => el.required).every(el => el.value)){
      this.requiredItems = true;
      this.activatePanel("#v-pills-style-tab")
    }
  }

  // ------ 1 -------
  changeType(value) {

    this.fileUploaded = false;
    this.saved = false;
    this.requiredItems = false;

    this.graphContent = {
      id: null, 
      type: '',
      title: 'Sin título',
      data: [],
      color: [],
      width: 1000,
      height: 1000,
      attributes: [],
      owner: ''
    };

    if(document.getElementById("attributes") != null)
      document.getElementById("attributes").outerHTML = "";

    if (this.graphList.find(el => el.type == value.type)) {
      this.ready = true;
      this.graphContent.type = value.type
            
      // Activar panel de datos
      this.activatePanel("#v-pills-data-tab")

      this.loadComponent();
    }
    else {
      console.log("La opción escogida no es válida")
    }
  }

  randomColors(){
    this.genericGraphRef.instance.randomColors();
  }

  saveSVG() {
    if (this.created)
      this.genericGraphRef.instance.saveSVG();
  }

  savePNG() {
    if (this.created)
      this.genericGraphRef.instance.savePNG();
  }

  savePDF() {
    if (this.created)
      this.genericGraphRef.instance.savePDF();
  }

  ngOnDestroy() {
    if (this.genericGraphRef != undefined)
      this.genericGraphRef.destroy();
  }
}