import { Injectable } from '@angular/core';
// @ts-ignore
import Swal, { SweetAlertResult } from 'sweetalert2/dist/sweetalert2';
//import { TranslateService } from '@ngx-translate/core/dist/index.js';

@Injectable({
    providedIn: 'root',
})
export class PopUpManager {
    constructor() { }

    showSuccessAlert(text: string) {
        Swal.fire({
            confirmButtonColor: '#8C1A18',
            icon: 'success',
            title: 'Operación exitosa',
            text: text,
            confirmButtonText: 'Aceptar',
        });
    }
    showErrorAlert(text: string) {
        Swal.fire({
            confirmButtonColor: '#8C1A18',
            icon: 'error',
            title: 'Error',
            text: text,
            confirmButtonText: 'Aceptar',
        });
    }
    showLoaderAlert(text: string){
        Swal.fire({
            title: text,
            allowEscapeKey: false,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
    showConfirmAlert(titulo: string, confirmar: string, denegar: string): Promise<boolean | null> {
        return Swal.fire({
            confirmButtonColor: '#188c18',
            title: titulo,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: confirmar,
            denyButtonText: denegar,
        }).then((result: SweetAlertResult ) => {
            if (result.isConfirmed) {
                return true;
            } else if (result.isDenied) {
                Swal.fire('Los cambios no fueron guardados', '', 'info');
                return false;
            } else {
                return null; 
            }
        });
    }
}