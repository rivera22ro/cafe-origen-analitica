const { ventas } = require('./datos');

console.log('=== Café Origen · Exploración de datos ===\n');

console.log('Cantidad de registros:', ventas.length);

console.log('\nPrimer registro (índice 0):');
console.log(ventas[0]);

console.log(`\nÚltimo registro (índice ${ventas.length - 1}):`);
console.log(ventas[ventas.length - 1]);

console.log('\nProducto del registro en la posición 4 (ventas[3]):', ventas[3].producto);

console.log('\nTabla completa:');
console.table(ventas);
