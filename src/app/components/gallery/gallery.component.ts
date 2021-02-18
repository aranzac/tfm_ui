import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { GraphContent } from '../../models/graphContent';
import { Graph } from '../../models/Graphs';
import { GraphService } from '../../services/graph.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  lista:string[]=["hola","que","tal","estas","ola","adios","taluego"];
  graphs: GraphContent[] = [];

  constructor(private titleService:Title, private http: HttpClient, private graphService: GraphService ) {
    this.titleService.setTitle("Galería");
   }

  ngOnInit(): void {

    // Get all saved graphs
    this.graphService.getAll().subscribe((data: GraphContent[]) => {
      this.graphs = data;
    })
  }
}
