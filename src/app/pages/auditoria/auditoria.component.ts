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
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { AuditoriaMidService } from 'src/app/services/auditoria_mid.service';
import { driver } from 'driver.js';
import { tutorialHome } from './tutorial';
import { InfoRootDetail, LogData } from 'src/app/helpers/interfaces/IAuditoria';
import { environment } from 'src/environments/environment';

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
      palabraClave: formValues.palabraClave,
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

  private funcionFormateoLog(jsonString: string): string {
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
      // Clonar los datos para no modificar el original
      const exportData = this.dataSource.data.map(item => {
        const clonedItem = {...item};
        
        // Formatear los campos JSON para mejor legibilidad
        if (clonedItem.PETICIONREALIZADA) {
          try {
            clonedItem.PETICIONREALIZADA = this.formatJsonForCSV(clonedItem.PETICIONREALIZADA);
          } catch (e) {
            console.warn('No se pudo formatear PETICIONREALIZADA:', e);
          }
        }
        
        if (clonedItem.EVENTOBD) {
          try {
            clonedItem.EVENTOBD = this.formatJsonForCSV(clonedItem.EVENTOBD);
          } catch (e) {
            console.warn('No se pudo formatear EVENTOBD:', e);
          }
        }
        
        return clonedItem;
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

  private formatJsonForCSV(jsonString: string): string {
    try {
      const jsonObj = JSON.parse(jsonString);
      return JSON.stringify(jsonObj, null, 2)
        .replace(/\n/g, ' ') // Reemplazar saltos de línea
        .replace(/\r/g, ' ') // Reemplazar retornos de carro
        .replace(/"/g, "'");  // Reemplazar comillas dobles por simples
    } catch (e) {
      return jsonString; // Si no es JSON válido, devolver el string original
    }
  }

  private convertToCSV(data: LogData[]): string {
    // Definir las columnas que queremos exportar
    const columns = [
      'MODIFICACION', 'FECHA', 'ROLES', 'NOMBRERESPONSABLE', 
      'DOCUMENTORESPONSABLE', 'DIRECCIONACCION', 'APISCONSUMEN',
      'PETICIONREALIZADA', 'EVENTOBD', 'TIPOERROR', 'MENSAJEERROR'
    ];
    
    // Crear el encabezado CSV
    let csv = columns.join(';') + '\n';
    
    // Agregar los datos
    data.forEach((item: LogData) => {
      const row = columns.map(col => {
        // Usar type assertion para acceder a las propiedades dinámicas
        const value = item[col as keyof LogData] || '';
        if (typeof value === 'string') {
          // Limpiar formato JSON si es necesario
          if (col === 'PETICIONREALIZADA' || col === 'EVENTOBD') {
            try {
              const jsonObj = JSON.parse(value);
              return `"${JSON.stringify(jsonObj).replace(/"/g, '""')}"`;
            } catch (e) {
              return `"${value.replace(/"/g, '""')}"`;
            }
          }
          return `"${value.replace(/"/g, '""')}"`;
        }
        return `"${String(value)}"`;
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
}
