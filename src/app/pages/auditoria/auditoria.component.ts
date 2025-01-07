import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { VerDetalleLogDialogComponent } from './components/ver-detalle-log-dialog/ver-detalle-log-dialog.component';
import { HttpClient } from '@angular/common/http';

interface LogData {
  //IDLOG: string;
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
  //columnasBusqueda = signal<string[]>(["IDLOG", "MODIFICACION", "FECHA", "ROL", "ACCIONES"]);
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
  logData: LogData[] = [
    { MODIFICACION: 'MODIFICACIÓN', FECHA: '2018-18-04 15:16:00', ROLES: 'SUPERVISOR', ACCIONES: 'Ver' },
    { MODIFICACION: 'CREACIÓN', FECHA: '2019-12-10 11:10:00', ROLES: 'ADMIN', ACCIONES: 'Ver' },
  ];

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.logForm = this.fb.group({
      fechaDesde: [''],
      horaDesde: ['', [Validators.required, this.timeValidator]],
      fechaHasta: [''],
      horaHasta: ['', [Validators.required, this.timeValidator]],
      tipoLog: [''],
      codigoResponsable: [''],
      //rolResponsable: [''],
      nombreApi: ['']
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.logData);
    //this.dataSource.paginator = this.paginator;

    window.addEventListener('infoRoot', (event: Event) => {
      const customEvent = event as CustomEvent<InfoRootDetail>;
      console.log('Dato recibido desde Root:', customEvent.detail);
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

  buscarLogs(): void {
    const formValues = this.logForm.value;

    if (!this.apiSeleccionada) {
      console.error('No se seleccionó una API válida.');
      return;
    }

    const payload = {
      fechaInicio: formValues.fechaDesde,
      horaInicio: formValues.horaDesde,
      fechaFin: formValues.fechaHasta,
      horaFin: formValues.horaHasta,
      tipoLog: formValues.tipoLog,
      codigoResponsable: formValues.codigoResponsable,
      //rolResponsable: formValues.rolResponsable,
      nombreApi: this.apiSeleccionada.nombre,
      entornoApi: this.apiSeleccionada.entorno,
    };

    console.log('Datos enviados a la API:', payload);

    this.http.post('http://localhost:8035/v1/auditoria/buscarLog', payload)
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta de la API:', response);
          const logs = this.transformarRespuesta(response);
          this.dataSource.data = logs;
        },
        error: (error) => {
          console.error('Error al enviar datos a la API:', error);
        }
      });
  }

  private transformarRespuesta(response: any): LogData[] {
    if (!response || !response.Data || !Array.isArray(response.Data)) {
      return [];
    }

    return response.Data.map((log: any) => ({
      /*IDLOG: log.idLog || 'Sin ID',*/
      MODIFICACION: log.tipoLog || 'Sin tipo',
      FECHA: log.fecha || 'Sin fecha',
      ROL: log.rolResponsable || 'Sin usuario',
      ACCIONES: 'Ver',
      ROLES: log.rol || 'Rol no encontrado',
      NOMBRERESPONSABLE: log.nombreResponsable || 'Sin nombre',
      DOCUMENTORESPONSABLE: log.documentoResponsable || 'Sin documento',
      DIRECCIONACCION: log.direccionAccion || 'Sin direccion',
      APISCONSUMEN: log.apisConsumen || 'Sin apis',
      PETICIONREALIZADA: log.peticionRealizada || 'Sin peticion',
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

  /*
    onNombreApiChange(event: Event): void {
      const selectElement = event.target as HTMLSelectElement; 
      const selectedValue = selectElement.value;
    
      if (selectedValue) {
        console.log('API seleccionada:', selectedValue);
      } else {
        console.warn('El valor seleccionado es nulo o no válido.');
      }
    }*/

  onNombreApiChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedIndex = parseInt(selectElement.value, 10);

    if (!isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < this.apisInfo.length) {
      const selectedApi = this.apisInfo[selectedIndex];
      this.apiSeleccionada = { nombre: selectedApi.nombre, entorno: selectedApi.entorno };
      console.log('API seleccionada:', this.apiSeleccionada);
    } else {
      this.apiSeleccionada = null;
      console.warn('El índice seleccionado es inválido.');
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
        /*this.nombresApis = data.cliente.api.map((api: any) => {
          if (api.nombre.startsWith('/')) {
            return api.nombre.slice(1);
          }
          return api.nombre;
        });
        console.log(this.nombresApis)*/
        this.apisInfo = data.cliente.api.map((api: any) => ({
          nombre: api.nombre.startsWith('/') ? api.nombre.slice(1) : api.nombre,
          entorno: api.entorno,
        }));

        console.log('Información de APIs:', this.apisInfo);
      } else {
        console.error('Estructura de datos inesperada:', data);
      }

      window.dispatchEvent(new CustomEvent('apiDataFetched', { detail: data }));
    } catch (error) {
      console.error('Error al consultar la API:', error);
    }
  }

}
