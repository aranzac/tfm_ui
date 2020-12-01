import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AdminService } from 'src/app/services/admin.service';
import { TokenStorageService } from 'src/app/services/TokenStorageService';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { RoleService } from 'src/app/services/role.service';
import { Role } from 'src/app/models/role';

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
  allAccounts: User[];
  allRoles: Role[];
  myForm: FormGroup;
  myForm2: FormGroup;
  noResults: boolean = false;
  dataModify: boolean = false;
  activeSearch: string = '';
  noResultsRole: boolean = false;
  dataModifyRole: boolean = false;
  activeSearchRole;

  constructor(private tokenService: TokenStorageService, private fb: FormBuilder, private router: Router, private adminService: AdminService, private roleService: RoleService) {

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

    //this.adminService.setHeaders(this.tokenService.getToken())
    //console.log(this.adminService.getAccounts(this.tokenService.getToken()).subscribe());

    this.adminService.setGlobalVar(this.tokenService.getToken());
    this.roleService.setGlobalVar(this.tokenService.getToken())
    //   //console.log(this.adminService.getGlobalVar())
    //   // console.log(this.adminService.getAccounts().subscribe())

    this.getAllAccounts()
    this.getAllRoles()

    //   this.adminService.getAccountById(5).subscribe((data: User) => {
    //     console.log(data)
    //   })



    //   this.adminService.blockUserById(5).subscribe((data: User) => {
    //     console.log(data)
    //   });

  }

  getAllAccounts() {
    console.log("todas las cuents")
    this.adminService.getAccounts().subscribe((data: User[]) => {
      this.accounts = data;
      this.allAccounts = data;
    })

  }


  search(attribute) {

    let attr = attribute.value.attribute;
    this.activeSearch = attribute.value.attribute;

    let users = [];
    this.allAccounts
      .forEach(x => {
        if (((x.username.includes(this.activeSearch))||(x.email.includes(this.activeSearch))) && !users.includes(x))
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

  updateAccount(account) {

    
    this.adminService.blockUserById(account.id).subscribe((data: User) => {
      console.log(data)
      console.log(this.dataModify)
      if (this.dataModify) {
        this.search(this.activeSearch)
        console.log(this.dataModify)
      }
      else {
        console.log(this.activeSearch)
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
      console.log("error role")
      this.roles = [];
      this.roles = roless;
      this.noResultsRole = false
      this.dataModifyRole = true;
    }
  }

  backToAllResultsRoles() {
    console.log("resultados roles")
    this.noResultsRole = false;
    this.dataModifyRole = false;
    this.roles = this.allRoles;

  }

  deleteRole(role) {
    this.roleService.deleteById(role.id).subscribe(() => { this.getAllRoles() })
  }

}
