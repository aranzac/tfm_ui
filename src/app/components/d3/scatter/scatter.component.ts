import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GraphContent } from 'src/app/models/graphContent';

@Component({
  selector: 'app-scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.css']
})
export class ScatterComponent implements OnInit {


  @Input() graphContent: GraphContent = { id: null, type: 'scatter', title: 'Sin título', data: [], color: [], width: 600, height: 500, attributes: [], owner: 'guest' };

  private svg;
  private margin = 50;
  private width = 600 - (this.margin * 2);
  private height = 400 - (this.margin * 2);
  private colors;
  private selection;
  max;
  min;
  step;

  private data = [
    {"Framework": "Vue", "Stars": "166443", "Released": "2014"},
    {"Framework": "React", "Stars": "150793", "Released": "2013"},
    {"Framework": "Angular", "Stars": "62342", "Released": "2016"},
    {"Framework": "Backbone", "Stars": "27647", "Released": "2010"},
    {"Framework": "Ember", "Stars": "21471", "Released": "2011"},
  ];

  constructor() { }

  ngOnInit(): void { }

  loadComponent() {
    this.graphContent.attributes = new Array();
    this.graphContent.attributes.push({ name: 'x',label: 'Eje x', required: true, types: ['number', 'date'], headers: [], value: [] = new Array() })
    this.graphContent.attributes.push({ name: 'y', label: 'Eje y', required: true, types: ['date', 'number'], headers: [], value: [] = new Array() })
    this.graphContent.attributes.push({ name: 'label',label: 'Etiqueta', required: false, types: ['string', 'number'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'size', label: 'Tamaño', required: false, types: ['number'], headers: [], value: null })
  }

  generate() {
    const header = this.graphContent.data[0]

    this.selection = this.graphContent.data.map(el => {
      var target = {};

      this.graphContent.attributes.forEach(at => {
        let index = header.findIndex((el) => el == at.value)
        target[at.name] = el[index]
      })
      return target;
    })

    this.selection.shift();
    console.log(this.graphContent)
    this.createSvg();
    this.drawPlot();
  }

  private createSvg(): void {
    this.svg = d3.select("figure#figure")
      .append("svg")
      .attr("id", "svg")
      .attr("width", this.width + 100 + (this.margin * 2))
      .attr("height", this.height + 100 + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  changeColors() {
    d3.selectAll("svg g rect")
      .transition()
      .duration(1000)
      .style("fill", (d => this.randomColors()))
  }

  randomColors(){
    var letters = '0123456789ABCDEF';
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  private drawPlot(): void {

    let data = this.selection
    this.max = Math.max.apply(Math, this.selection.map(function (el) { return el.y; }))
    this.min = Math.min.apply(Math, this.selection.map(function (el) { return el.y; }))
    var maxX = Math.max.apply(Math, this.selection.map(function (el) { return el.x; }))
    console.log(this.max + " " + this.min)

    const x = d3.scaleLinear()
      .domain([0, maxX])
      .range([0, this.width]);

    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    const y = d3.scaleLinear()
      .domain([0, this.max + this.max+2])
      .range([this.height, 0]);
    this.svg.append("g")
      .call(d3.axisLeft(y));

    const dots = this.svg.append('g');
    dots.selectAll("dot")
      .data(this.selection)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 7)
      .style("opacity", .5)
      .attr("fill", ((d, inx) => {
        if(this.graphContent.color.length != 0)
          return this.graphContent.color[inx];
        else
          return this.randomColors();
      }));

    dots.selectAll("text")
      .data(this.selection)
      .enter()
      .append("text")
      .text(d => d.label)
      .attr("x", d => x(d.x)+ 15)
      .attr("y", d => y(d.y) + 5)
  }
  

}
