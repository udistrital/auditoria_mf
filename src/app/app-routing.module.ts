import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuditoriaComponent } from '../app/pages/auditoria/auditoria.component'
import { APP_BASE_HREF } from '@angular/common';

const routes: Routes = [
  {
    path: "auditoria",
    component: AuditoriaComponent
  },
  {
    path: "**",
    redirectTo: "auditoria"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}]
})
export class AppRoutingModule { 


}
