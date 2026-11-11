const { ventas } = require('./datos');
const {
  claveTexto,
  valorVenta,
  contarVentasValidas,
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasDelDia,
} = require('./analitica');

const ANCHO = 64;
const FECHAS_POR_DEFECTO = ['2026-09-04', '2026-09-07'];

function pesos(valor) {
  return Number(valor).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function numero(valor) {
  return Number(valor).toLocaleString('es-CO');
}

function porcentaje(parte, total) {
  if (total === 0) return '0,0 %';
  return `${((parte / total) * 100).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

function titulo(texto) {
  return ['', texto, '─'.repeat(ANCHO)];
}

function dato(etiqueta, valor) {
  return `  ${`${etiqueta} `.padEnd(34, '.')} ${valor}`;
}

function tabla(columnas, filas, pie) {
  const todas = pie ? [...filas, pie] : filas;
  const anchos = columnas.map((col) =>
    Math.max(col.titulo.length, ...todas.map((fila) => String(fila[col.clave]).length))
  );
  const celda = (texto, i) =>
    columnas[i].derecha ? String(texto).padStart(anchos[i]) : String(texto).padEnd(anchos[i]);
  const linea = (fila) => `  ${columnas.map((col, i) => celda(fila[col.clave], i)).join('   ')}`;
  const separador = `  ${anchos.map((ancho) => '-'.repeat(ancho)).join('   ')}`;

  const resultado = [`  ${columnas.map((col, i) => celda(col.titulo, i)).join('   ')}`, separador];
  for (const fila of filas) resultado.push(linea(fila));
  if (pie) resultado.push(separador, linea(pie));
  return resultado;
}

function describirVenta(venta) {
  if (venta === null) return 'Sin ventas válidas';
  return `#${venta.id} · ${venta.producto} · ${pesos(valorVenta(venta))}`;
}

function seccionResumen(datos) {
  const fechas = datos.map((venta) => venta.fecha).sort();
  const periodo = fechas.length === 0 ? 'Sin datos' : `${fechas[0]} a ${fechas[fechas.length - 1]}`;
  const validas = contarVentasValidas(datos);

  return [
    ...titulo('1. RESUMEN GENERAL'),
    dato('Periodo', periodo),
    dato('Registros', numero(datos.length)),
    dato('Ventas válidas (cantidad > 0)', numero(validas)),
    dato('Registros sin unidades', numero(datos.length - validas)),
    dato('Unidades vendidas', numero(unidadesVendidas(datos))),
    dato('Total vendido', pesos(totalVendido(datos))),
    dato('Ticket promedio', pesos(ticketPromedio(datos))),
    dato('Venta más grande', describirVenta(ventaMayor(datos))),
  ];
}

function seccionCiudades(datos) {
  const total = totalVendido(datos);
  const filas = Object.entries(totalPorCiudad(datos))
    .sort(([, a], [, b]) => b - a)
    .map(([ciudad, valor]) => ({ ciudad, valor: pesos(valor), part: porcentaje(valor, total) }));

  if (filas.length === 0)
    return [...titulo('2. VENTAS POR CIUDAD'), '  No hay ventas registradas.'];
  return [
    ...titulo('2. VENTAS POR CIUDAD'),
    ...tabla(
      [
        { titulo: 'Ciudad', clave: 'ciudad' },
        { titulo: 'Total', clave: 'valor', derecha: true },
        { titulo: 'Participación', clave: 'part', derecha: true },
      ],
      filas,
      { ciudad: 'TOTAL', valor: pesos(total), part: porcentaje(total, total) }
    ),
  ];
}

function seccionProductos(datos) {
  const filas = Object.entries(unidadesPorProducto(datos))
    .sort(([prodA, a], [prodB, b]) => b - a || prodA.localeCompare(prodB, 'es'))
    .map(([producto, unidades]) => ({ producto, unidades: numero(unidades) }));

  if (filas.length === 0)
    return [...titulo('3. UNIDADES POR PRODUCTO'), '  No hay ventas registradas.'];
  return [
    ...titulo('3. UNIDADES POR PRODUCTO'),
    ...tabla(
      [
        { titulo: 'Producto', clave: 'producto' },
        { titulo: 'Unidades', clave: 'unidades', derecha: true },
      ],
      filas,
      { producto: 'TOTAL', unidades: numero(unidadesVendidas(datos)) }
    ),
  ];
}

function seccionTop(datos) {
  const filas = topProductosPorValor(datos, 3).map((item, i) => ({
    puesto: `${i + 1}.`,
    producto: item.producto,
    unidades: numero(item.unidades),
    valor: pesos(item.valor),
  }));

  if (filas.length === 0)
    return [...titulo('4. TOP 3 PRODUCTOS POR VALOR'), '  No hay ventas registradas.'];
  return [
    ...titulo('4. TOP 3 PRODUCTOS POR VALOR'),
    ...tabla(
      [
        { titulo: '#', clave: 'puesto' },
        { titulo: 'Producto', clave: 'producto' },
        { titulo: 'Unidades', clave: 'unidades', derecha: true },
        { titulo: 'Valor', clave: 'valor', derecha: true },
      ],
      filas
    ),
  ];
}

function seccionDias(datos, fechas) {
  const lineas = [...titulo('5. RESUMEN POR DÍA')];
  for (const fecha of fechas) {
    const dia = ventasDelDia(datos, fecha);
    lineas.push('', `  Día ${dia.fecha || '(sin fecha)'}`);

    if (!dia.fechaValida) {
      lineas.push(
        `  Fecha no válida. Use el formato AAAA-MM-DD, por ejemplo ${FECHAS_POR_DEFECTO[0]}.`
      );
      continue;
    }
    if (!dia.hayVentas) {
      lineas.push('  No se registraron ventas este día.');
    }
    lineas.push(
      dato('Registros', numero(dia.registros)),
      dato('Ventas válidas', numero(dia.ventasValidas)),
      dato('Unidades vendidas', numero(dia.unidades)),
      dato('Total vendido', pesos(dia.total)),
      dato('Ticket promedio', pesos(dia.ticketPromedio)),
      dato('Venta más grande', describirVenta(dia.ventaMayor))
    );
  }
  return lineas;
}

function generarReporte(datos, fechas = FECHAS_POR_DEFECTO) {
  const lineas = [
    '═'.repeat(ANCHO),
    '  CAFÉ ORIGEN · Reporte de ventas · v0.1',
    `  Generado: ${new Date().toLocaleDateString('es-CO')}`,
    '═'.repeat(ANCHO),
    ...seccionResumen(datos),
    ...seccionCiudades(datos),
    ...seccionProductos(datos),
    ...seccionTop(datos),
    ...seccionDias(datos, fechas),
    '',
    '═'.repeat(ANCHO),
  ];
  return lineas.join('\n');
}

function revisarReporte(texto, datos) {
  const problemas = [];
  if (texto.includes('NaN')) problemas.push('El reporte contiene NaN.');
  if (texto.includes('undefined')) problemas.push('El reporte contiene undefined.');

  const claves = Object.keys(totalPorCiudad(datos)).map((ciudad) => claveTexto(ciudad));
  if (new Set(claves).size !== claves.length) problemas.push('Hay ciudades duplicadas.');
  return problemas;
}

if (require.main === module) {
  const argumentos = process.argv.slice(2);
  const fechas = argumentos.length > 0 ? argumentos : FECHAS_POR_DEFECTO;

  const reporte = generarReporte(ventas, fechas);
  console.log(reporte);

  const problemas = revisarReporte(reporte, ventas);
  if (problemas.length === 0) {
    console.log('  Verificación: sin NaN, sin undefined y sin ciudades duplicadas.\n');
  } else {
    console.log('  Verificación con problemas:');
    for (const problema of problemas) console.log(`  - ${problema}`);
    process.exitCode = 1;
  }
}

module.exports = { generarReporte, revisarReporte };
