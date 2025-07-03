import { Component, OnInit, signal, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { VerDetalleLogDialogComponent } from './components/ver-detalle-log-dialog/ver-detalle-log-dialog.component';
import { PopUpManager } from '../../managers/popUpManager';
import { MAPEO_APIS } from 'src/app/shared/constantes';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { from, throwError } from 'rxjs';
import { catchError, tap, map, switchMap, finalize } from 'rxjs/operators';
import { AuditoriaMidService } from 'src/app/services/auditoria_mid.service';
import { driver } from 'driver.js';
import { tutorialHome } from './tutorial';
import { InfoRootDetail, LogData } from 'src/app/helpers/interfaces/IAuditoria';
import { environment } from 'src/environments/environment';
import { fechaHastaMayorQueDesde } from 'src/app/helpers/validators/restriccion-fechas';

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator !: MatPaginator;
  @Input('normalform') normalform: any;
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

  constructor(public dialog: MatDialog, private fb: FormBuilder, private popUpManager: PopUpManager,
    private auditoriaMidService: AuditoriaMidService,) {
    this.logForm = this.fb.group({
      fechaDesde: ['', Validators.required],
      horaDesde: ['', [Validators.required, this.timeValidator]],
      fechaHasta: ['', Validators.required],
      horaHasta: ['', [Validators.required, this.timeValidator]],
      tipo_log: ['', Validators.required],
      codigoResponsable: [''],
      nombreApi: ['', Validators.required],
      palabraClave: ['',]
    }, { validators: fechaHastaMayorQueDesde });
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
      palabraClave: formValues.palabraClave,
      nombreApi: this.apiSeleccionada.nombre,
      entornoApi: this.apiSeleccionada.entorno,
      pagina: 1,
      limite: 5000
    };

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
      .pipe(
        finalize(() => {
          this.popUpManager.showSuccessAlert('Datos cargados con éxito');
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response && response.Data) {
            // Asignar datos directamente al dataSource
            this.dataSource = new MatTableDataSource(response.Data);

            // Configurar paginación con los metadatos
            if (response.Pagination) {
              this.paginator.length = response.Pagination.total;
              this.paginator.pageSize = 100;
            }
            this.dataSource.paginator = this.paginator;

          } else {
            this.popUpManager.showErrorAlert('No se encontraron registros');
          }
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

  private procesarResultados(resultados: any[]): Promise<void> {
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

  abrirDialogVerDetalleLog(element: any): void {
    const dialogRef = this.dialog.open(VerDetalleLogDialogComponent, {
      width: '85%',
      height: 'auto',
      maxHeight: '65vh',
      data: {
        ACCIONES: 'Ver',
        NOMBRERESPONSABLE: 'Sin nombre',
        DOCUMENTORESPONSABLE: this.extraerDatosLog(element, 'documentoResponsable') || 'Sin documento',
        DIRECCIONACCION: this.extraerDatosLog(element, 'direccionAccion') || 'Sin direccion',
        MODIFICACION: this.extraerDatosLog(element, 'tipo_log') || 'Sin tipo',
        FECHA: this.extraerDatosLog(element, 'fecha') || 'Sin fecha',
        ROL: this.extraerDatosLog(element, 'usuario') || null,
        ROLES: this.extraerDatosLog(element, 'rol') || 'Rol no encontrado',
        APISCONSUMEN: this.extraerDatosLog(element, 'app_name') || 'Sin apis',
        PETICIONREALIZADA: this.extraerDatosLog(element, 'peticion') || 'Sin peticion',
        EVENTOBD: this.extraerDatosLog(element, 'sql_orm') || 'Sin evento de la BD',
        TIPOERROR: this.extraerDatosLog(element, 'tipo_log') || 'Sin tipo de error',
        MENSAJEERROR: element || 'Sin mensaje de error',
      }
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

  private fetchApiData(rootClienteId: string): void {
    const baseUrl = environment.ROLES_JBPM_SERVICE;
    const token = localStorage.getItem("access_token");
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
    const url = `${baseUrl}apis_cliente?cliente=${encodeURIComponent(rootClienteId)}`;
    from(fetch(url, { headers })).pipe(
      switchMap(response => {
        if (!response.ok) {
          return response.text().then(errorText => {
            throw new Error(`Error HTTP: ${response.status}, Detalles: ${errorText}`);
          });
        }
        return from(response.json());
      }),
      tap(data => {}),
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
      steps: tutorialHome,
    });

    driverObj.drive();
  }

  exportToCSV(): void {
    if (!this.dataSource || this.dataSource.data.length === 0) {
      this.popUpManager.showErrorAlert('No hay datos para exportar');
      return;
    }

    this.popUpManager.showLoaderAlert('Generando archivo CSV, por favor espere...');

    try {
      // Procesar cada registro para extraer los datos necesarios
      const exportData = this.dataSource.data.map(log => {
        return {
          MODIFICACION: this.extraerDatosLog(log, 'tipo_log') || 'Sin tipo',
          FECHA: this.extraerDatosLog(log, 'fecha') || 'Sin fecha',
          ROLES: this.extraerDatosLog(log, 'rol') || 'Rol no encontrado',
          NOMBRERESPONSABLE: this.extraerDatosLog(log, 'usuario') || 'Sin nombre',
          DOCUMENTORESPONSABLE: this.extraerDatosLog(log, 'documentoResponsable') || 'Sin documento',
          DIRECCIONACCION: this.extraerDatosLog(log, 'direccionAccion') || 'Sin direccion',
          APISCONSUMEN: this.extraerDatosLog(log, 'app_name') || 'Sin apis',
          PETICIONREALIZADA: this.extraerDatosLog(log, 'peticion') || 'Sin peticion',
          EVENTOBD: this.extraerDatosLog(log, 'sql_orm') || 'Sin evento de la BD',
          TIPOERROR: this.extraerDatosLog(log, 'tipo_log') || 'Sin tipo de error',
          MENSAJEERROR: JSON.stringify(log) || 'Sin mensaje de error'
        };
      });

      const csvContent = this.convertToCSV(exportData);
      this.downloadCSV(csvContent, `logs_auditoria_${new Date().toISOString().slice(0, 10)}.csv`);
      this.popUpManager.showSuccessAlert('Archivo CSV generado con éxito');
    } catch (error) {
      console.error('Error al exportar a CSV:', error);
      this.popUpManager.showErrorAlert('Error al generar el archivo CSV');
    } finally {
      Swal.close();
    }
  }

  private convertToCSV(data: any[]): string {
    // Definir las columnas que queremos exportar
    const columns = [
      'MODIFICACION', 'FECHA', 'ROLES', 'NOMBRERESPONSABLE',
      'DOCUMENTORESPONSABLE', 'DIRECCIONACCION', 'APISCONSUMEN',
      'PETICIONREALIZADA', 'EVENTOBD', 'TIPOERROR', 'MENSAJEERROR'
    ];

    // Crear el encabezado CSV
    let csv = columns.join(';') + '\n';

    // Agregar los datos
    data.forEach((item: any) => {
      const row = columns.map(col => {
        const value = item[col] || '';
        // Escapar comillas y saltos de línea para formato CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csv += row.join(';') + '\n';
    });

    return csv;
  }

  private downloadCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  extraerDatosLog(log: any, parametro: string) {
    // Definimos los patrones de búsqueda para cada parámetro
    const patrones: any = {
      sql_orm: /sql_orm:\s\{(.*?)\},\s+ip_user:/,
      host: /host: ([^,]*)/,
      tipo_log: /\[([a-zA-Z0-9._-]+)(?=\.\w+:)/,
      fecha: /\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\.\d{3}/,
      usuario: /, user:\s([^\s,]+\s([a-zA-Z0-9._-]+))/,
      endpoint: /end_point:\s([^\s,]+)/,
      metodo: /method: ([^,]*)/,
      ip_user: /ip_user: ([^,]*)/,
      user_agent: /user_agent:\s([^\s,]+)/,
      app_name: /app_name: ([^,]*)/,
      fecha_iso: /date: ([^,]*)/,
      router_pattern: /RouterPattern":"([^"]*)"/,
      apiConsumen: /app_name:\s([^\s,]+)/,
      api: /host:\s([^\s,]+)/,
      direccionAccion: /ip_user:\s([^\s,]+)/,
      data: /data:\s({.*})/,
    };

    try {
      switch (parametro) {
        case 'sql_orm':
          const matchSql = log.match(patrones.sql_orm);
          return matchSql ? matchSql[1].trim() : null;

        case 'host':
          const matchHost = log.match(patrones.host);
          return matchHost ? matchHost[1].trim() : null;

        case 'tipo_log':
          const matchTipo = log.match(patrones.tipo_log);
          return matchTipo[1];

        case 'fecha':
          const matchFecha = log.match(patrones.fecha);
          return matchFecha ? matchFecha[0].trim() : null;

        case 'peticion':
          const data: any = {
            end_point: this.extraerDatosLog(log, 'end_point') || '/',
            api: this.extraerDatosLog(log, 'host'),
            metodo: this.extraerDatosLog(log, 'metodo'),
            usuario: this.extraerDatosLog(log, 'user'),
            data: this.extraerDatosLog(log, 'data'),
          }
          return JSON.stringify(data, null, 2);

        case 'user':
          const matchUser = log.match(patrones.usuario);
          return matchUser[1] ? matchUser[1].trim() : null;
        case 'usuario':
          const matchUsuario = log.match(patrones.usuario);
          let usuario = matchUsuario && matchUsuario[1] ? matchUsuario[1].trim() : "";

          const INVALIDOS = ["N/A", "Error", "Error WSO2", "", "null", undefined, null];

          if (!INVALIDOS.includes(usuario)) {
            usuario += "@udistrital.edu.co";
          } else {
            usuario = "Error WSO2 - Sin usuario";
          }

          return usuario;

        default:
          if (patrones[parametro]) {
            const match = log.match(patrones[parametro]);
            return match ? match[1].trim() : null;
          }
          return null;
      }
    } catch (e) {
      console.error(`Error al procesar el log: ${e}`);
      return null;
    }
  }
}
