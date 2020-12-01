import { Component, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenStorageService } from './services/TokenStorageService';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  logoutIcon = faSignOutAlt;
  title = 'ui';
  session: boolean = false;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  username: string = '';

  constructor(private tokenService: TokenStorageService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.isAdmin = false;
    this.isLoggedIn = false;
    // Si hay localStorage pero no sessionStorage se guarda esta ultima recuperada de la local
    if (this.tokenService.getLocalToken() && !this.tokenService.getToken()) {
      console.log("Recuperando sesión anterior")
      this.tokenService.saveUsername(this.tokenService.getLocalUsername());
      this.tokenService.saveToken(this.tokenService.getLocalToken());
      this.tokenService.saveAuthorities(this.tokenService.getLocalAuthorities());
    }

    // Si localStorage tiene el token sessionStorage lo tendra tambien, pero no a la inversa. 
    this.isLoggedIn = !!this.tokenService.getToken() || !!this.tokenService.getLocalToken();


    if (this.isLoggedIn) {
      if (this.tokenExpired(this.tokenService.getToken())) {
        console.log("Token expirado")
        this.logout()
      } 
      //this.tokenService.getLocalAuthorities().includes("ADMIN")
      // Si está logueado, se rellena el nombre de usuario y si es admin o no. Estos valores se envíarán con la ruta a la componente de destino
      this.username = this.tokenService.getUsername();
      this.isAdmin = this.tokenService.getAuthorities().includes("ROLE_ADMIN") || this.tokenService.getLocalAuthorities().includes("ROLE_ADMIN");
    }


  }

  private tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

  logout() {
    this.isAdmin = false;
    this.isLoggedIn = false;
    this.tokenService.signOut();
    window.location.reload();
  }

}