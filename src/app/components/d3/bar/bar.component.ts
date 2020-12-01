import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as d3 from 'd3';
import * as svg from 'save-svg-as-png';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent implements OnInit {

  
  @Input() title: String = "Sin título";
  @Output() output = new EventEmitter();


  private data = [
    { "Framework": "Vue", "Stars": "166443", "Released": "2014" },
    { "Framework": "React", "Stars": "150793", "Released": "2013" },
    { "Framework": "Angular", "Stars": "62342", "Released": "2016" },
    { "Framework": "Backbone", "Stars": "27647", "Released": "2010" },
    { "Framework": "Ember", "Stars": "21471", "Released": "2011" },
  ];

  private svgDataURL;
  private pngDataURL;
  private svg;
  private margin = 50;
  // Parametrables
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  constructor() { }

  ngOnInit(): void {
    this.createSvg();
    this.drawBars(this.data);
  }

  private createSvg(): void {
    this.svg = d3.select("figure#figure")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[]): void {

    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.Framework))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");


    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, 200000])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.Framework))
      .attr("y", d => y(d.Stars))
      .attr("width", x.bandwidth())
      .attr("height", (d) => this.height - y(d.Stars))
      .attr("fill", "#d04a55");
    console.log(this.svg)
  }

  changeTitle(title) {
    console.log("cambiando titulo:  " + title)
    console.log(this.svg)
    // this.svg.text(title);
    this.title = title
  }

  changeColor(color) {
    this.svg.selectAll("rect").style("fill", color)
  }

  private binary() {
    var byteString = atob(document.querySelector("canvas").toDataURL().replace(/^data:image\/(png|jpg);base64,/, "")); //wtf is atob?? https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var dataView = new DataView(ab);
    var blob = new Blob([dataView], { type: "image/png" });
    var DOMURL = self.URL || self.webkitURL || self;
    var newurl = URL.createObjectURL(blob);

    var img = '<img src="' + newurl + '">';
    d3.select("#img").html(img);
  }



  savePNG() {

    // Obtener la figura creada (es importante adjuntar la version y el xmlns)
    var html = document.querySelector("#figure").innerHTML;

    // URL EN SVG. Convertir la figura en una url de datos base64
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
    this.svgDataURL = imgsrc;

    // Para obtener el PNG debemos cargar en una imagen y luego esa imagen en un canvas. Asi se podra coger el dataurl de png del canvas
    var canvas = document.querySelector("canvas"), context = canvas.getContext("2d");

      // URL EN PNG 
      var canvasdata = canvas.toDataURL("image/png");

      var a = document.createElement("a");
      a.setAttribute("href", canvasdata)
      a.setAttribute("download", "sample.png")
      a.click(); // Simula un click

  }




  saveSVG() {
    // Obtener la figura creada (es importante adjuntar la version y el xmlns)
    var html = document.querySelector("#figure").innerHTML;

    // URL EN SVG. Convertir la figura en una url de datos base64
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
    this.svgDataURL = imgsrc;

    var a = document.createElement("a");
    a.setAttribute("href", imgsrc)
    a.setAttribute("download", "sample.svg")
    a.click();

    var html = document.querySelector("#figure").innerHTML
  }

  savePDF() {
    this.pdf("figure")
  }

  private pdf (id)  {
    var script = <HTMLElement>document.querySelector(id);
    html2canvas(script).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/png')  
      let pdf = new jspdf('l', 'cm', 'a4'); //Generates PDF in landscape mode
      // let pdf = new jspdf('p', 'cm', 'a4'); //Generates PDF in portrait mode
      pdf.addImage(contentDataURL, 'PNG', 0, 0, this.width/25, this.height/25);  
      pdf.save('plot.pdf');   
    }); 
  }

}


/*
BLOQUE FUNCIONA


 // Obtener la figura creada (es importante adjuntar la version y el xmlns)
    var html = document.querySelector("#figure").innerHTML;

    // URL EN SVG. Convertir la figura en una url de datos base64
    var imgsrc = 'data:image/svg+xml;base64,' + btoa(html);
    this.svgDataURL = imgsrc;

    // Insertar url en un elemento imagen. Ya con esto tendríamos la imagen en svg
    var img = '<img src="' + imgsrc + '">';
    d3.select("#svgdataurl").html(img);


    // Para obtener el PNG debemos cargar en una imagen y luego esa imagen en un canvas. Asi se podra coger el dataurl de png del canvas
    var canvas = document.querySelector("canvas"), context = canvas.getContext("2d");

    var image = new Image;
    image.src = imgsrc;
    image.onload = function () {
      context.drawImage(image, 0, 0);

      // URL EN PNG 
      var canvasdata = canvas.toDataURL("image/png");
      // this.pngDataURL = canvasdata


      
      var pngimg = '<img src="' + canvasdata + '">';
      d3.select("#pngdataurl").html(pngimg);

      var a = document.createElement("a");
      a.setAttribute("href", canvasdata)
      a.setAttribute("download", "sample.png")
      a.click();

      // var a = document.createElement("a");
      // a.download = "sample.png";
      // a.href = canvasdata;
      // a.click(); // simula un click . Esto no nos interesa


*/