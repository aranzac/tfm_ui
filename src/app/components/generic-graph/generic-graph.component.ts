import { AfterViewInit, Attribute, ChangeDetectorRef, Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, EventEmitter, Input, OnInit, Output, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';
import html2canvas from 'html2canvas';
import { GRAPHS } from 'src/app/models/graph-data';
import { GraphContent } from 'src/app/models/graphContent';
import { Graph } from 'src/app/models/Graphs';
import jspdf from 'jspdf';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import * as svg from 'save-svg-as-png';

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
  alertIcon = faExclamationTriangle;
  noDataAlert: boolean = false;


  // Setter y getter para forzar el cambio de la variable
  set graphContent(value: GraphContent) {
    this._graphContent = value;
    // if (this.created)
    // this.onChanges();
  }

  constructor(private resolver: ComponentFactoryResolver, private cdRef: ChangeDetectorRef) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.loadComponent();
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
      if (this.graphContent.data != null && this.graphContent.data.length != 0 && this.graphContent.attributes != null && this.graphContent.attributes.length != 0) {
        this.loadComponent();
        this.created = true;
        let nlines = this.graphContent.nlines
        if( nlines != null && nlines > 0){
          let aux = []
          for (let i = 0; i < nlines + 1 && i < this.graphContent.data.length; i++) {
            aux.push(this.graphContent.data[i])
          }
          this.graphContent.data = aux
        }
        this.genericGraphRef.instance.graphContent = this.graphContent

        this.genericGraphRef.instance.generate()
      }
      else
        this.noDataAlert = true;
  }

  changeColor(color) {
    this.genericGraphRef.instance.changeColor(color);
  }

  // Actualiza el contenido A LO MEJOR NO HACE FALTA
  updateContent(content: GraphContent) {
    this.graphContent = content;
  }

  randomColors() {
    this.genericGraphRef.instance.changeColors();
  }

  savePNG() {
    svg.saveSvgAsPng(document.getElementById("svg"), this.graphContent.title.replace(/\s/g, '') + ".png", { scale: 2 });
  }

  saveSVG() {

    var titulo = this.graphContent.title
    var svg = document.getElementById("svg");
    var serializer = new XMLSerializer();
    var source = serializer.serializeToString(svg);

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    var a = document.createElement("a");
    a.setAttribute("href", url)
    a.setAttribute("download", titulo.replace(/\s/g, '') + ".svg")
    a.click();
  }

  savePDF() {
    var script = <HTMLElement>document.querySelector("figure");
    var titulo = this.graphContent.title

    html2canvas(script).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/png')
      let pdf = new jspdf('l', 'mm', 'a4'); //Generates PDF in landscape mode
      // let pdf = new jspdf('p', 'cm', 'a4'); //Generates PDF in portrait mode
      pdf.addImage(contentDataURL, 'PNG', 0, 0, this.graphContent.width / 1.5, this.graphContent.height / 4.5);
      pdf.save(titulo.replace(/\s/g, '') + '.pdf');
    });
  }

  resetGeneric() {
    this.genericGraphRef = null;

  }

  ngOnDestroy() {
    if (this.genericGraphRef != undefined)
      this.genericGraphRef.destroy();
  }
}