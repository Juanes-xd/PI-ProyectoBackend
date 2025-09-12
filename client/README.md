# Task Management Frontend

Frontend multi-página para el sistema de gestión de tareas.

## Estructura del Proyecto

```
client/
├── pages/                 # Páginas HTML
│   ├── auth.html         # Página de autenticación
│   ├── dashboard.html    # Dashboard principal
│   └── create-task.html  # Crear nueva tarea
├── src/
│   ├── js/
│   │   ├── services/     # Servicios de comunicación
│   │   │   └── api.js    # Cliente API
│   │   ├── utils/        # Utilidades compartidas
│   │   │   └── utils.js  # Funciones auxiliares
│   │   ├── auth.js       # Lógica de autenticación
│   │   ├── dashboard.js  # Lógica del dashboard
│   │   └── create-task.js # Lógica de creación de tareas
│   └── style.css         # Estilos globales
└── index.html           # Página de inicio (redirección)
```

## Páginas

### 1. Autenticación (`auth.html`)
- Login y registro de usuarios
- Validación de formularios
- Manejo de errores
- Redirección automática después del login

### 2. Dashboard (`dashboard.html`)
- Lista de tareas del usuario
- Filtros por estado (todas, pendientes, completadas)
- Acciones CRUD en tareas
- Navegación a crear tarea

### 3. Crear Tarea (`create-task.html`)
- Formulario de nueva tarea
- Validación en tiempo real
- Contador de caracteres
- Modal de confirmación

## Servicios JavaScript

### API Service (`api.js`)
Maneja toda la comunicación con el backend:
- Autenticación (login/registro)
- CRUD de tareas
- Manejo de cookies
- Control de errores

### Utils (`utils.js`)
Funciones auxiliares:
- Validación de formularios
- Formateo de fechas
- Manejo de modales
- Utilitarias comunes

## Características

- **Multi-página**: Cada funcionalidad tiene su propia página HTML
- **Modular**: JavaScript organizados por funcionalidad
- **Responsive**: Diseño adaptable a dispositivos móviles
- **Autenticación**: Sistema basado en cookies JWT
- **Validación**: Validación de formularios en tiempo real
- **UX**: Modales, contadores de caracteres y feedback visual

## Instalación y Uso

1. Asegurar que el backend esté ejecutándose en el puerto 3000
2. Abrir `index.html` en un navegador web
3. El sistema redirigirá automáticamente a la página de autenticación

## Tecnologías

- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript ES6+ (Modules, Async/Await, Fetch API)
- Diseño responsive sin frameworks

## Funcionalidades

- ✅ Sistema de autenticación completo
- ✅ Dashboard con filtros de tareas
- ✅ Crear, editar y eliminar tareas
- ✅ Marcar tareas como completadas
- ✅ Validación de formularios
- ✅ Manejo de errores
- ✅ Navegación entre páginas
- ✅ Diseño responsive