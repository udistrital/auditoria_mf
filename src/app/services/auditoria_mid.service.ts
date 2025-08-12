import { Injectable,  } from '@angular/core';
import { RequestManager } from '../managers/requestManager';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { PopUpManager } from '../managers/popUpManager';
import { Observable } from 'rxjs';
import { HttpErrorManager } from '../managers/errorManager';
import { environment } from '../../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { LogData } from '../helpers/interfaces/IAuditoria';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaMidService {
  private path: any;
  public httpOptions: any;
  service:string ='AUDITORIA_MID_SERVICE';
  dataSource!: MatTableDataSource<LogData>;
  token: string = '';

  constructor(private requestManager: RequestManager, private http: HttpClient, private popUpManager: PopUpManager, private errManager: HttpErrorManager,) {
    this.requestManager.setPath('AUDITORIA_MID_SERVICE');
    this.path = environment[this.service as keyof typeof environment]
    this.buildHeader();
  }

  buildHeader() {
    const access_token = window.localStorage.getItem('access_token');
    const csrfToken = this.getCookie('XSRF-TOKEN');
    if (access_token !== null) {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
        }),
        withCredentials: true,
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

  private getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }

  /**
   * # Buscar logs filtrados según el payload proporcionado.
   * Método para buscar logs filtrados según el payload proporcionado.
   * @param payload Objeto que contiene los filtros para la búsqueda de logs.
   * @returns Observable con los logs filtrados.
   */
  buscarLogsFiltrados(payload: any): Observable<any> {
    this.buildHeader();
    return this.http.post(`${this.path}auditoria/buscarLogsFiltrados`,payload, this.httpOptions)
  }
  /**
   * # Obtener el token CSRF.
   * Método para obtener el token CSRF desde el backend.
   * @returns Observable con el token CSRF.
   */
  getCsrfToken(): Observable<{ csrfToken: string }> {
    return this.http.get<{ csrfToken: string }>(`${this.path}csrf-token`, );
  }


}