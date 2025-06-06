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
    
    return this.http.get(`http://localhost:8035/v1/auditoria/buscarLogsFiltrados`, { params },).pipe(
      switchMap((response: any) => {
        console.log('Respuesta de la API:', response);
        const logs = this.transformarRespuesta(response);

        if (!Array.isArray(logs)) {
          this.popUpManager.showErrorAlert('Error al procesar los datos devueltos por la API.');
          throw new Error('Error en la transformación de datos');
        }

        return this.procesarResultados(logs);
      }),
      tap(() => {
        Swal.close();
      }),
      catchError((error) => {
        if (error.status === 404) {
          this.popUpManager.showErrorAlert('No se encontraron datos en el rango de fechas y horas especificado, asociados con el tipo de LOG.');
        } else {
          this.popUpManager.showErrorAlert('Se generó un error al buscar los datos.');
        }
        return [];
      })
    );
  }

  private transformarRespuesta(response: any): LogData[] {
    if (!response || !response.Data || !Array.isArray(response.Data)) {
      return [];
    }

    return response.Data.map((log: any) => ({
      MODIFICACION: log.tipoLog || 'Sin tipo',
      FECHA: log.fecha || 'Sin fecha',
      ROL: log.rolResponsable || 'Sin usuario',
      ACCIONES: 'Ver',
      ROLES: log.rol || 'Rol no encontrado',
      NOMBRERESPONSABLE: log.nombreResponsable || 'Sin nombre',
      DOCUMENTORESPONSABLE: log.documentoResponsable || 'Sin documento',
      DIRECCIONACCION: log.direccionAccion || 'Sin direccion',
      APISCONSUMEN: log.apisConsumen || 'Sin apis',
      PETICIONREALIZADA: this.funcionFormateoLog(log.peticionRealizada || 'Sin peticion'),
      EVENTOBD: log.eventoBD || 'Sin evento de la BD',
      TIPOERROR: log.tipoError || 'Sin tipo de error',
      MENSAJEERROR: log.mensajeError || 'Sin mensaje de error'
    }));
  }

  funcionFormateoLog(jsonString: string): string {

    try {
      const jsonCompleto = JSON.parse(jsonString);
      let cadenaData = jsonCompleto.data;
      cadenaData = cadenaData.slice(0, -1);
      const subJson = JSON.parse(cadenaData);
      jsonCompleto.data = subJson;
      return JSON.stringify(jsonCompleto, null, 2);
    } catch (error) {
      return jsonString;
    }
  }

  
  procesarResultados(resultados: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (resultados.length > 0) {
          this.dataSource.data = resultados;
          //setTimeout(() => {
          //this.dataSource.paginator = this.paginator;
          this.popUpManager.showSuccessAlert('Datos cargados con éxito');
          resolve();
          //}, 1000);
        } else {

          this.popUpManager.showErrorAlert('Error al buscar dependencias: Datos no disponibles');
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}