const { ventas } = require('./datos');
const { claveTexto, totalPorCiudad, ticketPromedio, ventasDelDia } = require('./analitica');
const { generarReporte, revisarReporte } = require('./reporte');

function totalPorCiudadDefectuoso(datos) {
  const totales = {};
  for (const venta of datos) {
    const ciudad = venta.ciudad;
    if (!totales[ciudad]) totales[ciudad] = 0;
    totales[ciudad] += venta.cantidad * venta.precio;
  }
  return totales;
}

function ticketPromedioDefectuoso(datos) {
  let total = 0;
  for (const venta of datos) total += venta.cantidad * venta.precio;
  return total / datos.length;
}

let fallas = 0;
function comprobar(descripcion, cumple) {
  console.log(`  ${cumple ? 'OK   ' : 'FALLA'}  ${descripcion}`);
  if (!cumple) fallas++;
}

const contarBogota = (objeto) =>
  Object.keys(objeto).filter((ciudad) => claveTexto(ciudad) === 'bogota').length;

const ventasConEspacio = ventas.map((venta) =>
  venta.id === 12 ? { ...venta, ciudad: 'Bogotá ' } : venta
);

console.log('\n=== Error 1: ciudad duplicada en el total por ciudad ===');
const defectuoso1 = totalPorCiudadDefectuoso(ventasConEspacio);
console.log('\n  Versión defectuosa (claves con JSON.stringify para ver los espacios):');
for (const [ciudad, total] of Object.entries(defectuoso1)) {
  console.log(`    ${JSON.stringify(ciudad).padEnd(12)} ${total}`);
}
const corregido1 = totalPorCiudad(ventasConEspacio);
console.log('\n  Versión v0.1:');
for (const [ciudad, total] of Object.entries(corregido1)) {
  console.log(`    ${JSON.stringify(ciudad).padEnd(12)} ${total}`);
}
console.log('');
comprobar(
  'Reproducido: la versión defectuosa muestra Bogotá 2 veces',
  contarBogota(defectuoso1) === 2
);
comprobar(
  'Reproducido: con la muestra original también separa "Medellín" y "medellín"',
  Object.keys(totalPorCiudadDefectuoso(ventas)).length === 5
);
comprobar('Corregido: la v0.1 muestra Bogotá una sola vez', contarBogota(corregido1) === 1);
comprobar('Corregido: Bogotá suma 276.000 (198.000 + 78.000)', corregido1['Bogotá'] === 276000);
comprobar('Corregido: exactamente 4 ciudades', Object.keys(corregido1).length === 4);

console.log('\n=== Error 2: ticket promedio NaN en un día sin ventas ===\n');
const diaSinVentas = '2026-09-07';
const filtrado = ventas.filter((venta) => venta.fecha === diaSinVentas);
console.log(`  Ventas del ${diaSinVentas}: ${filtrado.length} registros`);
console.log(
  `  Defectuoso: total / length = 0 / ${filtrado.length} = ${ticketPromedioDefectuoso(filtrado)}`
);
console.log(`  v0.1: ticketPromedio = ${ventasDelDia(ventas, diaSinVentas).ticketPromedio}\n`);

comprobar(
  'Reproducido: la versión defectuosa devuelve NaN',
  Number.isNaN(ticketPromedioDefectuoso(filtrado))
);
comprobar(
  'Corregido: ventasDelDia devuelve ticket 0 en un día sin ventas',
  ventasDelDia(ventas, diaSinVentas).ticketPromedio === 0
);
comprobar('Corregido: ticketPromedio([]) = 0', ticketPromedio([]) === 0);

const dia4 = ventas.filter((venta) => venta.fecha === '2026-09-04');
console.log(
  `\n  Hallazgo adicional (2026-09-04): defectuoso = ${ticketPromedioDefectuoso(dia4)}, v0.1 = ${ticketPromedio(dia4)}\n`
);
comprobar(
  'Corregido: el ticket del 2026-09-04 es 120.000 y no 60.000',
  ticketPromedio(dia4) === 120000
);

console.log('\n=== Reporte completo ===\n');
const reporteOriginal = generarReporte(ventas, ['2026-09-04', diaSinVentas]);
const reporteConEspacio = generarReporte(ventasConEspacio, [diaSinVentas]);
const reporteVacio = generarReporte([], [diaSinVentas]);
comprobar(
  'Reporte con la muestra: sin NaN, undefined ni duplicados',
  revisarReporte(reporteOriginal, ventas).length === 0
);
comprobar(
  'Reporte con "Bogotá ": sin NaN, undefined ni duplicados',
  revisarReporte(reporteConEspacio, ventasConEspacio).length === 0
);
comprobar('Reporte sin datos: sin NaN ni undefined', revisarReporte(reporteVacio, []).length === 0);
comprobar(
  'El arreglo original no se modificó (venta 12 sigue en "Bogotá")',
  ventas[11].ciudad === 'Bogotá'
);

console.log(
  fallas === 0 ? '\nTodas las comprobaciones pasaron.\n' : `\n${fallas} comprobaciones fallaron.\n`
);
if (fallas > 0) process.exitCode = 1;
