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
    let safeLogString = (this.data.MENSAJEERROR).toString().replace(/`/g, "\\`");
    const parsed = this.extractDataObject(JSON.stringify(safeLogString));
    console.log(safeLogString)
    console.log(parsed)
    const highlighted = this.syntaxHighlight(parsed);
    console.log(highlighted)
    this.dataLogForm = this.fb.group({
      apiConsume: [this.data.APISCONSUMEN || ''],
      peticionRealizada: [this.data.PETICIONREALIZADA || highlighted || ''],
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

  private extractDataObject(logString: string) {
    try {
      if (logString.trim().startsWith("data:")) {
        const jsonString = logString.trim().substring(5).trim();
        return JSON.parse(jsonString);
      }
      const dataIndex = logString.indexOf("data:");
      if (dataIndex === -1) return null;

      const dataSubstring = logString.substring(dataIndex + 5).trim();

      const firstBrace = dataSubstring.indexOf("{");
      if (firstBrace === -1) return null;

      let openBraces = 0;
      let endIndex = -1;

      for (let i = firstBrace; i < dataSubstring.length; i++) {
        if (dataSubstring[i] === "{") {
          openBraces++;
        } else if (dataSubstring[i] === "}") {
          openBraces--;
          if (openBraces === 0) {
            endIndex = i + 1; // cortar aquí
            break;
          }
        }
      }

      if (endIndex === -1) return null;

      let jsonLike = dataSubstring.substring(firstBrace, endIndex);

      // Limpiar comillas escapadas
      jsonLike = jsonLike.replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      const dataObject = JSON.parse(jsonLike);
      
      this.deepFix(dataObject);
      return dataObject;
    } catch (error) {
      console.error("Error al parsear el objeto data:", error);
      return null;
    }
  }

  private syntaxHighlight(json: any) {
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match: any) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  private deepFix(obj:any) {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        // Si parece JSON (empieza con { o [ )
        if (obj[key].startsWith("{") || obj[key].startsWith("[")) {
          try {
            obj[key] = JSON.parse(obj[key]);
            // Si el parseo fue exitoso, corregir recursivamente
            this.deepFix(obj[key]);
          } catch (e) {
            // no era JSON válido, lo dejamos como string
          }
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        this.deepFix(obj[key]);
      }
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
