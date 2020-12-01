import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  data: string
  constructor(private router: Router) { 


    const navigation = this.router.getCurrentNavigation();
    const state = navigation.extras.state as {data: string};

    if(state != undefined){
      this.data = state.data;
    }
  }

  ngOnInit(): void {

  }

   
}
