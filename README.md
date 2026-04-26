# FrontEnd SIRE SUNAT

Interfaz web separada del backend para operar la API SIRE:

- Ver estado de la API (`health`)
- Generar token SUNAT
- Ejecutar descarga masiva de compras o ventas
- Consultar operaciones por `operation_id`
- Descargar ZIP generado

## Requisitos

- Node.js 20+

## Configuracion

1. Copia `.env.example` a `.env`
2. Ajusta `VITE_API_BASE_URL` a la URL del backend desplegado

Ejemplo:

```
VITE_API_BASE_URL=https://api.tuempresa.com/api/v1
```

## Ejecutar en local

```bash
npm install
npm run dev
```

App disponible en `http://localhost:5173`.

## Build para despliegue

```bash
npm run build
npm run preview
```

Publica la carpeta `dist/` en cualquier hosting estatico (Vercel, Netlify, S3+CloudFront, Nginx, etc.).
