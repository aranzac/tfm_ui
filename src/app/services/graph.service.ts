import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GRAPH_SERVICE, USER_SERVICE } from '../app.constants';
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

  public getGraphsByOwner(owner: String): Observable<GraphContent>{
    let httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    };
    return this.http.get<GraphContent>(GRAPH_SERVICE + '/owner/' + owner);
  }


  public update(id, graph): Observable<Graph> {
    console.log("update")
    let httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    };
    return this.http.put<Graph>(GRAPH_SERVICE + '/' + id, JSON.stringify(graph), httpOptions);
  }
  
  public deleteGraph(graph) {
    return this.http.delete(GRAPH_SERVICE + '/' + graph.id, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

}
