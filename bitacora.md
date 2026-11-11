# Bitácora · Café Origen Analítica

Registro de análisis, decisiones y pruebas del proyecto. Cada sección corresponde a un MiniReto.

---

## MiniReto 1 · Primer tueste: el repositorio y los datos

### Qué representa cada registro

Cada objeto del arreglo `ventas` es una **línea de venta**: un cliente compró, en una fecha y una ciudad, cierta cantidad de un producto a un precio unitario. Un mismo cliente puede tener varias líneas (varias compras en días distintos).

Lo observado en la muestra: 12 registros, fechas del 2026-09-01 al 2026-09-06 (dos registros por día), 8 clientes distintos, 5 productos y 4 ciudades reales.

### Diccionario de datos

| Propiedad | Tipo | Significado | Ejemplo |
|---|---|---|---|
| `id` | number (entero) | Identificador único del registro. Va del 1 al 12, sin saltos ni repetidos. | `1` |
| `fecha` | string (`AAAA-MM-DD`) | Día de la venta. Es texto, no un objeto `Date`; el formato ISO permite compararlas y ordenarlas como texto. | `"2026-09-01"` |
| `cliente` | string | Código anónimo del cliente (C01 a C08). Se repite entre registros. | `"C01"` |
| `producto` | string | Nombre comercial del producto vendido. | `"Origen Huila 500 g"` |
| `ciudad` | string | Ciudad donde se registró la venta. Es texto libre, sin estandarizar. | `"Medellín"` |
| `cantidad` | number (entero) | Unidades vendidas en esa línea. | `2` |
| `precio` | number (entero, COP) | Precio **unitario** en pesos colombianos, sin decimales. | `42000` |

Campo derivado (no viene en los datos): **valor de la venta = cantidad × precio**. No existe un campo de total; hay que calcularlo. Con la muestra completa, la suma de esos valores es 985.000.

### Posición frente a índice

El reto pide el producto del registro "en la posición 4". La **posición** es conteo humano (1.º, 2.º, 3.º, 4.º) y el **índice** de un arreglo en JavaScript empieza en 0. Por eso:

| Posición (humano) | Índice (JS) | Registro | Producto |
|---|---|---|---|
| 1 | `ventas[0]` | id 1 | Origen Huila 500 g |
| 4 | `ventas[3]` | id 4 | **Origen Huila 500 g** |
| 5 | `ventas[4]` | id 5 | Origen Sierra 500 g |
| 12 (última) | `ventas[ventas.length - 1]` = `ventas[11]` | id 12 | Origen Nariño 250 g |

Regla: `índice = posición − 1`. Confundirlos es un error típico "por uno" (off-by-one): `ventas[4]` devuelve el quinto registro, no el cuarto, y `ventas[ventas.length]` devuelve `undefined`.

### Casos borde detectados

| # | Problema | Dónde | Riesgo | Decisión |
|---|---|---|---|---|
| 1 | Ciudad escrita de forma inconsistente | id 5: `"medellín"` (minúscula) frente a `"Medellín"` | Al agrupar aparecerían dos Medellín y una búsqueda por `"Medellín"` omitiría 135.000. | No se corrige en `datos.js`. Se normaliza al comparar y agrupar (quitar espacios sobrantes, minúsculas, sin tildes en la clave) y se muestra con la regla de negocio: primera letra en mayúscula y el resto en minúscula. |
| 2 | Cantidad en cero | id 8: C06, Cali, Origen Huila 500 g, `cantidad: 0`, `precio: 42000` | Si se cuenta como venta, infla el número de ventas y baja el ticket promedio. Puede ser una venta anulada o un error de captura. | Se conserva el registro. Aporta 0 al total y a las unidades, pero **no** es una venta válida: se excluye del ticket promedio y de la venta mayor. El reporte lo muestra como "registro sin unidades". |
| 3 | Clientes repetidos | C01 en ids 1, 4 y 11; C02 en ids 2 y 7; C03 en ids 3 y 9 | 12 registros no son 12 clientes (son 8). Confundir "ventas" con "clientes" daría un gasto por cliente incorrecto. | El ticket promedio se calcula por compra (registro válido), no por cliente. Si se pide gasto por cliente, se agrupa por `cliente`. |
| 4 | No hay total por registro | Todos | Sumar `precio` directamente ignora la cantidad (daría 646.000 y no 985.000). | Un único cálculo: `valorVenta(venta) = cantidad × precio`, usado por todas las funciones. |
| 5 | La fecha es texto | Todos | Comparar con formatos distintos (`"4/9/2026"`) no encontraría nada; restar fechas como texto no funciona. | Se compara el texto exacto (sin espacios sobrantes) y se valida el formato `AAAA-MM-DD` al consultar un día. |
| 6 | Espacios sobrantes en textos | No aparece en la muestra, pero es común al exportar | `"Bogotá"` y `"Bogotá "` serían ciudades distintas. | `trim()` y colapsar espacios internos antes de comparar. (El error reportado en el MiniReto 4 confirma este riesgo.) |

---

## MiniReto 2 · Los números del día: recorrer, filtrar y acumular

### Plan en pseudocódigo

Función auxiliar de normalización usada en las comparaciones:

```
normalizar(texto)
  quitar espacios al inicio y al final; dejar un solo espacio entre palabras
  pasar a minúsculas; quitar tildes
```

```
valorVenta(venta)
  RETORNAR venta.cantidad × venta.precio      (si falta un número, usar 0)

totalVendido(ventas)                           patrón ACUMULADOR
  total ← 0
  PARA CADA venta EN ventas
    total ← total + valorVenta(venta)
  RETORNAR total

unidadesVendidas(ventas)                       patrón ACUMULADOR
  unidades ← 0
  PARA CADA venta EN ventas
    unidades ← unidades + venta.cantidad
  RETORNAR unidades

ventaMayor(ventas)                             patrón MÁXIMO
  mayor ← null                                 (todavía no hay candidata)
  PARA CADA venta EN ventas
    SI venta.cantidad <= 0 → pasar a la siguiente
    SI mayor es null O valorVenta(venta) > valorVenta(mayor)
      mayor ← venta                            (se guarda el registro completo)
  RETORNAR mayor

ticketPromedio(ventas)                         ACUMULADOR + CONTADOR
  total ← 0 ; validas ← 0
  PARA CADA venta EN ventas
    SI venta.cantidad > 0
      total ← total + valorVenta(venta)
      validas ← validas + 1
  SI validas = 0 → RETORNAR 0                  (evita 0 / 0 = NaN)
  RETORNAR total / validas

ventasPorCiudad(ventas, ciudad)                ACUMULADOR con condición
  buscada ← normalizar(ciudad)
  SI buscada está vacía → RETORNAR 0
  total ← 0
  PARA CADA venta EN ventas
    SI normalizar(venta.ciudad) = buscada
      total ← total + valorVenta(venta)
  RETORNAR total
```

| Función | Qué recorre | Condición | Qué acumula | Valor inicial |
|---|---|---|---|---|
| `totalVendido` | todas las ventas | ninguna | valor de cada venta | `0` |
| `unidadesVendidas` | todas las ventas | ninguna | cantidad de cada venta | `0` |
| `ventaMayor` | todas las ventas | cantidad > 0 y valor mayor que el actual | el registro de mayor valor | `null` |
| `ticketPromedio` | todas las ventas | cantidad > 0 | valor total y número de ventas válidas | `0` y `0` |
| `ventasPorCiudad` | todas las ventas | ciudad normalizada = ciudad buscada | valor de cada venta que cumple | `0` |

### Comportamiento con el arreglo vacío (decisión documentada)

| Función | Con `[]` devuelve | Por qué |
|---|---|---|
| `totalVendido` | `0` | No se vendió nada. |
| `unidadesVendidas` | `0` | No salió ninguna unidad. |
| `ventaMayor` | `null` | No hay ningún registro que devolver; inventar uno sería falso. Quien la use debe revisar si es `null`. También devuelve `null` si todas las ventas tienen cantidad 0. |
| `ticketPromedio` | `0` | Dividir entre 0 ventas da `NaN`. Se decide que `0` significa "sin ventas válidas". |
| `ventasPorCiudad` | `0` | No hay ventas en ninguna ciudad. Una ciudad vacía también devuelve `0`. |
| `valorVenta(undefined)` | `0` | Un registro ausente no aporta valor. |

En empate de la venta mayor gana la primera encontrada (se usa `>` y no `>=`).

### Pruebas con tres entradas

Se ejecutan con `node src/pruebas.js` (incluye 17 comprobaciones automáticas). Como arreglo de un elemento se usa `[ventas[0]]`.

| Función | Completo (12) | Un elemento | Vacío |
|---|---|---|---|
| `totalVendido` | 985.000 | 84.000 | 0 |
| `unidadesVendidas` | 21 | 2 | 0 |
| `ventaMayor` | id 10 (168.000) | id 1 (84.000) | `null` |
| `ticketPromedio` | 89.545,45 | 84.000 | 0 |
| `ventasPorCiudad(…, "Medellín")` | 356.000 | 84.000 | 0 |

### Traza manual 1 · `totalVendido(ventas)`

| Iteración | id | cantidad × precio | valorVenta | total acumulado |
|---|---|---|---|---|
| inicio | | | | 0 |
| 1 | 1 | 2 × 42.000 | 84.000 | 84.000 |
| 2 | 2 | 1 × 26.000 | 26.000 | 110.000 |
| 3 | 3 | 1 × 95.000 | 95.000 | 205.000 |
| 4 | 4 | 1 × 42.000 | 42.000 | 247.000 |
| 5 | 5 | 3 × 45.000 | 135.000 | 382.000 |
| 6 | 6 | 2 × 26.000 | 52.000 | 434.000 |
| 7 | 7 | 1 × 120.000 | 120.000 | 554.000 |
| 8 | 8 | 0 × 42.000 | 0 | 554.000 |
| 9 | 9 | 2 × 45.000 | 90.000 | 644.000 |
| 10 | 10 | 4 × 42.000 | 168.000 | 812.000 |
| 11 | 11 | 1 × 95.000 | 95.000 | 907.000 |
| 12 | 12 | 3 × 26.000 | 78.000 | **985.000** |

Resultado del programa: `985000`. **Coincide.**

### Traza manual 2 · `ventasPorCiudad(ventas, "Medellín")`

`buscada = normalizar("Medellín") = "medellin"`

| id | ciudad original | normalizada | ¿coincide? | valorVenta | total |
|---|---|---|---|---|---|
| inicio | | | | | 0 |
| 1 | Medellín | medellin | sí | 84.000 | 84.000 |
| 2 | Bogotá | bogota | no | | 84.000 |
| 3 | Cali | cali | no | | 84.000 |
| 4 | Medellín | medellin | sí | 42.000 | 126.000 |
| 5 | **medellín** | medellin | **sí** | 135.000 | 261.000 |
| 6 | Bogotá | bogota | no | | 261.000 |
| 7 | Bogotá | bogota | no | | 261.000 |
| 8 | Cali | cali | no | | 261.000 |
| 9 | Cali | cali | no | | 261.000 |
| 10 | Pereira | pereira | no | | 261.000 |
| 11 | Medellín | medellin | sí | 95.000 | 356.000 |
| 12 | Bogotá | bogota | no | | **356.000** |

Resultado del programa: `356000`. **Coincide**, y confirma que la venta escrita como "medellín" se incluye.

### Traza manual 3 · `ventaMayor(ventas)`

| id | valor | ¿válida? | ¿mayor que el actual? | mayor después |
|---|---|---|---|---|
| inicio | | | | `null` |
| 1 | 84.000 | sí | sí (no había) | id 1 |
| 2 | 26.000 | sí | no | id 1 |
| 3 | 95.000 | sí | sí | id 3 |
| 4 | 42.000 | sí | no | id 3 |
| 5 | 135.000 | sí | sí | id 5 |
| 6 | 52.000 | sí | no | id 5 |
| 7 | 120.000 | sí | no | id 5 |
| 8 | 0 | **no** (cantidad 0) | se salta | id 5 |
| 9 | 90.000 | sí | no | id 5 |
| 10 | 168.000 | sí | sí | id 10 |
| 11 | 95.000 | sí | no | id 10 |
| 12 | 78.000 | sí | no | **id 10** |

Resultado del programa: registro con `id 10` (Origen Huila 500 g, Pereira, 4 × 42.000 = 168.000). **Coincide.**

Ticket promedio a mano: 985.000 ÷ 11 ventas válidas = 89.545,45. Resultado del programa: `89545.45454545454`. **Coincide.**

---

## MiniReto 3 · Del ciclo al método: rankings y agrupaciones

### Equivalencia ciclo ↔ método

`node src/verificar.js` compara cada par con tres conjuntos de datos (completo, un elemento y vacío) y siete búsquedas de ciudad (`"Medellín"`, `"  medellín "`, `"BOGOTÁ"`, `"Cali"`, `"Pereira"`, `"Cartagena"` y `""`). Resultado: **27/27 pares en OK** y 8/8 criterios adicionales en OK.

Por qué dan exactamente lo mismo:

- Las dos versiones usan las mismas funciones auxiliares (`valorVenta`, `cantidadDe`, `claveTexto`), así que no hay dos fórmulas distintas que puedan divergir.
- Todo `reduce` recibe valor inicial `0`. Sin valor inicial, `reduce` sobre `[]` lanza `TypeError` y sobre un arreglo de objetos sumaría objetos en lugar de números.
- Las dos versiones de `ventasPorCiudad` devuelven `0` ante una ciudad vacía antes de recorrer.

### Las cinco preguntas por función

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `totalVendidoM` | `ventas` | nada | cada venta en su valor | suma de valores (`reduce`, inicio 0) | no agrupa |
| `unidadesVendidasM` | `ventas` | nada | cada venta en su cantidad | suma de unidades (`reduce`, inicio 0) | no agrupa |
| `ventasPorCiudadM` | `ventas` | ciudad normalizada = buscada (`filter`) | cada venta en su valor (`map`) | suma de valores (`reduce`, inicio 0) | no agrupa: es una sola ciudad |
| `totalPorCiudad` | `ventas` | nada (ciudad vacía va a "Sin ciudad") | ciudad en clave normalizada y nombre formateado; venta en valor | total por ciudad | objeto diccionario con clave = ciudad normalizada |
| `unidadesPorProducto` | `ventas` | nada | producto en clave normalizada; venta en cantidad | unidades por producto | objeto diccionario con clave = producto normalizado |
| `topProductosPorValor` | `ventas` y luego las entradas del diccionario (`Object.entries`) | nada; `slice(0, k)` se queda con los k primeros | cada grupo en `{ producto, unidades, valor }` | valor por producto | por producto; después ordena de mayor a menor (`sort` con función de comparación) |
| `ventasOrdenadasPorValor` | una copia `[...ventas]` | nada | nada | nada | no agrupa: solo ordena la copia |

### Regla de negocio para los nombres de ciudad

1. **Clave interna** (para comparar y agrupar): `normalize('NFC')`, `trim()`, colapsar espacios internos, `toLowerCase()` y quitar tildes. `"Medellín"`, `"medellín"`, `" MEDELLÍN "` y `"Medellin"` producen `"medellin"`.
2. **Nombre visible**: primera letra en mayúscula y el resto en minúscula, conservando tildes y ñ. `"medellín"` → `"Medellín"`, `"BOGOTÁ"` → `"Bogotá"`, `"ábrego"` → `"Ábrego"` (`toUpperCase` también convierte letras con tilde).
3. **Ciudades de varias palabras**: la regla se aplica a cada palabra, porque son nombres propios (`"santa   marta"` → `"Santa Marta"`). Los conectores `de, del, la, las, los, y, e` quedan en minúscula si no son la primera palabra (`"cartagena DE indias"` → `"Cartagena de Indias"`).
4. **Con y sin tilde**: si la misma ciudad llega como `"Medellin"` y `"Medellín"`, se agrupa una sola vez y se muestra la variante con tilde, sin importar cuál apareció primero.
5. **Unicode**: una "í" puede venir como un solo carácter o como "i" + tilde combinante (dos códigos). Se ven iguales pero `===` las considera distintas. `normalize('NFC')` las unifica antes de comparar.
6. **Vacía o no texto**: se agrupa como `"Sin ciudad"` para no perder dinero en el total.
7. **Limitación conocida**: al quitar las marcas en la clave, la ñ se iguala a la n (`"Peñol"` y `"Penol"` serían la misma clave). Se acepta para ciudades colombianas, donde no hay pares reales que se confundan.

### Ordenar sin modificar el original

`sort` modifica el arreglo sobre el que se llama. Por eso:

- `topProductosPorValor` ordena un arreglo **nuevo** creado con `Object.entries(...)` y `map`, nunca `ventas`.
- `ventasOrdenadasPorValor` copia con el operador de propagación (`[...ventas]`) antes de ordenar.
- `verificar.js` guarda los `id` antes de llamar las funciones y comprueba que el orden sea el mismo después.

### Resultados con la muestra

| Ciudad | Total |
|---|---|
| Medellín | 356.000 |
| Bogotá | 276.000 |
| Cali | 185.000 |
| Pereira | 168.000 |
| **Suma** | **985.000** (igual a `totalVendido`) |

| Puesto | Producto | Unidades | Valor |
|---|---|---|---|
| 1 | Origen Huila 500 g | 7 | 294.000 |
| 2 | Origen Sierra 500 g | 5 | 225.000 |
| 3 | Prensa francesa | 2 | 190.000 |

Unidades por producto: Origen Huila 500 g 7, Origen Nariño 250 g 6, Origen Sierra 500 g 5, Prensa francesa 2, Molino manual 1 (suma 21, igual a `unidadesVendidas`).

---

## MiniReto 4 · Analítica v0.1: el primer reporte

El reporte se genera con `node src/reporte.js`. La gerente puede pasar las fechas que quiera consultar: `node src/reporte.js 2026-09-05`. Los dos errores se reproducen y se prueban con `node src/reproducir-errores.js`.

### Error 1 · "Bogotá apareció dos veces"

- **Síntoma**: en el total por ciudad, Bogotá aparece en dos filas, cada una con una parte del monto.
- **Entrada que lo produce**: registros de la misma ciudad escritos de forma distinta. Se reprodujo con una copia de la muestra en la que la venta 12 llega como `"Bogotá "` (espacio al final), algo típico al exportar desde una hoja de cálculo. Con la muestra original ocurre lo mismo con `"Medellín"` y `"medellín"`.
- **Hipótesis**: el prototipo usa `venta.ciudad` tal cual como clave del objeto. Para JavaScript, `"Bogotá"` y `"Bogotá "` son claves distintas.
- **Prueba realizada**: se ejecutó la versión defectuosa (`totalPorCiudadDefectuoso`) y se imprimieron las claves con `console.log(JSON.stringify(clave))`, que deja ver el espacio que en pantalla es invisible:

  | Clave | Total |
  |---|---|
  | `"Medellín"` | 221.000 |
  | `"Bogotá"` | 198.000 |
  | `"Cali"` | 185.000 |
  | `"medellín"` | 135.000 |
  | `"Pereira"` | 168.000 |
  | `"Bogotá "` | 78.000 |

  Seis grupos para cuatro ciudades. La hipótesis se confirma.
- **Causa**: la clave de agrupación no se normaliza.
- **Corrección**: `totalPorCiudad` agrupa por `claveTexto(ciudad)` (sin espacios sobrantes, minúsculas, sin tildes) y muestra el nombre con `formatearNombreLugar`. Con la misma entrada, la v0.1 devuelve 4 ciudades y Bogotá suma 276.000 (198.000 + 78.000). Hay una prueba automática que lo comprueba.

### Error 2 · El ticket promedio daba `NaN` al filtrar un día sin ventas

- **Síntoma**: al consultar un día sin ventas, el reporte mostraba `NaN` en el ticket promedio.
- **Entrada que lo produce**: filtrar el 2026-09-07, que no tiene registros, y calcular el ticket sobre ese resultado (`[]`).
- **Hipótesis**: el prototipo calcula `total / ventas.length`; con un arreglo vacío eso es `0 / 0`, que en JavaScript es `NaN`.
- **Prueba realizada**: con `console.log` antes de dividir se vio `total = 0` y `length = 0`; la versión defectuosa devolvió `NaN` (`Number.isNaN(...) === true`).
- **Causa**: la división no valida el divisor. Además, divide entre todos los registros y no entre las ventas válidas.
- **Corrección**: `ticketPromedio` cuenta solo ventas con cantidad mayor que 0 y devuelve `0` si no hay ninguna. `ventasDelDia(ventas, fecha)` reutiliza esa función y devuelve todos los indicadores en 0, `ventaMayor: null` y `hayVentas: false`. El reporte muestra el mensaje "No se registraron ventas este día." junto con los valores en cero.
- **Hallazgo adicional**: el mismo defecto daba un valor **incorrecto pero no visible** el 2026-09-04: 120.000 ÷ 2 registros = 60.000, porque contaba la venta con cantidad 0. El valor correcto es 120.000 ÷ 1 venta válida = 120.000. Es el tipo de error que no salta a la vista y solo aparece al revisar los datos.

### Verificación final

| Comando | Resultado |
|---|---|
| `node src/explorar.js` | 12 registros, primero, último, producto de la posición 4 y tabla completa. |
| `node src/pruebas.js` | 17/17 comprobaciones correctas. |
| `node src/verificar.js` | 35/35 verificaciones en OK. |
| `node src/reporte.js` | Cinco secciones, sin `NaN`, sin `undefined` y sin ciudades duplicadas (el propio reporte lo verifica al final). |
| `node src/reproducir-errores.js` | Los dos errores se reproducen con la versión defectuosa y quedan corregidos en la v0.1. |

El reporte también se probó con un arreglo vacío (todas las secciones muestran "No hay ventas registradas" o valores en cero) y con una fecha inválida (`2026-13-01`), que muestra un mensaje que indica el formato correcto.
