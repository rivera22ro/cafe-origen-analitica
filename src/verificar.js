const { ventas } = require('./datos');
const {
  totalVendido,
  totalVendidoM,
  unidadesVendidas,
  unidadesVendidasM,
  ventasPorCiudad,
  ventasPorCiudadM,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasOrdenadasPorValor,
} = require('./analitica');

const idsAntes = ventas.map((venta) => venta.id).join(',');

const conjuntos = [
  { nombre: 'completo', datos: ventas },
  { nombre: 'un elemento', datos: [ventas[4]] },
  { nombre: 'vacío', datos: [] },
];
const ciudades = ['Medellín', '  medellín ', 'BOGOTÁ', 'Cali', 'Pereira', 'Cartagena', ''];

const filas = [];
function comparar(indicador, entrada, ciclo, metodo) {
  filas.push({
    indicador,
    entrada,
    ciclo,
    metodo,
    resultado: Object.is(ciclo, metodo) ? 'OK' : 'DIFERENTE',
  });
}

for (const { nombre, datos } of conjuntos) {
  comparar('totalVendido', nombre, totalVendido(datos), totalVendidoM(datos));
  comparar('unidadesVendidas', nombre, unidadesVendidas(datos), unidadesVendidasM(datos));
  for (const ciudad of ciudades) {
    comparar(
      `ventasPorCiudad("${ciudad}")`,
      nombre,
      ventasPorCiudad(datos, ciudad),
      ventasPorCiudadM(datos, ciudad)
    );
  }
}

console.log('=== Ciclo vs. método ===');
console.table(filas);

const porCiudad = totalPorCiudad(ventas);
const porProducto = unidadesPorProducto(ventas);
const top3 = topProductosPorValor(ventas, 3);
ventasOrdenadasPorValor(ventas);

console.log('\n=== totalPorCiudad(ventas) ===');
console.table(porCiudad);
console.log('\n=== unidadesPorProducto(ventas) ===');
console.table(porProducto);
console.log('\n=== topProductosPorValor(ventas, 3) ===');
console.table(top3);

const sumar = (valores) => valores.reduce((total, valor) => total + valor, 0);
const nombresCiudad = Object.keys(porCiudad);
const extra = [
  ['totalPorCiudad tiene exactamente 4 ciudades', nombresCiudad.length === 4],
  [
    'Las ciudades son Medellín, Bogotá, Cali y Pereira',
    ['Medellín', 'Bogotá', 'Cali', 'Pereira'].every((c) => nombresCiudad.includes(c)),
  ],
  [
    'La suma por ciudad es igual al total vendido',
    sumar(Object.values(porCiudad)) === totalVendido(ventas),
  ],
  [
    'La suma por producto es igual a las unidades vendidas',
    sumar(Object.values(porProducto)) === unidadesVendidas(ventas),
  ],
  ['topProductosPorValor(ventas, 3) devuelve 3 productos', top3.length === 3],
  [
    'El top 3 está ordenado de mayor a menor',
    top3.every((p, i) => i === 0 || top3[i - 1].valor >= p.valor),
  ],
  ['topProductosPorValor con k inválido devuelve []', topProductosPorValor(ventas, 0).length === 0],
  [
    'El arreglo ventas conserva su orden original',
    ventas.map((venta) => venta.id).join(',') === idsAntes,
  ],
];

console.log('\n=== Criterios ===');
let diferencias = filas.filter((fila) => fila.resultado !== 'OK').length;
for (const [descripcion, cumple] of extra) {
  console.log(`${cumple ? 'OK       ' : 'DIFERENTE'}  ${descripcion}`);
  if (!cumple) diferencias++;
}

const totalChequeos = filas.length + extra.length;
console.log(`\n${totalChequeos - diferencias}/${totalChequeos} verificaciones en OK.`);
if (diferencias > 0) process.exitCode = 1;
