import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GraphContent } from 'src/app/models/graphContent';
import { D3Service, D3, Selection } from 'd3-ng2-service';
// import d3 from './../../../../assets/d3.v4.js';
import { pie } from 'd3';
import * as d3 from 'd3';
import { groupBy } from 'rxjs/internal/operators/groupBy';
import * as _ from 'lodash';

@Component({
  selector: 'app-donut',
  templateUrl: './donut.component.html',
  styleUrls: ['./donut.component.css']
})
export class DonutComponent implements OnInit {


  private d3: D3;
  @Input() graphContent: GraphContent = { id: null, type: 'donut', title: 'Sin título', data: [], color: ['#682626', '#682222'], width: 600, height: 500, attributes: [], owner: 'guest' };
  @Input() graphForm: FormGroup;

  private svg;
  private margin = 50;
  private width = 800;
  private height = 500;
  private radius = 200;
  private selection;

  private data = [{ name: "", value: "" }]


  constructor() {
  }

  ngOnInit(): void {
  }

  loadComponent() {
    this.graphContent = { id: null, type: 'donut', title: 'Sin título', data: [], color: [], width: 450, height: 450, attributes: [], owner: 'guest' };
    this.graphContent.attributes = new Array();
    this.graphContent.attributes.push({ name: 'name', required: true, types: ['string'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'value', required: true, types: ['number'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'color', required: false, types: ['string'], headers: [], value: null })
  }

  arc() {
    const radius = Math.min(this.width, this.height) / 2;
    return d3.arc().innerRadius(radius * 0.67).outerRadius(radius - 1);
  }



  groupBySomething(array, key) {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  };


  generate() {
    this.createSvg();
    this.drawPath();
  }

  createSvg() {
    this.svg = d3.select("figure").append("svg")
      .attr("id", "svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .append("g")
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2.5 + ")");
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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

  drawPath() {

    const header = this.graphContent.data[0]
    var colors = [];
    var names = []; 

    this.selection = this.graphContent.data.map(el => {
      var target = {};
      this.graphContent.attributes.forEach(at => {
        let index = header.findIndex((el) => el == at.value)
        target[at.name] = el[index]
      })
      return target;
    })
    this.selection.shift();

    this.selection.map(el => {
      el.color = this.getRandomColor();
    })

    // const colors = ['#1338BE', '#63C5DA', '#241571', '#52B2BF', '#2C3E4C', '#3944BC', '#016064'];

    this.selection.forEach(el => {
      colors.push(el.color);
      names.push(el.name);
    });

    var pie = d3.pie()
      .sort(null);

    var arc = d3.arc()
      .innerRadius(this.radius - 100)
      .outerRadius(this.radius - 50);

    var path = this.svg.selectAll("path")
      .data(pie(this.selection.map(d => d.value)));

    var pathEnter = path.enter().append("path")
    .attr("fill", ((d, inx) => {
      if(this.graphContent.color.length != 0)
        return this.graphContent.color[inx];
      else
        return this.randomColors();
    }))
      .attr("d", <any>arc);

    // Text
    var labelr = this.radius - this.radius *0.2
    var texts = path.enter().append("text")
    .attr("transform", function(d){
      var c = arc.centroid(d),
            x = c[0],
            y = c[1],
            h = Math.sqrt(x*x + y*y);
        return "translate(" + (x/h * labelr) +  ',' +
           (y/h * labelr) +  ")"; 
    })
    .attr("dy", ".25em")
    .attr("text-anchor", function(d) {
        return (d.endAngle + d.startAngle)/2 > Math.PI ?
            "end" : "start";
    })
    .text(function(d, i) { return names[i] });    
  }
}
