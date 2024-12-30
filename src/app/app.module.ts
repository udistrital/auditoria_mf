import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuditoriaComponent } from './pages/auditoria/auditoria.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker'; 
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VerDetalleLogDialogComponent } from './pages/auditoria/components/ver-detalle-log-dialog/ver-detalle-log-dialog.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
//import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core/dist/index.js';
//import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from 'src/environments/environment';

/*export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.apiUrl + 'assets/i18n/', '.json');
}*/

@NgModule({
  declarations: [
    AppComponent,
    AuditoriaComponent,
    VerDetalleLogDialogComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatFormFieldModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTableModule,
    MatIconModule,
    MatNativeDateModule,
    MatDatepickerModule, 
    MatInputModule, 
    MatDialogModule,
    BrowserAnimationsModule,
    HttpClientModule,
    /*TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),*/
  ],
  providers: [
    /*TranslateService,
    TranslateStore,*/
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
