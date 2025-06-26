import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PopUpManager } from '../managers/popUpManager';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { HttpErrorManager } from '../managers/errorManager';
import { environment } from '../../environments/environment';
import { LogData } from '../pages/auditoria/auditoria.component';
import { MatTableDataSource } from '@angular/material/table';

@Injectable({
  providedIn: 'root',
})

export class AuditoriaMidService {
  private path: any;
  public httpOptions: any;
  service:string ='AUDITORIA_MID_SERVICE';
  dataSource!: MatTableDataSource<LogData>;

  constructor(private requestManager: RequestManager, private http: HttpClient, private popUpManager: PopUpManager, private errManager: HttpErrorManager) {
    this.requestManager.setPath('AUDITORIA_MID_SERVICE');
    this.path = environment[this.service as keyof typeof environment]
    const access_token = window.localStorage.getItem('access_token');
        if (access_token !== null) {
          this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${access_token}`,
              'Accept': 'application/json',
            }),
          };
        }
  }

  get(endpoint: any) {
    return this.requestManager.get(endpoint);
  }

  post(endpoint: any, element: any) {
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: any, element: any) {
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint: any, element: any) {
    return this.requestManager.delete(endpoint, element.Id);
  }

  /**
   * # Buscar logs filtrados según el payload proporcionado.
   * Método para buscar logs filtrados según el payload proporcionado.
   * @param payload Objeto que contiene los filtros para la búsqueda de logs.
   * @returns Observable con los logs filtrados.
   */
  buscarLogsFiltrados(payload: any): Observable<any> {
    // Convertir el payload a HttpParams para GET
    let params = new HttpParams();

    // Mapear cada propiedad del payload a parámetros GET
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
        params = params.append(key, payload[key]);
      }
    });
    console.log('Parámetros de búsqueda:', params.toString());
    // Realizar la petición GET con los parámetros
    return this.http.get(`${this.path}auditoria/buscarLogsFiltrados`, { params },)
  }

}