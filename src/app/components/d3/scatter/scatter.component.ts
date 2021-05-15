import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GraphContent } from 'src/app/models/graphContent';

@Component({
  selector: 'app-scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.css']
})
export class ScatterComponent implements OnInit {


  @Input() graphContent: GraphContent = { id: 0, type: 'scatter', title: '', data: [], color: [], width: 400, height: 700, attributes: [], owner: 'guest' };

  private svg;
  private margin = 50;
  private width = 750 - (this.margin * 2);
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
    this.graphContent.attributes.push({ name: 'x', required: true, types: ['number', 'date'], headers: [], value: [] = new Array() })
    this.graphContent.attributes.push({ name: 'y', required: true, types: ['date', 'number'], headers: [], value: [] = new Array() })
    this.graphContent.attributes.push({ name: 'label', required: false, types: ['string', 'number'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'size', required: false, types: ['number'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'color', required: false, types: ['string', 'number'], headers: [], value: null })
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
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
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
      .style("fill", "#69b3a2");

    dots.selectAll("text")
      .data(this.selection)
      .enter()
      .append("text")
      .text(d => d.label)
      .attr("x", d => x(d.x)+ 15)
      .attr("y", d => y(d.y) + 5)
  }

}
