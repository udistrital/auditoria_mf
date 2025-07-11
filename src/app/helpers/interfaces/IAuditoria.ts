
export interface LogData {
  MODIFICACION: string;
  FECHA: string;
  ROLES: string;
  ACCIONES?: string;
  NOMBRERESPONSABLE?: string;
  DOCUMENTORESPONSABLE?: string;
  DIRECCIONACCION?: string;
  APISCONSUMEN?: string;
  PETICIONREALIZADA?: string;
  EVENTOBD?: string;
  TIPOERROR?: string;
  MENSAJEERROR?: string;
}

export interface InfoRootDetail {
  appName: string;
  clienteId?: string;
}