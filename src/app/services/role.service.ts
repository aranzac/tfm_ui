import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReturnStatement } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ROLES_SERVICE } from '../app.constants';
import { Role } from '../models/role';

// let httpOptions = {
//   headers: new HttpHeaders({ 'Content-Type': 'application/json' })
// };


@Injectable({
  providedIn: 'root'
})
export class RoleService {

  token: string;


  constructor(private http: HttpClient) { }

  setGlobalVar(token: string) {
    this.token = token;
  }

  getGlobalVar(): string {
    return this.token;
  }

  getHttpOptions() {
    // const token = localStorage.getItem('token');
    const headers = {
        'Content-Type':  'application/json',
        'Authorization': this.token
      }
    return { withCredentials: true, headers: headers };
}


  public getRoles(): Observable<Role[]> {

    let httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' , 'Authorization': 'Bearer ' + this.token})
    };

    return  this.http.get<Role[]>(ROLES_SERVICE + '/');

  }
  // return this.http.post(AUTH_SERVICE + "/authenticate", JSON.stringify(credentials), httpOptions);


  public getRoleById(id): Observable<Role> {
    return this.http.get<Role>(ROLES_SERVICE + '/' + id, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }


  public getRoleByName(name): Observable<Role> {
    return this.http.get<Role>(ROLES_SERVICE + '/name/' + name, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }

  public deleteById(id) {
    return this.http.delete(ROLES_SERVICE + '/' + id, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      }
    })
  }
}
