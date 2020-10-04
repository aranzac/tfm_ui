import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user';
import { USER_SERVICE } from '../../app.constants';

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const navigationExtras: NavigationExtras = {state: {data: 'Cuenta creada correctamente'}};

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  existing: boolean;
  myForm: FormGroup;
  user: User = {
    username: '',
    email: '',
    password: '',
    state: 'enabled',
    roles: []
  };
  submitted = false;

  

  constructor(private http: HttpClient, private fb: FormBuilder, private router: Router) { 

 
  }

  ngOnInit(): void {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])],
      password: ['', [Validators.required, Validators.minLength(6)]],
      check: ['']
      });
  }

  onSubmit(myForm) {
    this.existing = false;
    this.submitted = true;
     console.log('Valid?', myForm.valid); // true or false
     console.log('Name', myForm.value.name);
     console.log('Email', myForm.value.email);
     console.log('password', myForm.value.password);
     if(!myForm.value.check)
     myForm.value.check = false;
     console.log('check', myForm.value.check);


    // if (myForm.invalid) 
    //   return;
      if (myForm.valid) {
       
        this.user.username = myForm.value.name
        this.user.email = myForm.value.email
        this.user.password = myForm.value.password
         this.user.state = "enabled";
        this.user.roles = [];
  
        console.log(this.user)


        this.http.post(USER_SERVICE, JSON.stringify(this.user), httpOptions).subscribe(
          (data) => {
            console.log(data);
            this.user = new User();
            this.router.navigate(['/login'], navigationExtras);

          },
          (error) => {
            this.existing=true;
            console.log(error);
          }
        );


      }  
  }
}
