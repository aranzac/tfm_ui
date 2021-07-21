import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { RoleService } from 'src/app/services/role.service';
import { TokenStorageService } from 'src/app/services/TokenStorageService';
import { UserService } from 'src/app/services/user.service';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { GraphService } from 'src/app/services/graph.service';
import { GraphContent } from 'src/app/models/graphContent';
import { Graph } from 'src/app/models/Graphs';

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
  userIcon = faUser;
  allGraphs: GraphContent[];


  constructor(private http: HttpClient, private tokenService: TokenStorageService, private router: Router, private route: ActivatedRoute, private roleService: RoleService, private userService: UserService,  private titleService: Title, private graphService: GraphService) {
    this.titleService.setTitle("Perfil");
  }

  ngOnInit(): void {

    //Obtener usuario de la ruta 
    this.route.params.subscribe(params => {
      this.username = params['username'];
    })

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
        this.getGraphsByOwner();
          error => {
            console.log(error)
          }
      });
    
    }

  }

  getGraphsByOwner() {
    this.graphService.getGraphsByOwner(this.user.username).subscribe((data: any) => {
      this.allGraphs = data;
    })
  }

  deleteGraph(graph){
    this.graphService.deleteGraph(graph).subscribe(() => this.getGraphsByOwner());
  }

  publishGraph(graph: GraphContent){
    graph.publish = true;
    this.graphService.update(graph.id, graph).subscribe(() => {this.getGraphsByOwner()})

  }
  unpublishGraph(graph){
    graph.publish = false;
    this.graphService.update(graph.id, graph).subscribe(() => {this.getGraphsByOwner()})
  }
  
  linkClick(id){
    this.router.navigateByUrl("/detail/" + id);
  }

}
