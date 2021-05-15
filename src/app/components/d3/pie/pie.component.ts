import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GraphContent } from 'src/app/models/graphContent';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.css']
})
export class PieComponent implements OnInit {

  @Input() graphContent: GraphContent = { id: null, type: 'pie', title: 'Sin título', data: [], color: [], width: 400, height: 700, attributes: [], owner: 'guest' };

  private svg;
  private margin = 50;
  private width = 750;
  private height = 600;
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;
  private selection;

  constructor() {
   }

  ngOnInit(): void { }

  loadComponent() {
    this.graphContent.attributes = new Array();
    this.graphContent.attributes.push({ name: 'Arcs', required: true, types: ['number'], headers: [], value: [] = new Array() })
    this.graphContent.attributes.push({ name: 'Label', required: false, types: ['string', 'number'], headers: [], value: null })
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

  private createSvg(): void {
    this.svg = d3.select("figure#figure")
      .append("svg")
      .attr("id", "svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.width / 2 + "," + this.height / 2 + ")"
      );
  }

  changeColors() {
    d3.selectAll("path")
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

  private drawChart(): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.Arcs));

    // Build the pie chart
    this.svg
      .selectAll('pieces')
      .data(pie(this.selection))
      .enter()
      .append('path')
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(this.radius)
      )
      .attr("fill", ((d, inx) => {
        if(this.graphContent.color.length != 0)
          return this.graphContent.color[inx];
        else
          return this.randomColors();
      }))
      .attr("stroke", "#121926")
      .style("stroke-width", "1px");

    // Add labels
    const labelLocation = d3.arc()
      .innerRadius(100)
      .outerRadius(this.radius);

    this.svg
      .selectAll('pieces')
      .data(pie(this.selection))
      .enter()
      .append('text')
      .text(d => d.data.Label)
      .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
      .style("text-anchor", "middle")
      .style("font-size", 15);
  }
}