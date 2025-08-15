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
  private formatDataField(data: string): any {
  try {
    // Si ya es un objeto, lo devolvemos directamente
    if (typeof data === 'object') return data;
    
    // Limpieza inicial del string
    let cleanStr = data
      .trim()
      .replace(/^\(|\)$/g, '')  // Elimina paréntesis al inicio/final
      .replace(/\\"/g, '"')     // Reemplaza \" por "
      .replace(/\\n/g, '')      // Elimina saltos de línea escapados
      .replace(/\\t/g, '')      // Elimina tabulaciones escapadas
      .replace(/^"|"$/g, '');   // Elimina comillas al inicio y final

    // Corrección de problemas específicos en el string
    cleanStr = cleanStr
      .replace(/"RouterPattern":/g, '{"RouterPattern":')  // Añade llave inicial
      .replace(/"Success":true}}/g, '"Success":true}}"}') // Añade llave final y comilla
      .replace(/"Registration successfully,/g, '"Registration successfully",') // Arregla comillas faltantes
      .replace(/0001-01-01700:00:002/g, '0001-01-01T00:00:00Z') // Corrige formato de fecha
      .replace(/\\/g, '');      // Elimina barras invertidas residuales

    // Intenta parsear el JSON limpio
    return JSON.parse(cleanStr);
  } catch (e) {
    console.error('Error al formatear el campo data:', e);
    // Si falla, intentamos una estrategia más agresiva
    return this.extractJsonFromString(data) || data;
  }
}

private extractJsonFromString(str: string): any {
  // Busca el primer { y el último } para extraer el posible JSON
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) return null;
  
  try {
    const possibleJson = str.substring(firstBrace, lastBrace + 1);
    return JSON.parse(possibleJson
      .replace(/\\"/g, '"')
      .replace(/"([^"]+)":/g, '"$1":') // Normaliza las claves
      .replace(/'/g, '"') // Reemplaza comillas simples
    );
  } catch (e) {
    console.error('No se pudo extraer JSON:', e);
    return null;
  }
}
private formatForDisplay(data: any): string {
  try {
    // Caso especial para el campo 'data'
    if (typeof data === 'string' && data.includes('RouterPattern')) {
      const formattedData = this.formatDataField(data);
      return JSON.stringify(formattedData, null, 2);
    }
    
    // Intento de parseo estándar
    const parsed = typeof data === 'string' ? 
                 this.safeJsonParse(data) : data;
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    console.error('Error al formatear para visualización:', e);
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
