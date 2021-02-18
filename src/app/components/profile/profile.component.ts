import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { RoleService } from 'src/app/services/role.service';
import { TokenStorageService } from 'src/app/services/TokenStorageService';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  id: any
  token: any;
  isLoggedIn: boolean = false;
  username: string;
  private sub: any;
  allowed: boolean = false;
  user: User ;

  constructor(private http: HttpClient, private tokenService: TokenStorageService, private router: Router, private route: ActivatedRoute, private roleService: RoleService, private userService: UserService,  private titleService: Title) {
    this.titleService.setTitle("Perfil");
  }

  ngOnInit(): void {

    //Obtener usuario de la ruta 
    this.route.params.subscribe(params => {
      this.username = params['username'];
    })

    //console.log(this.username)
    this.isLoggedIn = !!this.tokenService.getToken() || !!this.tokenService.getLocalToken();

    // Si no esta logueado, redirige a login
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
    this.allowed = true;

    if (this.username != this.tokenService.getUsername()) {
      this.allowed = false;
    }

    this.token = this.tokenService.getToken();
    if (!this.token)
      this.token = this.tokenService.getLocalToken();

    // Si posee token
    if (this.token) {
      this.userService.setGlobalVar(this.token)
      this.userService.getLoggedUserByUsername(this.username).subscribe(data => {
        this.user = data;
          error => {
            console.log(error)
          }
      });
      

      // console.log(this.user) ESTE LOG NUNCA SE EJECUTARA DESPUES DE LA PETICION ANTERIOR. SUBSCRIBE ES ASINCRONO


      // this.roleService.setGlobalVar(this.token)
      // this.roleService.getRoles().subscribe(data => { console.log(data) }, error => { console.log("Error ") })
    }

  }

  // ngOnDestroy() {
  //   this.route.params.unsubscribe();
  //   }
}
