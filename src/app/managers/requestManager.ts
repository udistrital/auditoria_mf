import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorManager } from './errorManager';

@Injectable({
  providedIn: 'root',
})
export class RequestManager {
  private path!: string;
  public httpOptions: any;

  constructor(private http: HttpClient, private errManager: HttpErrorManager) {
    const access_token = window.localStorage.getItem('access_token');
    if (access_token !== null) {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json',
        }),
      };
    }
  }

  /**
   * Use for set the source path of the service (service's name must be present at src/environment/environment.ts)
   * @param service: string
   */
  public setPath(service: string) {
    const path = environment[service as keyof typeof environment];
    if (typeof path === 'string') {
      this.path = path;
    } else {
      throw new Error(`The path for service ${service} is not a string.`);
    }
  }

  /**
   * Perform a GET http request
   * @param endpoint service's end-point
   * @returns Observable<any>
   */
  get(endpoint: string) {
    return this.http.get<any>(`${this.path}${endpoint}`, this.httpOptions).pipe(
      map((res) => {
        if (res.hasOwnProperty('Body')) {
          return res;
        } else {
          return res;
        }
      }),
      catchError(this.errManager.handleError)
    );
  }

  /**
   * Perform a POST http request
   * @param endpoint service's end-point
   * @param element data to be sent in the request body
   * @returns Observable<any>
   */
  post(endpoint: string, element: any) {
    return this.http.post<any>(`${this.path}${endpoint}`, element, this.httpOptions).pipe(
      map((res) => {
        if (res.hasOwnProperty('Body')) {
          return res;
        } else {
          return res;
        }
      }),
      catchError(this.errManager.handleError)
    );
  }

  /**
   * Perform a PUT http request
   * @param endpoint service's end-point
   * @param element data to be sent in the request body
   * @returns Observable<any>
   */
  put(endpoint: string, element: any) {
    return this.http.put<any>(`${this.path}${endpoint}`, element, this.httpOptions).pipe(
      map((res) => {
        if (res.hasOwnProperty('Body')) {
          return res;
        } else {
          return res;
        }
      }),
      catchError(this.errManager.handleError)
    );
  }

  /**
   * Perform a DELETE http request
   * @param endpoint service's end-point
   * @param id identifier of the element to be deleted
   * @returns Observable<any>
   */
  delete(endpoint: string, id: any) {
    return this.http.delete<any>(`${this.path}${endpoint}/${id}`, this.httpOptions).pipe(
      map((res) => {
        if (res.hasOwnProperty('Body')) {
          return res;
        } else {
          return res;
        }
      }),
      catchError(this.errManager.handleError)
    );
  }
}