import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faTable } from '@fortawesome/free-solid-svg-icons';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { faShareSquare } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import * as d3 from 'd3';
import { BarComponent } from '../bar/bar.component';
import { PruebaComponent } from '../prueba/prueba.component';
declare const myTest: any;
import Canvg from 'canvg';


@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

  typeIcon = faChartBar;
  dataIcon = faTable;
  styleIcon = faPalette;
  exportIcon = faShareSquare;
  animationsIcon = faStar;
  downloadIcon = faDownload;
  color: String;

  // @ViewChild("pruebaContainer", { read: ViewContainerRef }) container;
  @ViewChild("barContainer", { read: ViewContainerRef }) container;

  // @ViewChild(BarComponent ) child: BarComponent ; 

  componentRef: ComponentRef<BarComponent>;
  titleForm;
  colorForm;
  name = new FormControl('');
  title: String;

  formattedMessage: String;


  constructor(private resolver: ComponentFactoryResolver, private formBuilder: FormBuilder,) { }

  ngOnInit(): void {
    this.titleForm = this.formBuilder.group({
      title: ''
    });
    this.colorForm = this.formBuilder.group({
      color: ''
    });

  }


  onFocusOutEvent(event: any) {
    this.title = event.target.value;
    console.log(event.target.value);
  }

  onFocusOutEventColor(event: any) {
    console.log(event.target.value);
    this.componentRef.instance.changeColor(event.target.value)
  }

  createComponent(type) {

    console.log(this.title)
    this.container.clear();
    const factory: ComponentFactory<BarComponent> = this.resolver.resolveComponentFactory(BarComponent);
    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.output.subscribe(event => console.log(event));
    this.componentRef.instance.changeTitle(this.title)

    // console.log(type)
    // this.container.clear(); 
    // const factory: ComponentFactory<PruebaComponent> = this.resolver.resolveComponentFactory(PruebaComponent);
    // this.componentRef = this.container.createComponent(factory);

    // this.componentRef.instance.type = type;
    // this.componentRef.instance.title = this.titleForm.title;

    // this.componentRef.instance.output.subscribe(event => console.log(event));

    // this.componentRef.instance.hola()
  }

  somethingChanged() {

  }



  // changeTitle(){
  //   this.componentRef.instance.title = this.title
  // }

  onSubmit(value) {

  }

  getFigure() {
    console.log(document.querySelector("#figure"))
  }

  savePNG() {
    this.componentRef.instance.savePNG();



  }



  savePDF() {
    console.log("save as pdf")
    this.componentRef.instance.savePDF();
  }

  saveSVG() {
    this.componentRef.instance.saveSVG();
  }




  ngOnDestroy() {
    this.componentRef.destroy();
  }

}
