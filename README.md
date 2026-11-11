# Café Origen · Analítica v0.1

Motor de analítica de ventas para **Café Origen**, una tienda de café de origen colombiano. Lee el historial de ventas y genera, por consola, un reporte de negocio que la gerente puede ejecutar sin abrir el código.

Está escrito en JavaScript (Node.js) con CommonJS y no tiene dependencias externas.

## Qué preguntas responde

- ¿Cuánto se vendió en total y cuántas unidades salieron?
- ¿Cuál fue la venta más grande?
- ¿Cuánto gasta en promedio un cliente por compra (ticket promedio)?
- ¿Cuánto se vendió en cada ciudad y qué porcentaje representa?
- ¿Cuántas unidades se vendieron de cada producto?
- ¿Cuáles son los 3 productos que más dinero generaron?
- ¿Cómo le fue a un día específico, incluso si ese día no hubo ventas?

## Requisitos

- Node.js versión LTS (probado con Node 22). No hace falta `npm install`.

## Cómo ejecutarlo

Desde la carpeta del proyecto:

```bash
# Reporte completo (incluye un día con ventas y uno sin ventas como ejemplo)
node src/reporte.js

# Reporte con el resumen de uno o varios días (formato AAAA-MM-DD)
node src/reporte.js 2026-09-05
node src/reporte.js 2026-09-01 2026-09-02
```

Otros scripts:

| Comando | Para qué sirve |
|---|---|
| `node src/explorar.js` | Exploración inicial de los datos (MiniReto 1). |
| `node src/pruebas.js` | Prueba las funciones con ciclos con tres entradas: completo, un elemento y vacío (MiniReto 2). |
| `node src/verificar.js` | Demuestra que cada versión con métodos da el mismo resultado que su ciclo: "OK" o "DIFERENTE" (MiniReto 3). |
| `node src/reproducir-errores.js` | Reproduce los dos errores reportados por la gerente y prueba que están corregidos (MiniReto 4). |

## Estructura

```
cafe-origen-analitica/
├── src/
│   ├── datos.js                Muestra de 12 ventas, tal como se exportó
│   ├── analitica.js            Funciones puras de cálculo
│   ├── explorar.js             Exploración de los datos
│   ├── pruebas.js              Pruebas de las funciones con ciclos
│   ├── verificar.js            Comparación ciclo vs. método
│   ├── reporte.js              Reporte de negocio por consola
│   └── reproducir-errores.js   Reproducción y corrección de errores
├── bitacora.md                 Análisis, decisiones, trazas y depuración
└── README.md
```

## Decisiones importantes sobre los datos

- Los datos de `datos.js` no se modifican; la limpieza se hace al calcular.
- El valor de una venta es `cantidad × precio` (el precio es unitario).
- Las ciudades se comparan sin importar mayúsculas, tildes ni espacios sobrantes, y se muestran con la primera letra en mayúscula (por ejemplo, "medellín" se suma a "Medellín").
- Una venta con cantidad 0 suma 0, pero no cuenta como venta válida para el ticket promedio ni para la venta más grande.
- Un día sin ventas muestra valores en cero y un mensaje claro, nunca `NaN`.

El detalle de cada decisión está en [`bitacora.md`](bitacora.md).

## Versiones

- **v0.1**: primer reporte de negocio; corrige la ciudad duplicada y el ticket promedio `NaN`.
