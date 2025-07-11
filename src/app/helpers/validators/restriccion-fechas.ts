import { AbstractControl, ValidationErrors } from "@angular/forms";

export function fechaHastaMayorQueDesde(control: AbstractControl): ValidationErrors | null {
    const fechaDesde = control.get('fechaDesde')?.value;
    const horaDesde = control.get('horaDesde')?.value;
    const fechaHasta = control.get('fechaHasta')?.value;
    const horaHasta = control.get('horaHasta')?.value;

    if (!fechaDesde || !fechaHasta || !horaDesde || !horaHasta) {
        return null;
    }

    const desde = new Date(`${fechaDesde}T${horaDesde}`);
    const hasta = new Date(`${fechaHasta}T${horaHasta}`);

    if (hasta <= desde) {
        return { fechaHastaInvalida: true };
    }

    return null;
}