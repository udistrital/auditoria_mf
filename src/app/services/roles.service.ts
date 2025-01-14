import { Injectable } from '@angular/core';
import { RequestManager } from '../managers/requestManager';

@Injectable({
  providedIn: 'root',
})

export class RolesService {

  constructor(private requestManager: RequestManager) {
    this.requestManager.setPath('ROLES_JBPM_SERVICE');
  }

  get(endpoint: any) {
    return this.requestManager.get(endpoint);
  }

  post(endpoint: any, element: any) {
    return this.requestManager.post(endpoint, element);
  }

  put(endpoint: any, element: any) {
    return this.requestManager.put(endpoint, element);
  }

  delete(endpoint: any, element: any) {
    return this.requestManager.delete(endpoint, element.Id);
  }
}