import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AUTH_SERVICE, USER_SERVICE } from '../app.constants';
import { Auth } from '../models/auth';
import { Observable } from 'rxjs';
import { JwtResponse } from '../models/JwtResponse';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private usersUrl: string;
  token: string;

  constructor(private http: HttpClient) {}

  setGlobalVar(token: string) {
    this.token = token;
  }

  getGlobalVar(): string {
    return this.token;
  }

  public save(user: User) {
    return this.http.post<User>(this.usersUrl, user);
  }

  public getLoggedUserByUsername(username: String) {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
    return this.http.get<User>(USER_SERVICE + '/user/' + username, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token,
        
      }, withCredentials: true
    })
  }



  attemptAuth(credentials: Auth): Observable<Object> {
    return this.http.post(AUTH_SERVICE + "/authenticate", JSON.stringify(credentials), httpOptions);
  }


  isUserLoggedIn() {
    let user = sessionStorage.getItem("username");
    return !(user === null);
  }

  logOut() {
    sessionStorage.removeItem("username");
  }

}