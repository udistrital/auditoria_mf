import { DriveStep } from "driver.js";

export const tutorialHome: DriveStep[] = [
    {
        element: '#driver-title',
        popover: {
            title: 'Módulo de Auditoría',
            description: 'Bienvenido al módulo de auditoría del sistema. Aquí podrás consultar todos los registros de actividad.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#driver-subtitle',
        popover: {
            title: 'Búsqueda de Logs',
            description: 'En esta sección puedes filtrar los registros de auditoría según diferentes criterios.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#driver-fecha-label',
        popover: {
            title: 'Rango de Fechas',
            description: 'Selecciona el rango de fechas para filtrar los registros. Puedes especificar fecha y hora exactas.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-fecha-desde-input',
        popover: {
            title: 'Fecha de inicio',
            description: 'Selecciona la fecha y hora desde la cual deseas iniciar la búsqueda de logs. Asegúrate de que esté dentro del rango disponible del sistema',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-fecha-hasta-input',
        popover: {
            title: 'Fecha final',
            description: 'Elige la fecha y hora hasta la cual deseas buscar los registros. Esta fecha debe ser posterior a la fecha de inicio.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-tipo-log-label',
        popover: {
            title: 'Tipo de Operación',
            description: 'Filtra por tipo de operación HTTP (GET, POST, PUT, DELETE) para encontrar registros específicos.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-api-label',
        popover: {
            title: 'API Específica',
            description: 'Selecciona el nombre del servicio o API sobre el que deseas ver los registros.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-codigo-label',
        popover: {
            title: 'Código de Responsable',
            description: 'Opcionalmente, puedes filtrar por el código del usuario que realizó la acción.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '#driver-palabra-clave-input',
        popover: {
            title: 'Palabra Clave',
            description: 'Opcionalmente, puedes filtrar una palabra clave para la búsqueda del log.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '#driver-buscar-btn',
        popover: {
            title: 'Busqueda Estandar',
            description: `Haz clic aquí para ejecutar la búsqueda con los filtros seleccionados. 
            Esta búsqueda tarda más debido a que implica la consulta de registros y el prosesamiento de la información
            previa al envío de resultados al cliente (página web).
            `,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#driver-buscar-btn-flexible',
        popover: {
            title: 'Busqueda Flexible',
            description: `Haz clic aquí para ejecutar la búsqueda con los filtros seleccionados. 
            Esta búsqueda implica menor tiempo (dependiendo también de los recursos de los que disponga el equipo)
            debido a que una vez obtenido los resultados, estos se envían en crudo para el procesamiendo de los registros
            directamente desde el cliente (página web).
            `,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#driver-tabla',
        popover: {
            title: 'Resultados de Búsqueda',
            description: 'Aquí se mostrarán los registros que coincidan con tus criterios de búsqueda.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#driver-col-tipo',
        popover: {
            title: 'Tipo de Operación',
            description: 'Muestra el método HTTP utilizado en la operación registrada.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#driver-col-fecha',
        popover: {
            title: 'Fecha y Hora',
            description: 'Indica cuándo se realizó la operación registrada.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#driver-col-rol',
        popover: {
            title: 'Rol del Usuario',
            description: 'Muestra el rol del usuario que realizó la operación.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#driver-btn-detalle',
        popover: {
            title: 'Ver Detalles',
            description: 'Haz clic en el ícono de ojo para ver todos los detalles del registro seleccionado.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#driver-paginador',
        popover: {
            title: 'Navegación',
            description: 'Usa estos controles para navegar entre páginas de resultados.',
            side: 'top',
            align: 'center'
        }
    }
]

export const tutorialDetalle: DriveStep[] = [
    {
        element: '#driver-detail-title',
        popover: {
            title: 'Detalle del Registro de Auditoría',
            description: 'Esta ventana muestra todos los detalles del registro de auditoría seleccionado.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#driver-close-btn',
        popover: {
            title: 'Cerrar Ventana',
            description: 'Haz clic aquí para cerrar esta ventana y volver a la lista de registros.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '#driver-details-section',
        popover: {
            title: 'Información Básica',
            description: 'Esta sección contiene los datos principales del registro de auditoría.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#driver-name-field',
        popover: {
            title: 'Nombre del Responsable',
            description: 'Muestra el nombre del usuario que realizó la acción registrada.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-doc-field',
        popover: {
            title: 'Documento de Identidad',
            description: 'Documento de identificación del usuario responsable.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-ip-field',
        popover: {
            title: 'Dirección IP',
            description: 'Dirección IP desde donde se originó la acción.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-type-field',
        popover: {
            title: 'Tipo de Operación',
            description: 'Método HTTP utilizado (GET, POST, PUT, DELETE).',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '#driver-date-field',
        popover: {
            title: 'Fecha y Hora',
            description: 'Marca de tiempo exacta cuando ocurrió el evento.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '#driver-email-field',
        popover: {
            title: 'Correo Electrónico',
            description: 'Dirección de correo asociada al usuario responsable.',
            side: 'left',
            align: 'start'
        }
    },
    {
        element: '#driver-transaction-section',
        popover: {
            title: 'Detalles de Transacción',
            description: 'Información técnica detallada sobre la operación realizada.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#driver-apis-textarea',
        popover: {
            title: 'APIs Consumidas',
            description: 'Lista de APIs que participaron en esta operación.',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '#driver-request-textarea',
        popover: {
            title: 'Petición Completa',
            description: 'Detalles completos de la solicitud HTTP realizada.',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '#driver-db-textarea',
        popover: {
            title: 'Operación en Base de Datos',
            description: 'Consulta SQL o acción ejecutada en la base de datos.',
            side: 'top',
            align: 'start'
        }
    },
    {
        element: '#driver-error-section',
        popover: {
            title: 'Información de Errores',
            description: 'Detalles de cualquier error que haya ocurrido durante la operación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#driver-error-type-input',
        popover: {
            title: 'Tipo de Error',
            description: 'Clasificación del error ocurrido (si aplica).',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#driver-error-message-textarea',
        popover: {
            title: 'Mensaje de Error',
            description: 'Descripción detallada del error ocurrido.',
            side: 'top',
            align: 'start'
        }
    }
]