export {};

declare global {
  interface Window {
    mapeoNotify?: (message: any) => void;
    auditoriaNotify?: (message: any) => void;
  }
}