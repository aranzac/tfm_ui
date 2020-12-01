import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injectable, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { AUTH_SERVICE } from '../../app.constants';
import { Auth } from 'src/app/models/auth';
import { UserService } from 'src/app/services/user.service';
import { TokenStorageService } from 'src/app/services/TokenStorageService';

const navigationExtras: NavigationExtras = { state: { data: 'logged' } };
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhcmFuIiwiZXhwIjoxNjAyMzkxNjc1LCJpYXQiOjE2MDIzNTU2NzV9.LueudCRwC3G8Bzmm4pHyyBMCABy_oSn7VWK25RhEfQ8' })
};
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
@Injectable({
  providedIn: 'root'
})
export class LoginComponent implements OnInit {

  data: string;
  myForm: FormGroup;
  submitted = false;

  auth: Auth = {
    username: '',
    password: ''
  };

  isLoggedIn: boolean = false;
  invalid: boolean = false;
  serverError: boolean = false;


  constructor(private router: Router, private http: HttpClient, private fb: FormBuilder, private userService: UserService, private tokenStorage: TokenStorageService) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation.extras.state as { data: string };

    if (state != undefined)
      this.data = state.data;
  }


  ngOnInit(): void {

    this.myForm = this.fb.group({
      name: ['', [Validators.required]],
      password: ['', Validators.required],
      check: ['']
    });

    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
    }
  }

  onSubmit(myForm) {
    this.submitted = true;
    this.invalid = false;
    this.serverError = false;

    if (!myForm.value.check)
      myForm.value.check = false;

    if (myForm.valid) {

      this.auth.username = myForm.value.name;
      this.auth.password = myForm.value.password;

      this.userService.attemptAuth(this.auth).subscribe(
        params => {
          this.tokenStorage.saveUsername(params['username']);
          this.tokenStorage.saveToken(params['accessToken']);
          this.tokenStorage.saveAuthorities(params['roles']);

          if (myForm.value.check) {
            this.tokenStorage.saveLocalUsername(params['username']);
            this.tokenStorage.saveLocalToken(params['accessToken']);
            this.tokenStorage.saveLocalAuthorities(params['roles']);
          }
          // this.reloadPage();
          //this.router.navigate(['/'], navigationExtras);

          window.location.href = "/";

        },
        error => {

          this.handleError(error)

        }
      );
    }
  }

  reloadPage() {
    window.location.reload();
  }

  private handleError(error: Response | any) {
    console.log(error);
    if (error.status == 0) {
      this.serverError = true;
      this.invalid = false;

      return
    }
  }
}

