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
import { DEMOFILES } from 'src/app/models/demoFiles';
import { HttpClient } from '@angular/common/http';
import cars from '../../../../assets/files/cars.json';
import { parse } from '@fortawesome/fontawesome-svg-core';
import { CoordinatesModule } from 'ngx-color';
import * as events from 'events';

type HeaderType = { header: string; type: string };

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

  headerRow: any[] = [];
  parsedData;

  typeIcon = faChartBar;
  dataIcon = faTable;
  styleIcon = faPalette;
  exportIcon = faShareSquare;
  animationsIcon = faStar;
  spinnerIcon = faSpinner;
  downloadIcon = faDownload;
  infoIcon = faInfoCircle;
  

  genericGraphRef: ComponentRef<any>;

  titleForm: FormGroup;
  styleForm: FormGroup;
  graphForm: FormGroup;
  attributeForm: FormGroup;

  title: String = 'Sin título';
  graphList: Graph[] = GRAPHS;
  formattedMessage: String;
  username: String;

  fileList = DEMOFILES;

  fileChoosenToDownload: boolean = false;
  fileUpload: boolean = false;
  fileToUpload: File = null;
  fileUploaded: boolean = false;
  requiredItems: boolean = false;
  invalidFile: boolean = false;
  showSpinner: boolean = false;
  showSpinnerDemo: boolean = false;
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
    width: 500,
    height: 500,
    attributes: [],
    owner: '',
    publish: false,
     nlines: null
  };

  limitElements: number = 0;
  parsed;
  fileResult: any;

  backgroundColor = "";

  @ViewChild("genericGraphContainer", { read: ViewContainerRef }) GenericGraphContainer;

  constructor(private resolver: ComponentFactoryResolver, private http: HttpClient, private formBuilder: FormBuilder, private papa: Papa, private cdRef: ChangeDetectorRef, private titleService: Title, private graphService: GraphService, private tokenService: TokenStorageService) {
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
      var div = document.getElementById("svg");
      div.style.backgroundColor = value;
      this.backgroundColor = value;
      this.updateGraphContent();
    });
    this.styleForm.controls['width'].valueChanges.subscribe(value => {
      this.graphContent.width = value;
      this.updateGraphContent();
    });

    this.styleForm.controls['height'].valueChanges.subscribe(value => {
      this.graphContent.height = value;
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
    var dataBackUp;
    if (this.graphContent.nlines > 0) {
      var aux = [];
      // var bool = confirm("Este fichero es demasiado grande y la gráfica puede no visualizarse correctamente. Se va a proceder a limitar los datos a 100 elementos. ¿Deseas continuar?")

      for (let i = 0; i < this.graphContent.nlines + 1 && i < this.graphContent.data.length; i++) {
        aux.push(this.graphContent.data[i])
      }
      dataBackUp = this.graphContent.data
      this.graphContent.data = aux;
    }


    this.saved = false;
    if (this.isLoggedIn) {
      this.username = this.tokenService.getUsername();
      this.graphContent.owner = this.username
    }

    if (document.querySelector('#svg')) {
      document.querySelector('#svg').remove();
    }

    // Si hay una gráfica creada anteriormente se borra
    // if (document.querySelector('#svg')) {
    //   document.querySelector('#svg').remove();
    // }

    // Mostrar el spinner mientras se crea la gráfica
    this.showSpinnerGraph = true;

    setTimeout(() => {
      this.genericGraphRef.instance.createComponent();
      this.showSpinnerGraph = false;
      if (document.getElementById('svg')) {
        this.created = true;

        if (this.backgroundColor != "") {
          var div = document.getElementById("svg");
          div.style.backgroundColor = this.backgroundColor;
        }
        this.saveColors();

        // Activar panel de estilo, animaciones y exportar
        this.activatePanel("#v-pills-export-tab")
        this.activatePanel("#v-pills-animations-tab")

      } else {
        console.log('The element does not exists in the page.')
      }
      if (this.graphContent.nlines > 0){
        this.graphContent.nlines = this.graphContent.nlines
        this.graphContent.data = dataBackUp;
      }
    });

  }

  updateGraphContent() {
    if (this.genericGraphRef) {
      this.genericGraphRef.instance.graphContent = this.graphContent
    }
  }

  // ------- 2 ------- Comprobar el nombre y extensión del fichero especificado
  previewFile(event) {

    this.fileResult = event.target
    // console.log(this.graphContent)

    var files: FileList;
    files = event.target.files


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

  resize() {
    this.saveColors()
    this.createComponent();
  }


  parseData() {
    return new Promise((resolve, reject) => {
      var aux;
      const reader = new FileReader();
      reader.onload = () => {
        aux = reader.result
        resolve(JSON.parse(aux))

      };
      reader.onerror = reject;
      reader.readAsText(this.fileResult.files.item(0));
    });
  }

  getJsonFromFile(eventTarget) {


    function readFile(file) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result)
        };
        reader.onerror = reject;
        reader.readAsText(eventTarget.files.item(0));
      });
    }
  }

  convertJsonToArray(parsed) {
    var keys = [];
    if (parsed != null && parsed != undefined) {
      var auxParse = []
      for (var k in parsed[0]) keys.push(k);

      auxParse.push(keys);

      var array = Object.keys(parsed).map((key) => [Number(key), parsed[key]]);
      for (var i = 0; i < array.length; i++) {

        var row = [];
        for (var j = 0; j < keys.length; j++)
          row.push(array[i][1][keys[j]])

        auxParse.push(row)
      }
      this.parsedData = auxParse
      this.showSpinner = false;
      return auxParse
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
      this.showSpinner = true;
      setTimeout(() => {
        if (this.genericGraphRef.instance.container) {

          if (this.fileToUpload.name.endsWith(".json") && this.graphContent.type == "dendrogram") {
            this.showSpinner = false;
            setTimeout(() => {
              this.parseData().then((successMessage) => {
                this.graphContent.data = successMessage;
                this.graphContent.attributes.push(undefined)
                this.activatePanel("#v-pills-style-tab")
                this.activatePanel("#v-pills-animations-tab")
                this.activatePanel("#v-pills-export-tab")

                this.genericGraphRef.instance.createComponent();
                this.created = true;
              });
            })
          }
          else {
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
        if (attribute.types.includes(header.type)) {
          attribute.headers.push(header)
        }
      });
    });

   



  }

  saveColors() {
    var colors = [];
    var figure = document.querySelector("#figure > svg > g");
    var elements;

    if (figure != null) {
      if (this.graphContent.type == "bar")
        elements = figure.getElementsByTagName("rect");
      else if (this.graphContent.type == "pie" || this.graphContent.type == "donut")
        elements = figure.getElementsByTagName("path");
      else if (this.graphContent.type == "scatter") {
        elements = figure.getElementsByTagName("circle");
      }
      else if (this.graphContent.type == "box") {
        elements = figure.getElementsByTagName("rect");
      }
      else if (this.graphContent.type == "dendrogram") {
        elements = figure.getElementsByTagName("path");
      }
      console.log(elements)

      Array.prototype.forEach.call(elements, function (el) {
        colors.push(el.getAttribute("fill"));
      })
      this.graphContent.color = colors;

    }

  }

  saveGraph() {

    this.errorSaved = false;
    this.saved = false;
    this.saveSpinner = true;

    // Get definitive colors
    this.saveColors();

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

    if (this.graphContent.attributes.filter(el => el.required).every(el => el.value)) {
      this.requiredItems = true;
      this.activatePanel("#v-pills-style-tab")
    }
  }

  chooseFile(item) {
    this.showSpinnerDemo = true;

    var array = item.split(',');
    this.http
      .get(this.fileList.find(el => el.name == item).path).subscribe((data) => console.log(data))
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
      owner: '',
      publish: false,
       nlines: null
    };

    if (document.getElementById("attributes") != null)
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

  setDownload(value) {
    let path = this.fileList.find(file => file.name === value).path;
    this.fileChoosenToDownload = true
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = 'assets/file';
    link.download = path;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  reset(id) {
    var el = id.replace(" ", "\\ ")
    var attribute = this.graphContent.attributes.find(e => e.name == id)
    if (attribute != null || attribute != undefined) {
      attribute.value = "";
      if (attribute.required == true)
        this.requiredItems = false;
    }
    $("#" + el).val('default');
  }

  randomColors() {
    setTimeout(() => {
      this.genericGraphRef.instance.randomColors();
      this.saveColors();
    });
    setTimeout(() => {
      this.saveColors();
    });
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