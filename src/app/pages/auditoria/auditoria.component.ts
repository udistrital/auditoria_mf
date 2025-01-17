import { Component, OnInit, signal, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { VerDetalleLogDialogComponent } from './components/ver-detalle-log-dialog/ver-detalle-log-dialog.component';
import { HttpClient } from '@angular/common/http';
import { PopUpManager } from '../../managers/popUpManager';
import { MAPEO_APIS } from 'src/app/shared/constantes';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { AuditoriaMidService } from 'src/app/services/auditoria_mid.service';

interface LogData {
  MODIFICACION: string;
  FECHA: string;
  ROLES: string;
  ACCIONES?: string;
}

interface InfoRootDetail {
  appName: string;
  clienteId?: string;
}

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {
  @Input('normalform') normalform: any;
  @ViewChild(MatPaginator) paginator !: MatPaginator;

  columnasBusqueda = signal<string[]>(["MODIFICACION", "FECHA", "ROLES", "ACCIONES"]);
  tiposLogs: string[] = ['GET', 'POST', 'PUT', 'DELETE'];
  nombresApis: string[] = [];
  apisInfo: { nombre: string; entorno: string }[] = [];
  apiSeleccionada: { nombre: string; entorno: string } | null = null;

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  years: number[] = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  logForm !: FormGroup;
  dataSource!: MatTableDataSource<LogData>;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient,
    private popUpManager: PopUpManager,
    private auditoriaMidService: AuditoriaMidService,
  ) {
    this.logForm = this.fb.group({
      fechaDesde: [''],
      horaDesde: ['', [Validators.required, this.timeValidator]],
      fechaHasta: [''],
      horaHasta: ['', [Validators.required, this.timeValidator]],
      tipoLog: [''],
      codigoResponsable: [''],
      nombreApi: ['']
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();

    window.addEventListener('infoRoot', (event: Event) => {
      const customEvent = event as CustomEvent<InfoRootDetail>;
      if (customEvent.detail.appName === '@udistrital/auditoria-mf') {
        if (customEvent.detail.clienteId && customEvent.detail.clienteId.trim() !== '') {
          this.fetchApiData(customEvent.detail.clienteId);
        } else {
          alert('No esta llegando el clienteId del root');
        }
      }
    });

    window.dispatchEvent(new CustomEvent('clienteAuditoria', { detail: { appName: '@udistrital/auditoria-mf' } }));
  }

  buscarLogs(): Promise<void> {
    this.dataSource.data = [];
    this.popUpManager.showLoaderAlert('Obteniendo datos, por favor espere.');
    const formValues = this.logForm.value;

    if (!this.apiSeleccionada) {
      this.popUpManager.showErrorAlert('Debe seleccionar una API válida.');
      return Promise.reject('No se seleccionó una API válida.');
    }

    const payload: { [key: string]: any } = {
      fechaInicio: formValues.fechaDesde,
      horaInicio: formValues.horaDesde,
      fechaFin: formValues.fechaHasta,
      horaFin: formValues.horaHasta,
      tipoLog: formValues.tipoLog,
      codigoResponsable: formValues.codigoResponsable,
      nombreApi: this.apiSeleccionada.nombre,
      entornoApi: this.apiSeleccionada.entorno,
    };

    const requiredFields = ['fechaInicio', 'horaInicio', 'fechaFin', 'horaFin', 'tipoLog', 'nombreApi', 'entornoApi'];

    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      this.popUpManager.showErrorAlert(
        `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`
      );
      Swal.close();
      return Promise.reject('Datos incompletos.');
    }

    return new Promise((resolve, reject) => {
      this.auditoriaMidService.post('auditoria/buscarLog', payload).subscribe({
      next: (response: any) => {
          console.log('Respuesta de la API:', response);
          const logs = this.transformarRespuesta(response);

          if (Array.isArray(logs)) {
            this.procesarResultados(logs)
              .then(() => {
                resolve();
              })
              .catch((error) => {
                this.popUpManager.showErrorAlert('Error al procesar los datos devueltos por la API.');
                reject('Error en el procesamiento de resultados');
              });
          } else {
            this.popUpManager.showErrorAlert('Error al procesar los datos devueltos por la API.');
            reject('Error en la transformación de datos');
          }
        },
        error: (error) => {
          if (error.status === 404) {
            this.popUpManager.showErrorAlert('No se encontraron datos en el rango de fechas y horas especificado, asociados con el tipo de LOG.');
          } else {
              this.popUpManager.showErrorAlert('Se genero un error desconocido al buscar los datos.');
          }
          reject(error);
        },
      });
    });
  }

  procesarResultados(resultados: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (resultados.length > 0) {
          this.dataSource.data = resultados;
          //setTimeout(() => {
          this.dataSource.paginator = this.paginator;
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

  abrirDialogVerDetalleLog(element: any): void {
    const dialogRef = this.dialog.open(VerDetalleLogDialogComponent, {
      width: '85%',
      height: 'auto',
      maxHeight: '65vh',
      data: element
    });
  }


  timeValidator(control: any): { [key: string]: boolean } | null {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (control.value && !timeRegex.test(control.value)) {
      return { 'invalidTime': true };
    }
    return null;
  }

  onNombreApiChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = parseInt(selectElement.value, 10);

    if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < this.apisInfo.length) {
      const selectedApi = this.apisInfo[selectedIndex];
      this.apiSeleccionada = { nombre: selectedApi.nombre, entorno: selectedApi.entorno };
    } else {
      this.apiSeleccionada = null;
    }
  }

  async fetchApiData(rootClienteId: string): Promise<void> {
    const baseUrl = 'https://autenticacion.portaloas.udistrital.edu.co/apioas/roles/v1';
    const token = localStorage.getItem("access_token");

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };

    const url = `${baseUrl}/apis_cliente?cliente=${encodeURIComponent(rootClienteId)}`;
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Error HTTP: ${response.status}, Detalles: ${errorDetails}`);
      }
      const data = await response.json();

      if (data?.cliente?.api) {
        this.apisInfo = data.cliente.api.map((api: any) => {
          const nombre = api.nombre.startsWith('/') ? api.nombre.slice(1) : api.nombre;
          api.nombre = MAPEO_APIS[nombre] || nombre;
          return {
            nombre: api.nombre,
            entorno: api.entorno,
          }
        });
        console.log('Información de APIs:', this.apisInfo);
      } else {
      }

      window.dispatchEvent(new CustomEvent('apiDataFetched', { detail: data }));
    } catch (error) {
      //console.error('Error al consultar la API:', error);
    }
  }

}
