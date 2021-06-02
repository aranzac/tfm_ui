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

  @Input() graphContent: GraphContent = { id: null, type: 'box', title: '', data: [], color: [], width: 400, height: 700, attributes: [], owner: 'guest' };

  private svg;
  private margin = 50;
  private width = 750;
  private height = 600;
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;
  private selection = [];
  private groupedData = [{"Species": 1}];

  constructor() { }

  ngOnInit(): void {
  }

  loadComponent() {
    this.graphContent.attributes = new Array();
    this.graphContent.attributes.push({ name: 'y', label: 'Eje Y', required: false, types: ['string'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'size', label: 'Tamaño',required: true, types: ['number'], headers: [], value: null })
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
    console.log(this.selection)

    console.log(this.graphContent.data)
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

  private drawChart() {


  }
}
