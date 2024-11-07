import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditoriaComponent } from '../app/pages/auditoria/auditoria.component'

const routes: Routes = [
  {
    path: "auditoria",
    component: AuditoriaComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 


}
