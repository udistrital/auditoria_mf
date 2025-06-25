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
import { from, of, throwError } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { AuditoriaMidService } from 'src/app/services/auditoria_mid.service';
import { driver } from 'driver.js';

export interface LogData {
  MODIFICACION: string;
  FECHA: string;
  ROLES: string;
  ACCIONES?: string;
}

export interface InfoRootDetail {
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
      fechaDesde: ['', Validators.required],
      horaDesde: ['', [Validators.required, this.timeValidator]],
      fechaHasta: ['', Validators.required],
      horaHasta: ['', [Validators.required, this.timeValidator]],
      tipo_log: ['', Validators.required],
      codigoResponsable: [''],
      nombreApi: ['', Validators.required],
      palabraClave: ['',]
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
    window.addEventListener('infoRoot', (event: Event) => {
      const customEvent = event as CustomEvent<InfoRootDetail>;
      if (customEvent.detail.appName === '@udistrital/auditoria-mf') {
        if (customEvent.detail.clienteId && customEvent.detail.clienteId.trim() !== '') {
          console.log('Cliente ID recibido:', customEvent.detail.clienteId);
          this.fetchApiData(customEvent.detail.clienteId);
        } else {
          alert('No esta llegando el clienteId del root');
        }
      }
    });

    window.dispatchEvent(new CustomEvent('clienteAuditoria', { detail: { appName: '@udistrital/auditoria-mf' } }));
  }

  buscarLogs(): void {
    this.dataSource.data = [];
    this.popUpManager.showLoaderAlert('Obteniendo datos, por favor espere.');
    const formValues = this.logForm.value;

    if (!this.apiSeleccionada) {
      this.popUpManager.showErrorAlert('Debe seleccionar una API válida.');
      return;
    }

    const payload: { [key: string]: any } = {
      fechaInicio: formValues.fechaDesde,
      horaInicio: formValues.horaDesde,
      fechaFin: formValues.fechaHasta,
      horaFin: formValues.horaHasta,
      tipo_log: formValues.tipo_log,
      codigoResponsable: formValues.codigoResponsable,
      nombreApi: this.apiSeleccionada.nombre,
      entornoApi: this.apiSeleccionada.entorno,
      pagina: 1,
      limite: 5000
    };
    console.log(payload)

    const requiredFields = ['fechaInicio', 'horaInicio', 'fechaFin', 'horaFin', 'tipo_log', 'nombreApi', 'entornoApi'];
    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      this.popUpManager.showErrorAlert(
        `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`
      );
      Swal.close();
      return;
    }

    this.auditoriaMidService.buscarLogsFiltrados(payload)
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta de la API:', response);
          const logs = this.transformarRespuesta(response);

          if (!Array.isArray(logs)) {
            this.popUpManager.showErrorAlert('Error al procesar los datos devueltos por la API.');
            throw new Error('Error en la transformación de datos');
          }
          if (response && response.Data) {
            // Asignar datos directamente al dataSource
            this.dataSource = new MatTableDataSource(response.Data);
            this.dataSource.paginator = this.paginator;

            // Configurar paginación con los metadatos
            if (response.Pagination) {
              this.paginator.length = response.Pagination.total;
              this.paginator.pageSize = 100;
            }

          } else {
            this.popUpManager.showErrorAlert('No se encontraron registros');
          }

          return this.procesarResultados(logs); // debe devolver Observable o Promise
        },
        error: (error) => {
          console.error('Error en la petición:', error);
          if (error.status === 404) {
            this.popUpManager.showErrorAlert('No se encontraron datos en el rango de fechas y horas especificado, asociados con el tipo de LOG.');
          } else {
            this.popUpManager.showErrorAlert('Se generó un error al buscar los datos.');
          }
          return [];
        }
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
      MODIFICACION: log.tipo_log || 'Sin tipo',
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

  fetchApiData(rootClienteId: string): void {
    const baseUrl = 'https://autenticacion.portaloas.udistrital.edu.co/apioas/roles/v1';
    const token = localStorage.getItem("access_token");
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
    const url = `${baseUrl}/apis_cliente?cliente=${encodeURIComponent(rootClienteId)}`;
    from(fetch(url, { headers })).pipe(
      switchMap(response => {
        if (!response.ok) {
          return response.text().then(errorText => {
            throw new Error(`Error HTTP: ${response.status}, Detalles: ${errorText}`);
          });
        }
        return from(response.json());
      }),
      tap(data => console.log(data)),
      map(data => {
        if (data?.cliente?.api) {
          this.apisInfo = data.cliente.api.map((api: any) => {
            const nombre = api.nombre.startsWith('/') ? api.nombre.slice(1) : api.nombre;
            api.nombre = MAPEO_APIS[nombre] || nombre;
            return {
              nombre: api.nombre,
              entorno: api.entorno,
            };
          });
          console.log('Información de APIs:', this.apisInfo);
        }
        return data;
      }),
      tap(data => {
        window.dispatchEvent(new CustomEvent('apiDataFetched', { detail: data }));
      }),
      catchError(error => {
        console.error('Error al consultar la API:', error);
        return throwError(() => error);
      })
    ).subscribe();
  }

  startTour() {
    const driverObj = driver({
      //overlayColor: '#ba8181',
      popoverClass: 'driverjs-theme',
      showProgress: true,
      steps: [
        {
          element: '#driver-title',
          popover: {
            title: 'Módulo de Auditoría',
            description: 'Bienvenido al módulo de auditoría del sistema. Aquí podrás consultar todos los registros de actividad.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#driver-subtitle',
          popover: {
            title: 'Búsqueda de Logs',
            description: 'En esta sección puedes filtrar los registros de auditoría según diferentes criterios.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#driver-fecha-label',
          popover: {
            title: 'Rango de Fechas',
            description: 'Selecciona el rango de fechas para filtrar los registros. Puedes especificar fecha y hora exactas.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-fecha-desde-input',
          popover: {
            title: 'Fecha de inicio',
            description: 'Selecciona la fecha y hora desde la cual deseas iniciar la búsqueda de logs. Asegúrate de que esté dentro del rango disponible del sistema',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-fecha-hasta-input',
          popover: {
            title: 'Fecha final',
            description: 'Elige la fecha y hora hasta la cual deseas buscar los registros. Esta fecha debe ser posterior a la fecha de inicio.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-tipo-log-label',
          popover: {
            title: 'Tipo de Operación',
            description: 'Filtra por tipo de operación HTTP (GET, POST, PUT, DELETE) para encontrar registros específicos.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-api-label',
          popover: {
            title: 'API Específica',
            description: 'Selecciona el nombre del servicio o API sobre el que deseas ver los registros.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-codigo-label',
          popover: {
            title: 'Código de Responsable',
            description: 'Opcionalmente, puedes filtrar por el código del usuario que realizó la acción.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#driver-buscar-btn',
          popover: {
            title: 'Buscar Registros',
            description: 'Haz clic aquí para ejecutar la búsqueda con los filtros seleccionados.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#driver-tabla',
          popover: {
            title: 'Resultados de Búsqueda',
            description: 'Aquí se mostrarán los registros que coincidan con tus criterios de búsqueda.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#driver-col-tipo',
          popover: {
            title: 'Tipo de Operación',
            description: 'Muestra el método HTTP utilizado en la operación registrada.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#driver-col-fecha',
          popover: {
            title: 'Fecha y Hora',
            description: 'Indica cuándo se realizó la operación registrada.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#driver-col-rol',
          popover: {
            title: 'Rol del Usuario',
            description: 'Muestra el rol del usuario que realizó la operación.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#driver-btn-detalle',
          popover: {
            title: 'Ver Detalles',
            description: 'Haz clic en el ícono de ojo para ver todos los detalles del registro seleccionado.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#driver-paginador',
          popover: {
            title: 'Navegación',
            description: 'Usa estos controles para navegar entre páginas de resultados.',
            side: 'top',
            align: 'center'
          }
        }
      ]
    });

    driverObj.drive();
  }
}
