import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  data: string;
   
  constructor(private router: Router) { 
     const navigation = this.router.getCurrentNavigation();
     const state = navigation.extras.state as {data: string};

     // Si proviene de registro con un mensaje de éxito aparece un alert verde
     if(state != undefined)
      this.data = state.data;
  }


  ngOnInit(): void {
  }

}
