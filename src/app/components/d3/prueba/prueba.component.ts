import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'prueba',
  templateUrl: './prueba.component.html',
  styleUrls: ['./prueba.component.css'],
//   template: `
//   <h1>Alert {{type}}</h1>
// `
})
export class PruebaComponent implements OnInit {

  @Input() type: string = "success";
  @Input() title: string = "helo";

   @Output() output = new EventEmitter();
  
  constructor() { }

  ngOnInit(): void {
    console.log("componente " + this.type); 
    console.log("componente " + this.title); 

  }

  hola(){console.log("olas desde prueba")}
}
