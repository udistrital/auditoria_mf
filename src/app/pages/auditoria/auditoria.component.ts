import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { VerDetalleLogDialogComponent } from './components/ver-detalle-log-dialog/ver-detalle-log-dialog.component';

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
    private fb: FormBuilder
  ) {
    this.logForm = this.fb.group({
      diaDesde: ['', [Validators.required, Validators.maxLength(2)]],
      mesDesde: ['', [Validators.required, Validators.maxLength(2)]],
      anioDesde: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      horaDesde: ['', [Validators.required, this.timeValidator]], 
      diaHasta: ['', [Validators.required, Validators.maxLength(2)]],
      mesHasta: ['', [Validators.required, Validators.maxLength(2)]],
      anioHasta: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      horaHasta: ['', [Validators.required, this.timeValidator]],
    });
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.logData);
    //this.dataSource.paginator = this.paginator;
  }

  buscarLogs() {}

  abrirDialogVerDetalleLog(){
    const dialogRef = this.dialog.open(VerDetalleLogDialogComponent, {
      width: '85%',
      height: 'auto',
      maxHeight: '65vh'
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
