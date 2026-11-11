const { ventas } = require('./datos');
const {
  valorVenta,
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  ventasPorCiudad,
} = require('./analitica');

const casos = [
  { nombre: 'Completo (12)', datos: ventas },
  { nombre: 'Un elemento', datos: [ventas[0]] },
  { nombre: 'Vacío', datos: [] },
];

function describirVenta(venta) {
  return venta === null ? 'null' : `id ${venta.id} (${valorVenta(venta)})`;
}

console.log('=== Resultados por entrada ===');
const filas = [];
for (const caso of casos) {
  filas.push({
    entrada: caso.nombre,
    totalVendido: totalVendido(caso.datos),
    unidadesVendidas: unidadesVendidas(caso.datos),
    ventaMayor: describirVenta(ventaMayor(caso.datos)),
    ticketPromedio: Number(ticketPromedio(caso.datos).toFixed(2)),
    'ventasPorCiudad(Medellín)': ventasPorCiudad(caso.datos, 'Medellín'),
  });
}
console.table(filas);

const comprobaciones = [
  ['valorVenta(ventas[0]) = 84000', valorVenta(ventas[0]) === 84000],
  ['valorVenta(venta con cantidad 0) = 0', valorVenta(ventas[7]) === 0],
  ['valorVenta(undefined) = 0', valorVenta(undefined) === 0],
  ['totalVendido(ventas) = 985000', totalVendido(ventas) === 985000],
  ['unidadesVendidas(ventas) = 21', unidadesVendidas(ventas) === 21],
  ['ventaMayor(ventas) es el id 10', ventaMayor(ventas).id === 10],
  ['ticketPromedio(ventas) = 985000 / 11', ticketPromedio(ventas) === 985000 / 11],
  [
    'ventasPorCiudad(ventas, "Medellín") = 356000 (incluye "medellín")',
    ventasPorCiudad(ventas, 'Medellín') === 356000,
  ],
  [
    'ventasPorCiudad ignora mayúsculas y espacios ("  MEDELLÍN ")',
    ventasPorCiudad(ventas, '  MEDELLÍN ') === 356000,
  ],
  ['ventasPorCiudad de una ciudad sin ventas = 0', ventasPorCiudad(ventas, 'Cartagena') === 0],
  ['totalVendido([]) = 0', totalVendido([]) === 0],
  ['unidadesVendidas([]) = 0', unidadesVendidas([]) === 0],
  ['ventaMayor([]) = null', ventaMayor([]) === null],
  ['ticketPromedio([]) = 0 (no NaN)', ticketPromedio([]) === 0],
  ['ventasPorCiudad([], "Medellín") = 0', ventasPorCiudad([], 'Medellín') === 0],
  ['ventaMayor sin ventas válidas = null', ventaMayor([ventas[7]]) === null],
  ['ticketPromedio sin ventas válidas = 0', ticketPromedio([ventas[7]]) === 0],
];

console.log('\n=== Pruebas ===');
let fallas = 0;
for (const [descripcion, cumple] of comprobaciones) {
  console.log(`${cumple ? 'OK   ' : 'FALLA'}  ${descripcion}`);
  if (!cumple) fallas++;
}
console.log(
  `\n${comprobaciones.length - fallas}/${comprobaciones.length} comprobaciones correctas.`
);
if (fallas > 0) process.exitCode = 1;
