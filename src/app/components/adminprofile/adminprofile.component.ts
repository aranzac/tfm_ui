import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AdminService } from 'src/app/services/admin.service';
import { TokenStorageService } from 'src/app/services/TokenStorageService';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { RoleService } from 'src/app/services/role.service';
import { Role } from 'src/app/models/role';
import { GraphService } from 'src/app/services/graph.service';
import { GraphContent } from 'src/app/models/graphContent';
import { Graph } from 'src/app/models/Graphs';

@Component({
  selector: 'app-adminprofile',
  templateUrl: './adminprofile.component.html',
  styleUrls: ['./adminprofile.component.css'],
  providers: [],
})
export class AdminprofileComponent implements OnInit {
  backIcon = faArrowLeft;
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  accounts: User[];
  roles: Role[];
  graphs: GraphContent[];
  allAccounts: User[];
  allRoles: Role[];
  allGraphs: GraphContent[];
  myForm: FormGroup;
  myForm2: FormGroup;
  noResults: boolean = false;
  dataModify: boolean = false;
  activeSearch: string = '';
  noResultsRole: boolean = false;
  dataModifyRole: boolean = false;
  activeSearchRole;
  noResultsGraph: boolean = false;
  dataModifyGraph: boolean = false;
  activeSearchGraph;

  constructor(private tokenService: TokenStorageService, private fb: FormBuilder, private router: Router, private adminService: AdminService, private roleService: RoleService, private graphService: GraphService) {

  }

  ngOnInit(): void {
    this.activeSearch = ''
    this.noResults = false;
    this.dataModify = false;

    this.activeSearchRole = ''
    this.noResultsRole = false;
    this.dataModifyRole = false;

    this.myForm = this.fb.group({
      attribute: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.myForm2 = this.fb.group({
      atributo: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.isLoggedIn = !!this.tokenService.getToken() || !!this.tokenService.getLocalToken();

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }

    if (this.isLoggedIn) {
      this.tokenService.getLocalAuthorities().includes("ROLE_ADMIN")
      this.isAdmin = !!this.tokenService.getAuthorities().includes("ROLE_ADMIN") || !!this.tokenService.getLocalAuthorities().includes("ROLE_ADMIN");
      if (!this.isAdmin)
        this.router.navigate(['/']);
    }

    this.adminService.setGlobalVar(this.tokenService.getToken());
    this.roleService.setGlobalVar(this.tokenService.getToken())

    this.getAllAccounts()
    this.getAllRoles()
    this.getAllGraphs()


  }

  getAllAccounts() {
    this.adminService.getAccounts().subscribe((data: User[]) => {
      this.accounts = data;
      this.allAccounts = data;
    })
  }

  getAllGraphs() {
    this.graphService.getAll().subscribe((data: GraphContent[]) => {
      this.graphs = data;
      this.allGraphs = data;
    })
  }


  search(attribute) {

    let attr = attribute.value.attribute;
    this.activeSearch = attribute.value.attribute;

    let users = [];
    this.allAccounts
      .forEach(x => {
        if (((x.username.includes(this.activeSearch))||(x.email.includes(this.activeSearch))||(this.activeSearch.includes(x.id.toString()))) && !users.includes(x))
          users.push(x)
      })

    if (users.length < 1)
      this.noResults = true
    else {
      this.accounts = [];
      this.accounts = users;
      this.noResults = false
      this.dataModify = true;
    }
  }

  backToAllResults() {
    this.noResults = false;
    this.dataModify = false;
    this.accounts = this.allAccounts;
  }

  deleteAccount(account) {
    this.adminService.deleteById(account.id).subscribe(() => { this.getAllAccounts() });
  }

  deleteGraph(graph){
    this.graphService.deleteGraph(graph).subscribe(() => this.getAllGraphs());

  }

  searchGraphs(attribute){
    this.activeSearchGraph = attribute.value.attribute

    let graphss = [];
    this.allGraphs.forEach(x => {
      if (x.title.includes(this.activeSearchGraph) || x.type.includes(this.activeSearchGraph) || x.id.toString().includes(this.activeSearchGraph) || x.owner.includes(this.activeSearchGraph))
        graphss.push(x)
    })

    if (graphss.length < 1)
      this.noResultsGraph = true
    else {
      this.graphs = [];
      this.graphs = graphss;
      this.noResultsGraph = false
      this.dataModifyGraph = true;
    }
  }

  backToAllResultsGraphs(){
    this.noResultsGraph = false;
    this.dataModifyGraph = false;
    this.graphs = this.allGraphs;
  }

  updateAccount(account) {

    
    this.adminService.blockUserById(account.id).subscribe((data: User) => {
      if (this.dataModify) {
        this.search(this.activeSearch)
      }
      else {
        this.getAllAccounts()
      }
    })
  }

  getAllRoles() {
    this.roleService.getRoles().subscribe((data: Role[]) => {
      this.roles = data;
      this.allRoles = data;
    })
  }

  searchRoles(attribute) {
    this.activeSearchRole = attribute.value.atributo.toUpperCase()

    let roless = [];
    this.allRoles.forEach(x => {
      if (x.name.includes(this.activeSearchRole))
        roless.push(x)
    })

    if (roless.length < 1)
      this.noResultsRole = true
    else {
      this.roles = [];
      this.roles = roless;
      this.noResultsRole = false
      this.dataModifyRole = true;
    }
  }

  backToAllResultsRoles() {
    this.noResultsRole = false;
    this.dataModifyRole = false;
    this.roles = this.allRoles;

  }

  deleteRole(role) {
    this.roleService.deleteById(role.id).subscribe(() => { this.getAllRoles() })
    
  }

}
