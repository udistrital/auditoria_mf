import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { driver } from 'driver.js';
import { tutorialDetalle } from '../../tutorial';

@Component({
  selector: 'app-ver-detalle-log-dialog',
  templateUrl: './ver-detalle-log-dialog.component.html',
  styleUrls: ['./ver-detalle-log-dialog.component.css']
})
export class VerDetalleLogDialogComponent {
  detallesLogForm !: FormGroup;
  dataLogForm !: FormGroup;
  errorLogForm !: FormGroup;

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

  onCloseClick() {
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

  // Formatear la consulta SQL
  buildDirectSqlQuery(textData: string): string {
    if (!textData) return 'No hay datos SQL disponibles';

    try {
      // Extraer la parte entre corchetes [SQL] - valores
      const sqlStart = textData.indexOf('[');
      const sqlEnd = textData.indexOf('] -');

      if (sqlStart === -1 || sqlEnd === -1) {
        return textData; // Retornar el texto original si no tiene el formato esperado
      }

      // Obtener la consulta SQL parametrizada
      let sqlQuery = textData.substring(sqlStart + 1, sqlEnd).trim();

      // Obtener los valores (eliminando las comillas invertidas y espacios)
      const valuesPart = textData.substring(sqlEnd + 3).trim();
      const values = valuesPart.split(',').map(v =>
        v.trim().replace(/^`|`$/g, '')
      );

      // Reemplazar los parámetros en la consulta SQL
      for (let i = 0; i < values.length; i++) {
        const param = `$${i + 1}`;
        const formattedValue = this.formatSqlValue(values[i]);
        sqlQuery = sqlQuery.replace(param, formattedValue);
      }

      // Formatear bonito el SQL resultante
      return this.formatSqlQuery(sqlQuery);
    } catch (error) {
      console.error('Error al procesar la consulta SQL:', error);
      return textData; // Si hay error, devolver el texto original
    }
  }

  private formatSqlValue(value: string): string {
    // Manejar valores NULL
    if (value === 'null' || value === 'NULL') {
      return 'NULL';
    }

    // Manejar booleanos
    if (value === 'true' || value === 'false') {
      return value;
    }

    // Manejar números
    if (!isNaN(Number(value))) {
      return value;
    }

    // Manejar fechas (formato: 2025-08-01 19:08:40.602 +0000 UTC)
    const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?( \+0000 UTC)?$/;
    if (dateRegex.test(value)) {
      // Extraer solo la parte de fecha y hora (ignorar milisegundos y zona horaria)
      const datePart = value.split(' ')[0];
      const timePart = value.split(' ')[1].split('.')[0];
      return `'${datePart} ${timePart}'::timestamp`;
    }

    // Para strings normales, escapar comillas simples
    return `'${value.replace(/'/g, "''")}'`;
  }

  private formatSqlQuery(sql: string): string {
    // Añadir saltos de línea después de palabras clave SQL
    const keywords = ['SELECT', 'INSERT INTO', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'VALUES', 'RETURNING',];

    let formattedSql = sql;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formattedSql = formattedSql.replace(regex, `\n${keyword}`);
    });

    // Añadir indentación
    formattedSql = formattedSql
      .split('\n')
      .map((line, index) => index > 0 ? '  ' + line : line)
      .join('\n');

    return formattedSql.trim();
  }

}
