import { ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, Input, OnInit, Pipe, PipeTransform, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { faChartBar, faTable, faPalette, faShareSquare, faStar, faSpinner, faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Title } from "@angular/platform-browser";
import { GRAPHS } from 'src/app/models/graph-data';
import { Graph } from 'src/app/models/Graphs';
import { GenericGraphComponent } from '../../generic-graph/generic-graph.component';
import { GraphContent } from 'src/app/models/graphContent';
import { Papa } from 'ngx-papaparse';
import { GraphService } from 'src/app/services/graph.service';
import { TokenStorageService } from 'src/app/services/TokenStorageService';
import { of } from 'rxjs';

type HeaderType = { header: string; type: string };

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

  headerRow: any[] = [];

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
    type: '',
    title: 'Sin título',
    data: [],
    color: ['#6bc1d6'], // String | [String]
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
      console.log(value)
    });

    this.styleForm.controls['color'].valueChanges.subscribe(value => {
      this.graphContent.color = value;
      this.updateGraphContent();
    });
    this.styleForm.controls['width'].valueChanges.subscribe(value => {
      this.graphContent.width = value;
      console.log("changin width")
      this.updateGraphContent();
    });
    this.styleForm.controls['range'].valueChanges.subscribe(value => {
      console.log("changin range 1")

    });
    this.styleForm.controls['height'].valueChanges.subscribe(value => {
      this.graphContent.height = value;
      console.log("changin height")

      this.updateGraphContent();
    });
    this.graphForm.controls['type'].valueChanges.subscribe(value => {
      this.graphContent.type = value;

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

      // Cuando se crea correctamente el hijo (genericGraph)
      setTimeout(() => {
        if (this.genericGraphRef.instance.container) {

          // Llama al setter de graphContent
          this.graphContent = this.genericGraphRef.instance.graphContent;
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

    this.genericGraphRef.instance.createComponent();

    // Mostrar el spinner mientras se crea la gráfica
    this.showSpinnerGraph = true;


    setTimeout(() => {
      this.genericGraphRef.instance.createComponent();
      this.showSpinnerGraph = false;
    }, 0);

    // Si se ha creado el svg
    if (document.querySelector('#svg')) {
      this.created = true;

      // Activar panel de estilo, animaciones y exportar
      this.activatePanel("#v-pills-export-tab")
      this.activatePanel("#v-pills-animations-tab")
      this.activatePanel("#v-pills-style-tab")

    } else {
      console.log('The element does not exists in the page.')
    }
  }



  updateGraphContent() {
    if (this.genericGraphRef) {
      this.genericGraphRef.instance.graphContent = this.graphContent
    }
  }

  // Comprobar el nombre y extensión del fichero especificado
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

  // Cuando el fichero es válido, se parsea y se extraen las cabeceras y los valores dentro del graphContent.data
  uploadFile() {
    // Reset invalid condition
    this.invalidFile = false
    this.fileUploaded = false;

    //Borrar typelist para que no haya conflicto entre consultas distintas
    this.typeList.length = 0;

    if (this.fileUpload) {

      this.showSpinner = true;
      this.papa.parse(this.fileToUpload, {
        dynamicTyping: true, // Para que parsee numeros y boolean correctamente, y no como strings
        complete: parsedData => {

          // Guardar la primera fila con las etiquetas
          if (parsedData.data[0].every(el => typeof el == 'string')) {

            this.headerRow = parsedData.data[0]
            this.graphContent.data.push(parsedData.data[0])

            // Recorrer la segunda línea para guardar los tipos de cada campo
            parsedData.data[1].forEach((element, index) => {
              this.typeList.push({ header: this.headerRow[index], type: typeof element })
            });

            // Comprobar para cada elemento que coincide con el tipo
            parsedData.data.forEach((element, index) => {
              if (index != 0 && index != 1) {

                let valid = true;
                element.forEach((el, inx) => {
                  if (typeof el != this.typeList[inx].type)
                    valid = false

                  if (el < 0)
                    element[inx] = 0;
                })
                if (valid)
                  this.graphContent.data.push(element)
              }
            });
            this.fileUploaded = true;
          }
          else {
            this.invalidFile = true;
            this.fileUploaded = false;
            console.log("El fichero csv no incluye una fila de etiquetas de los campos")
          }
          this.showSpinner = false;

          // Borrar cabeceras para que no aparezcan las de la consulta anterior
          this.graphContent.attributes.forEach(attribute => {
            attribute.headers = []
          })
          this.graphContent.attributes.forEach(attribute => {
            this.typeList.forEach(header => {
              if (attribute.types.includes(header.type))
                attribute.headers.push(header)
            });
          });

        }
      });

      this.graphContent = this.genericGraphRef.instance.graphContent;

    }
  }

  // this.saveSpinner = false;

  saveGraph() {

    this.errorSaved = false;
    this.saved = false;
    this.saveSpinner = true;
  
      this.graphService.save(this.graphContent).subscribe(
        data => {
          this.saved = true;
        },
        error => {
          this.errorSaved = true;
          console.log("error from observable", error)
        } ,
        () => { this.saveSpinner = false; })
  }

  changeTitle() {

  }

  changeAttributes(item, data) {
    this.graphContent.attributes.forEach(el => {
      if (el.name == item) {
        el.value = data
      }
    })

    if (this.graphContent.attributes.filter(el => el.required).every(el => el.value))
      this.requiredItems = true;
  }

  changeType(value) {

    this.saved = false;

    this.requiredItems = false;

    if (this.graphList.find(el => el.type == value.type)) {
      setTimeout(() => {
        this.ready = true;
        this.graphContent.type = value.type
      }, 0);


      // Activar panel de datos
      this.activatePanel("#v-pills-data-tab")
    }
    else {
      console.log("La opción escogida no es válida")
    }

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
    if (this.componentRef != undefined)
      this.componentRef.destroy();
  }
}