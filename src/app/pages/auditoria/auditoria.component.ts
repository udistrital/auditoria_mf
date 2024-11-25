import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { VerDetalleLogDialogComponent } from './components/ver-detalle-log-dialog/ver-detalle-log-dialog.component';
import { HttpClient } from '@angular/common/http';

interface LogData {
  IDLOG: string;
  MODIFICACION: string;
  FECHA: string;
  ROL: string;
  ACCIONES?: string; 
}

@Component({
  selector: 'app-auditoria',
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {
  columnasBusqueda = signal<string[]>(["IDLOG", "MODIFICACION", "FECHA", "ROL", "ACCIONES"]);
  tiposLogs: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'MIDDLEWARE'];

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1); 
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1); 
  years: number[] = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  logForm !:  FormGroup;
  dataSource!: MatTableDataSource<LogData>;
  logData: LogData[] = [
    { IDLOG: '01', MODIFICACION: 'MODIFICACIÓN', FECHA: '2018-18-04 15:16:00', ROL: 'SUPERVISOR', ACCIONES: 'Ver' },
    { IDLOG: '02', MODIFICACION: 'CREACIÓN', FECHA: '2019-12-10 11:10:00', ROL: 'ADMIN', ACCIONES: 'Ver' },
  ];

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.logForm = this.fb.group({
      /*diaDesde: ['', [Validators.required, Validators.maxLength(2)]],
      mesDesde: ['', [Validators.required, Validators.maxLength(2)]],
      anioDesde: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      diaHasta: ['', [Validators.required, Validators.maxLength(2)]],
      mesHasta: ['', [Validators.required, Validators.maxLength(2)]],
      anioHasta: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],*/
      fechaDesde: [''],
      horaDesde: ['', [Validators.required, this.timeValidator]], 
      fechaHasta: [''],
      horaHasta: ['', [Validators.required, this.timeValidator]],
      tipoLog: [''],
      codigoResponsable: [''],
      rolResponsable: ['']
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.logData);
    //this.dataSource.paginator = this.paginator;
  }

  /*buscarLogs(): void {
    const formValues = this.logForm.value;

    const payload = {
      fechaInicio: formValues.fechaDesde,
      horaInicio: formValues.horaDesde,
      fechaFin: formValues.fechaHasta,
      horaFin: formValues.horaHasta,
      tipoLog: formValues.tipoLog,
      codigoResponsable: formValues.codigoResponsable,
      rolResponsable: formValues.rolResponsable
    };

    console.log('Datos enviados a la API:', payload);

      this.http.post('http://localhost:8035/v1/auditoria/buscarLog', payload)
      .subscribe({
        next: (response: any) => {
          console.log('Respuesta de la API:', response);
          console.log('Todos los logs recibidos:', response.Data)
          if (Array.isArray(response.Data)) {
            response.Data.forEach((log: any) => {
              console.log('Log recibido:', log);
            });
          } else {
            console.log('Log recibido:', response.Data);
          }
        },
        error: (error) => {
          console.error('Error al enviar datos a la API:', error);
        }
      });
  }*/

      buscarLogs(): void {
        const formValues = this.logForm.value;
      
        const payload = {
          fechaInicio: formValues.fechaDesde,
          horaInicio: formValues.horaDesde,
          fechaFin: formValues.fechaHasta,
          horaFin: formValues.horaHasta,
          tipoLog: formValues.tipoLog,
          codigoResponsable: formValues.codigoResponsable,
          rolResponsable: formValues.rolResponsable,
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
          IDLOG: log.idLog || 'Sin ID',
          MODIFICACION: log.tipoLog || 'Sin tipo',
          FECHA: log.fecha || 'Sin fecha',
          ROL: log.rolResponsable || 'Sin rol',
          ACCIONES: 'Ver',  
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

  

  abrirDialogVerDetalleLog(element: any): void{
    const dialogRef = this.dialog.open(VerDetalleLogDialogComponent, {
      width: '85%',
      height: 'auto',
      maxHeight: '65vh',
      data: element
      /*data: {
        IDLOG: element.IDLOG,
        MODIFICACION: element.MODIFICACION,
        FECHA: element.FECHA,
        ROL: element.ROL,
        NOMBRERESPONSABLE: element.NOMBRERESPONSABLE,
        DOCUMENTORESPONSABLE: element.DOCUMENTORESPONSABLE,
        DIRECCIONACCION: element.DIRECCIONACCION,
        APISCONSUMEN: element.APISCONSUMEN,
        PETICIONREALIZADA: element.PETICIONREALIZADA,
        EVENTOBD: element.EVENTOBD,
        TIPOERROR: element.TIPOERROR,
        MENSAJEERROR: element.MENSAJEERROR
      }*/
    });
  }

 
  timeValidator(control: any): { [key: string]: boolean } | null {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (control.value && !timeRegex.test(control.value)) {
      return { 'invalidTime': true };
    }
    return null;
  }

}
