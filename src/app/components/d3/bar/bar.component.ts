import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GraphContent } from 'src/app/models/graphContent';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tsv } from 'd3';

@Component({
  selector: 'bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})

export class BarComponent implements OnInit {

  @Input() graphContent: GraphContent = { id: null, type: 'bar', title: 'Sin título', data: [], color: [], width: 600, height: 400, attributes: [], owner: 'guest' };
  @Input() graphForm: FormGroup;

  selection: any;

  private svg;
  private margin = 50;
  private width = 600 - (this.margin * 2);
  private height = 400 - (this.margin * 2);
  max;
  min;
  step;

  range;

  // ----------- 1 ------------
  constructor(private formBuilder: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.graphForm = this.formBuilder.group({
      x: ['', { validators: [Validators.required], updateOn: "blur" }],
      height: ['', { validators: [Validators.required], updateOn: "blur" }],
      groups: ['', { validators: [], updateOn: "blur" }],
    });

  }

  // ----------- 2 ------------
  loadComponent() {

    this.graphContent = { id: null, type: 'bar', title: 'Sin título', data: [], color: [], width: 600, height: 500, attributes: [], owner: 'guest' };
    // Rellena los atributos con el nombre, si es obligatorio, los tipos que acepta y el campo elegido para ese atributo
    this.graphContent.attributes = new Array();
    this.graphContent.attributes.push({ name: 'x', label: 'Eje x', required: true, types: ['string', 'number'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'height', label: 'Altura' ,required: true, types: ['number'], headers: [], value: null })
    this.graphContent.attributes.push({ name: 'group', label: 'Grupo', required: false, types: ['string', 'number'], headers: [], value: null })
  }



  // ----------- 3 ------------
  ngOnInit() {}

  // ----------- 4 ------------
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

    // Borrar la gráfica anterior
    var elem = document.querySelector('#svg');
    if (elem)
      elem.parentNode.removeChild(elem);

    this.createSvg();
    console.log("CREATED")
    this.drawBars();

  }

  setRange(value: any) {
    this.range = value;

    this.cdRef.detectChanges();
    const y = d3.scaleLinear()
      .domain([value, this.max])
      .range([this.graphContent.height, 0])

    this.svg.selectAll("g")
      .transition().duration(1000)
      .call(d3.axisLeft(y));
  }

  private createSvg(): void {
    this.svg = d3.select("figure#figure")
      .append("svg")
      .attr("id", "svg")
      .attr("width", this.graphContent.width + 100 + (this.margin * 2))
      .attr("height", this.graphContent.height + 100 + (this.margin * 2))
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(): void {

    let data = this.selection
    this.max = Math.max.apply(Math, this.selection.map(function (el) { return el.height; }))
    this.min = Math.min.apply(Math, this.selection.map(function (el) { return el.height; }))
    this.step = 0.0107

    // Create the X-axis band scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.x))
      // .rangeRound([this.margin, this.width])
      .range([0, this.graphContent.width])
      .padding(0.2);

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      // .domain([min - min * 0.75, max + max * 0.75])
      .range([this.graphContent.height, 0])
      .domain([0, this.max])

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.graphContent.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");


    // // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y))

    let barWidth = Math.max(1, 0.9 * x.bandwidth());
    let halfGap = Math.max(0, x.bandwidth() - barWidth) / 2;


    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.x) + halfGap)
      .attr("y", d => y(d.height))
      .attr("width", barWidth)
      .attr("height", (d) => this.graphContent.height - y(d.height))
      .attr("fill", ((d, inx) => {
        if(this.graphContent.color.length != 0)
          return this.graphContent.color[inx];
        else
          return this.randomColors();
      }));
  }

  changeRange() {
    let data = this.selection
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

  update() {
    if (this.graphContent) {
      this.svg.selectAll("rect").style("fill", this.graphContent.color);
      this.svg.attr("readonly", false);
      d3.select("svg").attr("height", 0);
      document.querySelector("svg")
      document.getElementById('svg').setAttribute("height", this.graphContent.height.toString());
      document.getElementById('svg').setAttribute("width", this.graphContent.width.toString());
    }
  }
}