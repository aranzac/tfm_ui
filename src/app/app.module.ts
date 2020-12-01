import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PruebaComponent } from './components/prueba/prueba.component';
import { RegistroComponent } from './components/registro/registro.component';
import { HttpClientModule } from '@angular/common/http';
import { ProfileComponent } from './components/profile/profile.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminprofileComponent } from './components/adminprofile/adminprofile.component';
import { Page404Component } from './components/page404/page404.component';
import { BarComponent } from './components/d3/bar/bar.component';
import { PieComponent } from './components/d3/pie/pie.component';
import { ScatterComponent } from './components/d3/scatter/scatter.component';
import { GeneratorComponent } from './components/d3/generator/generator.component';
import { GalleryComponent } from './gallery/gallery.component'
import { ColorPickerModule } from 'ngx-color-picker';
import { ColorSketchModule } from 'ngx-color/sketch';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    PruebaComponent,
    RegistroComponent,
    ProfileComponent,
    AdminprofileComponent,
    Page404Component,
    BarComponent,
    PieComponent,
    ScatterComponent,
    GeneratorComponent,
    GalleryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FontAwesomeModule,
    ColorPickerModule,
    ColorSketchModule    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
