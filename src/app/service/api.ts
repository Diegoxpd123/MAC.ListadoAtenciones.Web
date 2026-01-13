import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {

  private urlApi = 'https://rickandmortyapi.com/api/character/1,183';// Se agregó esta línea


  constructor (private http:HttpClient){}// Se agregó esta línea

  public getData(): Observable <any> {// Se agregó esta línea
  return this.http.get<any>(this.urlApi);// Se agregó esta línea
  }
}
