import { AfterViewInit, Attribute, ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, EventEmitter, Input, OnInit, Output, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
import html2canvas from 'html2canvas';
import { GRAPHS } from 'src/app/models/graph-data';
import { GraphContent } from 'src/app/models/graphContent';
import { Graph } from 'src/app/models/Graphs';
import jspdf from 'jspdf';

@Component({
  selector: 'generic',
  templateUrl: './generic-graph.component.html',
  styleUrls: ['./generic-graph.component.css']
})
export class GenericGraphComponent<T> implements OnInit, AfterViewInit {

  @Output() output = new EventEmitter();
  @ViewChild("container", { read: ViewContainerRef }) container;

  @Input() component: Type<T>

  @Input() get graphContent(): GraphContent {
    return this._graphContent;
  }

  private _graphContent: GraphContent;
  private created: boolean = false;

  genericGraphRef: ComponentRef<any>;
  svgDataURL;
  // Setter y getter para forzar el cambio de la variable
  set graphContent(value: GraphContent) {
    console.log("GraphContent setter", value);
    this._graphContent = value;
    if (this.created)
      this.onChanges();
  }

  constructor(private resolver: ComponentFactoryResolver, private cdRef: ChangeDetectorRef) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.loadComponent();
  }

  onChanges() {
    if (this.genericGraphRef)
      this.genericGraphRef.instance.update();
  }

  loadComponent() {

    this.container.clear();
    let aux = this.component;
    const factory: ComponentFactory<typeof aux> = this.resolver.resolveComponentFactory<any>(this.component);

    this.genericGraphRef = this.container.createComponent(factory);
    this.genericGraphRef.instance.loadComponent();

    setTimeout(() => {
      this.graphContent = this.genericGraphRef.instance.graphContent;
    });
  }

  createComponent() {
    this.created = true;
    this.genericGraphRef.instance.graphContent = this.graphContent
    console.log(this.graphContent.data)
    this.genericGraphRef.instance.generate()
  }


  changeColor(color) {
    this.genericGraphRef.instance.changeColor(color);
  }

  // Actualiza el contenido A LO MEJOR NO HACE FALTA
  updateContent(content: GraphContent) {
    this.graphContent = content;
  }


  savePNG() {
    // Obtener la figura creada (es importante adjuntar la version y el xmlns)
    var html = document.querySelector("#figure").innerHTML;

    // URL EN SVG. Convertir la figura en una url de datos base64
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);

    // Para obtener el PNG debemos cargar en una imagen y luego esa imagen en un canvas. Asi se podra coger el dataurl de png del canvas
    var canvas = document.querySelector("canvas"), context = canvas.getContext("2d");

    var image = new Image;
    image.src = imgsrc;

    var titulo = this.graphContent.title
    image.onload = function () {
      context.drawImage(image, 0, 0);

      // URL EN PNG 
      var canvasdata = canvas.toDataURL("image/png");

      var a = document.createElement("a");
      a.setAttribute("href", canvasdata)
      a.setAttribute("download", titulo.replace(/\s/g, '') + ".png")
      a.click(); // Simula un click
    }
  }


  saveSVG() {
    // Obtener la figura creada (es importante adjuntar la version y el xmlns)
    var html = document.querySelector("#figure").innerHTML;

    // URL EN SVG. Convertir la figura en una url de datos base64
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
    this.svgDataURL = imgsrc;
    var titulo = this.graphContent.title
    var a = document.createElement("a");
    a.setAttribute("href", imgsrc)
    a.setAttribute("download", titulo.replace(/\s/g, '') + ".svg")
    a.click();
  }

  savePDF() {
    var script = <HTMLElement>document.querySelector("figure");
    var titulo = this.graphContent.title
    html2canvas(script).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jspdf('l', 'cm', 'a4'); //Generates PDF in landscape mode
      // let pdf = new jspdf('p', 'cm', 'a4'); //Generates PDF in portrait mode
      pdf.addImage(contentDataURL, 'PNG', 0, 0, this.graphContent.width / 25, this.graphContent.height / 25);
      pdf.save(titulo.replace(/\s/g, '') + '.pdf');
    });
  }

  ngOnDestroy() {
    if (this.genericGraphRef != undefined)
      this.genericGraphRef.destroy();
  }
}