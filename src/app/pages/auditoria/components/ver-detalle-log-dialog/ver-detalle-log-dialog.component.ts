import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
      peticionRealizada: [this.formatForDisplay(this.data.PETICIONREALIZADA) || '' || ''],
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
  private safeJsonParse(jsonString: string | object): any {
    if (typeof jsonString === 'object') return jsonString;

    try {
      // Limpieza básica del string
      let cleanStr = jsonString.replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\t/g, '');

      // Corrige JSON malformado
      if (!cleanStr.startsWith('{') && !cleanStr.startsWith('[')) {
        const jsonStart = cleanStr.indexOf('{');
        if (jsonStart > -1) {
          cleanStr = cleanStr.substring(jsonStart);
        }
      }

      if (!cleanStr.endsWith('}') && !cleanStr.endsWith(']')) {
        const jsonEnd = cleanStr.lastIndexOf('}');
        if (jsonEnd > -1) {
          cleanStr = cleanStr.substring(0, jsonEnd + 1);
        }
      }

      return JSON.parse(cleanStr);
    } catch (e) {
      console.error('Error parseando JSON:', e);
      return jsonString;
    }
  }
  private formatForDisplay(data: any): string {
    try {
      const parsed = this.safeJsonParse(data);
      return JSON.stringify(parsed, (key, value) => {
        if (key === 'data' && typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      }, 2);
    } catch (e) {
      return typeof data === 'string' ? data : JSON.stringify(data);
    }
  }

  private formatJsonForDisplay(jsonString: string | object): string {
    try {
      // Si ya es un objeto, lo convertimos directamente
      if (typeof jsonString === 'object') {
        return JSON.stringify(jsonString, null, 2);
      }

      // Si es un string, intentamos parsearlo
      let parsed = JSON.parse(jsonString);

      // Procesamiento especial para el campo data
      if (parsed.data && typeof parsed.data === 'string') {
        try {
          parsed.data = JSON.parse(parsed.data);
        } catch (e) {
          console.warn('No se pudo parsear el campo data:', e);
        }
      }

      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      console.warn('Error al formatear JSON:', e);
      return typeof jsonString === 'string' ? jsonString : JSON.stringify(jsonString);
    }
  }
  /**
   * Formatea un valor para su inclusión segura en una consulta SQL
   * @param value Valor a formatear
   * @returns Valor formateado como string SQL
   */
  private formatValueForSql(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    switch (typeof value) {
      case 'string':
        // Escapar comillas simples y envolver en comillas
        return `'${value.replace(/'/g, "''")}'`;
      case 'number':
        return value.toString();
      case 'boolean':
        return value ? 'true' : 'false';
      case 'object':
        if (value instanceof Date) {
          return `'${value.toISOString()}'::timestamp`;
        }
        // Intentar manejar otros objetos como JSON
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      default:
        return `'${value}'`;
    }
  }

  buildDirectSqlQuery(textData: string): string {
    console.log('textData', textData);
    const sqlQueries = textData.trim().replace('[', '').split('] -');
    const parametrizedQuery = sqlQueries[0]
    const values = [sqlQueries[1]]
    console.log('parametrizedQuery', parametrizedQuery);
    console.log('------------------------------------');
    console.log('values', values);
    // Extraer la parte VALUES de la consulta
    /*const valuesStartIndex = parametrizedQuery.indexOf('VALUES');
    if (valuesStartIndex === -1) {
      throw new Error('La consulta no contiene una cláusula VALUES');
    }

    const beforeValues = parametrizedQuery.substring(0, valuesStartIndex + 6); // +6 para incluir "VALUES"
    const afterValues = parametrizedQuery.substring(valuesStartIndex + 6);

    // Procesar valores
    const processedValues = values.map(value => this.formatValueForSql(value));

    // Construir la nueva consulta*/
    return parametrizedQuery//`${beforeValues} (${processedValues.join(', ')})${afterValues}`;
  }

}
