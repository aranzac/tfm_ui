import { Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { D3 } from 'd3-ng2-service';
import { GraphContent } from 'src/app/models/graphContent';

@Component({
  selector: 'app-dendrogram',
  templateUrl: './dendrogram.component.html',
  styleUrls: ['./dendrogram.component.css']
})
export class DendrogramComponent implements OnInit {


  private d3: D3;
  @Input() graphContent: GraphContent = { id: null, type: 'dendrogram', title: 'Sin título', data: [], color: ['#682626'], width: 600, height: 500, attributes: [], owner: 'guest', publish: false , nlines: null};

  private svg;
  private margin = 10;
  private width = 800;
  private height = 500;
  private radius = 200;
  private selection;

  constructor() { }

  ngOnInit(): void {
  }

  loadComponent() {
    this.graphContent = { id: null, type: 'dendrogram', title: 'Sin título', data: [], color: [], width: 800, height: 500, attributes: [], owner: 'guest', publish: false, nlines: null };
    this.graphContent.attributes = new Array();
    // this.graphContent.attributes.push({ name: 'hierarchy', label: 'Jerarquía', required: false, types: ['string'], headers: [], value: [] })
    // this.graphContent.attributes.push({ name: 'value', label: 'Valor',  required: true, types: ['number'], headers: [], value: null })
  }

  generate() {
    this.createSvg()
    this.drawChart();
  }

  createSvg() {
    // append the svg object to the body of the page
    this.svg = d3.select("figure#figure")
      .append("svg")
      .attr("width", this.graphContent.width)
      .attr("height", this.graphContent.height)
      .append("g")
      .attr("transform", "translate(20,0)");

  }

  drawChart() {

    // Create the cluster layout:
    var cluster = d3.cluster()
      .size([this.graphContent.height, this.graphContent.width - 150]);  // 100 is the margin I will have on the right side

    // Give the data to this cluster layout:
    var root = d3.hierarchy(this.graphContent.data, d => {
      return d.children;
    });
    cluster(root);


    // Add the links between nodes:
    this.svg.selectAll('path')
      .data(root.descendants().slice(1))
      .enter()
      .append('path')
      .attr("d", function (d) {
        return "M" + d.y + "," + d.x
          + "C" + (d.parent.y + 50) + "," + d.x
          + " " + (d.parent.y + 150) + "," + d.parent.x
          + " " + d.parent.y + "," + d.parent.x;
      })
      .style("fill", 'none')
      .attr("stroke", '#ccc')


    // Add a circle for each node.
    this.svg.selectAll("g")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")"
      })
      .append("circle")
      .attr("r", 7)
      .style("fill", "#69b3a2")
      .attr("stroke", "black")
      .style("stroke-width", 2)


    this.svg.selectAll("g").append("text")
      .attr("dx", function (d) { return d.children ? -8 : 8; })
      .attr("dy", 3)
      .style("text-anchor", function (d) { console.log(d); return d.children ? "end" : "start"; })
      .text(function (d) { return d.data.name; });
  }

}
