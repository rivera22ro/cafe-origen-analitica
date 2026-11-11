const { ventas } = require('./datos');

//     console.log(ventas.cliente)

// let newcliente  = [ventas.cliente

//     .sort(() => Math.random() - 0.5)
//     .slice(0, 3);

// console.log(newcliente);

const clientesEstaticos = ventas.map((venta) => venta.cliente); 

// const clientes = [];

// for (let i = 0; i < ventas.length; i++) {
//     const random = Math.floor(Math.random() * ventas.length);
//     const cliente = clientesEstaticos[random];

//     if (!clientes.includes(cliente) && clientes.length < 3) {
//         clientes.push(cliente);
//     }
// }

// console.log(clientes);

let frutasAleatorias = [...clientesEstaticos]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

console.log(frutasAleatorias);