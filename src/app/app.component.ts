import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'auditoria-mf';
  constructor(@Inject('single-spa-props') private props: any) {
    console.log('Environment URL:', this.props.environment.apiUrl);
    console.log('Custom Data:', this.props.customData);
  }
}
