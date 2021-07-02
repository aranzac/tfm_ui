import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GRAPH_SERVICE } from '../app.constants';
import { GraphContent } from '../models/graphContent';
import { Graph } from '../models/Graphs';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class GraphService {

  constructor(private http: HttpClient) { }

  public save(graph: GraphContent) {
    return this.http.post<GraphContent>(GRAPH_SERVICE + '/', graph);
  }

  public getAll(): Observable<GraphContent[]> {
    let httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    };
    return this.http.get<GraphContent[]>(GRAPH_SERVICE + '/');
  }

  public getById(id: any): Observable<GraphContent>{
    let httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    };
    return this.http.get<GraphContent>(GRAPH_SERVICE + '/' + id);
  }



  public deleteGraph(graph) {
    var id = graph.id;
    return this.http.delete(GRAPH_SERVICE + '/' + id, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

}
