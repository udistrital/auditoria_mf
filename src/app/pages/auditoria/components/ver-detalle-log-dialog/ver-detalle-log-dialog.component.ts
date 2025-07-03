import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { driver } from 'driver.js';
import { tutorialDetalle } from '../../tutorial';

@Component({
  selector: 'app-ver-detalle-log-dialog',
  templateUrl: './ver-detalle-log-dialog.component.html',
  styleUrls: ['./ver-detalle-log-dialog.component.css']
})
export class VerDetalleLogDialogComponent {
  detallesLogForm !:  FormGroup;
  dataLogForm !:  FormGroup;
  errorLogForm !:  FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<VerDetalleLogDialogComponent>,
    private fb: FormBuilder
  ) {
    this.detallesLogForm = this.fb.group({
      nombreResponsable: [this.data.NOMBRERESPONSABLE || ''],
      documentoResponsable: [this.data.DOCUMENTORESPONSABLE || ''],
      direccionAccion: [this.data.DIRECCIONACCION || ''],
      tipo_log: [this.data.MODIFICACION || ''],
      fechaEjecucion: [this.data.FECHA || ''],
      rol: [this.data.ROL || '']
    });

    this.dataLogForm = this.fb.group({
      apiConsume: [this.data.APISCONSUMEN || ''],
      peticionRealizada: [this.data.PETICIONREALIZADA || ''],
      eventoBD: [this.data.EVENTOBD || '']
    });

    this.errorLogForm = this.fb.group({
      tipoError: [this.data.TIPOERROR || ''],
      mensajeError: [this.data.MENSAJEERROR || '']
    });
  }

  onCloseClick(){
    this.dialogRef.close();
  }

  startDetailTour() {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      steps: tutorialDetalle,
    });

    driverObj.drive();
  }
}
