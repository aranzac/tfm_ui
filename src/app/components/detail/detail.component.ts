import { Component, ComponentFactory, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { GenericGraphComponent } from '../generic-graph/generic-graph.component';
import { ActivatedRoute } from '@angular/router';
import { GraphContent } from 'src/app/models/graphContent';
import { GRAPHS } from 'src/app/models/graph-data';
import { Graph } from 'src/app/models/Graphs';
import { GraphService } from 'src/app/services/graph.service';
import { Title } from '@angular/platform-browser';
import {  faDownload } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  graphContent: GraphContent;
  graphList: Graph[] = GRAPHS;
  id: any;
  genericGraphRef: ComponentRef<any>;

  
  downloadIcon = faDownload;


  @ViewChild("genericGraphContainer", { read: ViewContainerRef }) GenericGraphContainer;

  constructor(private route: ActivatedRoute, private resolver: ComponentFactoryResolver, private titleService: Title, private graphService: GraphService) {
    this.id = this.route.snapshot.params['id'];
    this.titleService.setTitle("Graph Detail");
  }

  ngOnInit() {
    this.getGraphData();
  }

  getGraphData() {
    this.graphService.getById(this.id).subscribe(data => {
      this.graphContent = data;
      this.loadComponent();
    },
      error => {
        console.log("Graph does not exists", error)
      });
  }

  loadComponent() {

    let component = this.graphList.find(el => el.type == this.graphContent.type).component;

    if (component != undefined) {

      this.GenericGraphContainer.clear();
      const factory: ComponentFactory<GenericGraphComponent<typeof component>> = this.resolver.resolveComponentFactory(GenericGraphComponent);

      this.genericGraphRef = this.GenericGraphContainer.createComponent(factory);
      this.genericGraphRef.instance.component = component;

      setTimeout(() => {
        if (this.genericGraphRef.instance.container) {
          this.genericGraphRef.instance.graphContent = this.graphContent;
          this.genericGraphRef.instance.output.subscribe(event => console.log("event " + event));
          this.genericGraphRef.instance.createComponent();
        }
      });
    }
    else {
      console.log("La componente elegida no fue encontrada");
    }
  }

  saveSVG() {
      this.genericGraphRef.instance.saveSVG();
  }

  savePNG() {
      this.genericGraphRef.instance.savePNG();
  }

  savePDF() {
      this.genericGraphRef.instance.savePDF();
  }

  ngOnDestroy() {
    if (this.genericGraphRef != undefined)
      this.genericGraphRef.destroy();
  }
}