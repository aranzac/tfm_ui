import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ROLES_SERVICE } from '../app.constants';
import { USER_SERVICE } from '../app.constants';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  users: User[] = [];
  header: HttpHeaders;
  token: string;


  setGlobalVar(token: string) {
    this.token = token;
  }

  getGlobalVar(): string {
    return this.token;
  }

  constructor(private http: HttpClient) { }


  public getAccounts(): Observable<User[]> {
    return this.http.get<User[]>(USER_SERVICE + '/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      }
    });
  }

  public getAccountById(id): Observable<User> {
    return this.http.get<User>(USER_SERVICE + '/' + id, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      }
    })
  }

  public getAccountByUsername(name): Observable<User> {
    return this.http.get<User>(USER_SERVICE + '/user/' + name, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      }
    })
  }

  public blockUserById(id): Observable<User> {
    console.log("put")
    return this.http.put<User>(USER_SERVICE + '/block/' + id, this.getAccountById(id), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token

      }
    })
  }


  public deleteById(id) {


    return this.http.delete(USER_SERVICE + '/' + id, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      }
    })
  }

  //  {headers: {'Content-Type': 'application/json',
  //    'Authorization': 'Bearer ' + this.token,
  //    'Access-Control-Allow-Methods': 'DELETE'}}


  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    //console.log(errorMessage);
    return throwError(errorMessage);
  }


  // delete(id){
  //   return this.httpClient.delete<Product>(this.apiServer + '/products/' + id, this.httpOptions)
  //   .pipe(
  //     catchError(this.errorHandler)
  //   )
  // }


  // public setHeaders(token){
  //   console.log("hola " + token)
  //   let headers = new HttpHeaders({
  //        "Content-Type": "application/json",
  //        'Authorization': 'Bearer' + token
  //      });
  //   this.header = "guapa"
  //   // this.header = new HttpHeaders({
  //   //   "Content-Type": "application/json",
  //   //   'Authorization': 'Bearer' + token
  //   // })
  //   console.log(this.header)
  //   console.log(this.header)
  //   console.log("ey " +  headers.getAll.toString)

  // }


  // getUsers(): Observable<User[]> {
  //   return this.http.get<User[]>(this.apiurl).pipe(
  //     tap(data => console.log(data)),
  //     catchError(this.handleError)
  //   );
  // }




  // this.http.get("https://reqres.in/api/users?page=2").subscribe(data => {
  //   console.log(data);
  // });





}
