import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { driver } from 'driver.js';

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

    console.log("data que llega:", this.data);
  }

  onCloseClick(){
    this.dialogRef.close();
  }

  startDetailTour() {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      steps: [
        {
          element: '#driver-detail-title',
          popover: {
            title: 'Detalle del Registro de Auditoría',
            description: 'Esta ventana muestra todos los detalles del registro de auditoría seleccionado.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#driver-close-btn',
          popover: {
            title: 'Cerrar Ventana',
            description: 'Haz clic aquí para cerrar esta ventana y volver a la lista de registros.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#driver-details-section',
          popover: {
            title: 'Información Básica',
            description: 'Esta sección contiene los datos principales del registro de auditoría.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#driver-name-field',
          popover: {
            title: 'Nombre del Responsable',
            description: 'Muestra el nombre del usuario que realizó la acción registrada.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-doc-field',
          popover: {
            title: 'Documento de Identidad',
            description: 'Documento de identificación del usuario responsable.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-ip-field',
          popover: {
            title: 'Dirección IP',
            description: 'Dirección IP desde donde se originó la acción.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-type-field',
          popover: {
            title: 'Tipo de Operación',
            description: 'Método HTTP utilizado (GET, POST, PUT, DELETE).',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#driver-date-field',
          popover: {
            title: 'Fecha y Hora',
            description: 'Marca de tiempo exacta cuando ocurrió el evento.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#driver-email-field',
          popover: {
            title: 'Correo Electrónico',
            description: 'Dirección de correo asociada al usuario responsable.',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#driver-transaction-section',
          popover: {
            title: 'Detalles de Transacción',
            description: 'Información técnica detallada sobre la operación realizada.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#driver-apis-textarea',
          popover: {
            title: 'APIs Consumidas',
            description: 'Lista de APIs que participaron en esta operación.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#driver-request-textarea',
          popover: {
            title: 'Petición Completa',
            description: 'Detalles completos de la solicitud HTTP realizada.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#driver-db-textarea',
          popover: {
            title: 'Operación en Base de Datos',
            description: 'Consulta SQL o acción ejecutada en la base de datos.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#driver-error-section',
          popover: {
            title: 'Información de Errores',
            description: 'Detalles de cualquier error que haya ocurrido durante la operación.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#driver-error-type-input',
          popover: {
            title: 'Tipo de Error',
            description: 'Clasificación del error ocurrido (si aplica).',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#driver-error-message-textarea',
          popover: {
            title: 'Mensaje de Error',
            description: 'Descripción detallada del error ocurrido.',
            side: 'top',
            align: 'start'
          }
        }
      ]
    });

    driverObj.drive();
  }
}
