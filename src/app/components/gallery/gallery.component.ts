import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { GraphContent } from '../../models/graphContent';
import { Graph } from '../../models/Graphs';
import { GraphService } from '../../services/graph.service';
import { GRAPHS } from 'src/app/models/graph-data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  graphs: GraphContent[] = [];
  graphList: Graph[] = GRAPHS;
  graphListSearch:  GraphContent[] = [];
  searchForm: FormGroup;
  filterSelected: boolean = false;

  constructor(private titleService:Title, private http: HttpClient, private graphService: GraphService, private formBuilder: FormBuilder ) {
    this.titleService.setTitle("Galería");
   }

  ngOnInit(): void {

    this.graphService.getAll().subscribe((data: GraphContent[]) => {
      this.graphs = data.filter(el => el.publish)
      this.graphListSearch = data.filter(el => el.publish);
    })

    this.searchForm = this.formBuilder.group({
      search: ['', {  updateOn: "blur" }],
      filter: ['', {  updateOn: "change" }]
    });

    this.searchForm.controls['search'].valueChanges.subscribe(value => {
      if(value == "")
        this.graphListSearch = this.graphs;
      this.filterSelected = true;
      this.graphListSearch = this.graphs.filter(item => item.title == value || item.owner == value || item.id == value || item.title.includes(value))
    });

    this.searchForm.controls['filter'].valueChanges.subscribe(value => {
      this.filterSelected = true;
      this.graphListSearch = this.graphs.filter(item => item.type == value)
    });
  }

  getImageUrl(type){
    var graphInfo =  this.graphList.find(d => d.type == type);
    if(graphInfo) 
      return graphInfo.image;
    else 
      return "data:image/png;base64,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";
  }

  removeFilter(){
    this.filterSelected = false;
    this.graphListSearch = this.graphs;
    document.getElementById('selectFilter').getElementsByTagName('option')[0].selected = true;
  }
}
