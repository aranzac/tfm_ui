import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminprofileComponent } from './components/adminprofile/adminprofile.component'
import { Page404Component } from './components/page404/page404.component';
import { GeneratorComponent } from './components/d3/generator/generator.component';
import { GalleryComponent } from './gallery/gallery.component';



const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent},
  { path: 'profile/:username', component: ProfileComponent},
  { path: 'admin/profile/:username', component: AdminprofileComponent},
  { path: "admin/profile/",redirectTo: "/"},
  { path: "admin/profile",redirectTo: "/"},
  { path: 'generator', component: GeneratorComponent},
  { path: "gallery", component: GalleryComponent},
    // TODAS LAS VISTAS NUEVAS AÑADIRLAS ANTES DE Page404Component
  { path: '**', component: Page404Component}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
