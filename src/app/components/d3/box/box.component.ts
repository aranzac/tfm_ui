import { Component, Input, OnInit } from '@angular/core';
import { GraphContent } from 'src/app/models/graphContent';
import * as d3 from 'd3';
import { nest } from 'd3-collection';
import * as d3Collection from 'd3-collection';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.css']
})
export class BoxComponent implements OnInit {

  @Input() graphContent: GraphContent = { id: null, type: 'box', title: '', data: [], color: [], width: 400, height: 400, attributes: [], owner: 'guest', publish: false , nlines: null};

  private svg;
  private margin = 50;
  private width = 750;
  private height = 400;
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;
  private selection = [];
  private groupedData = [{ "Species": 1 }];

  constructor() { }

  ngOnInit(): void {
  }

  loadComponent() {
    this.graphContent.attributes = new Array();
    this.graphContent.attributes.push({ name: 'y', label: 'Eje Y', required: false, types: ['string'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'size', label: 'Tamaño', required: true, types: ['number'], headers: [], value: null })
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
    this.createSvg();
    this.drawChart();
  }


  private createSvg() {

    this.svg = d3.select("figure#figure")
      .append("svg")
      .attr("id", "svg")
      .attr("width", this.width + this.margin + this.margin)
      .attr("height", this.height + this.margin + this.margin)
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }
  
  private randomColors(){
    var letters = '0123456789ABCDEF';
    var color = '#'
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  changeColors() {
    d3.selectAll("svg g rect")
      .transition()
      .duration(1000)
      .style("fill", (d => this.randomColors()))
  }

  private drawChart() {

    var data = []
    data.push(this.selection.map((x) => { data.push(x.size) }))
   var data_sorted = data.sort(d3.ascending)
    var q1 = d3.quantile(data_sorted, .25)
    var median = d3.quantile(data_sorted, .5)
    var q3 = d3.quantile(data_sorted, .75)
    var interQuantileRange = q3 - q1
    var min = q1 - 1.5 * interQuantileRange
    var max = q1 + 1.5 * interQuantileRange
    // Show the Y scale
    var y = d3.scaleLinear()
      .domain([min, max])
      .range([this.height, 0]);
    this.svg.call(d3.axisLeft(y))

    // a few features for the box
    var center = 200
    var width = 100

    // Show the main vertical line
    this.svg
      .append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min))
      .attr("y2", y(max))
      .attr("stroke", "black")

    // Show the box
    this.svg
      .append("rect")
      .attr("x", center - width / 2)
      .attr("y", y(q3))
      .attr("height", (y(q1) - y(q3)))
      .attr("width", width)
      .attr("stroke", "black")
      .style("fill", this.randomColors())

    // show median, min and max horizontal lines
    this.svg
      .selectAll("toto")
      .data([min, median, max])
      .enter()
      .append("line")
      .attr("x1", center - width / 2)
      .attr("x2", center + width / 2)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "black")
  }
}



// d => x(d.x)+ 15)