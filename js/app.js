// Declaración de variables y arrays
const productos = ["Zapatillas", "Remera", "Pantalón"];
const precios = [35000, 12000, 18000];
let carrito = [];

// Función 1: mostrar productos
function mostrarProductos() {
  console.log("Productos disponibles:");
  for (let i = 0; i < productos.length; i++) {
    console.log(`${i + 1}. ${productos[i]} - $${precios[i]}`);
  }
}

// Función 2: agregar al carrito
function agregarAlCarrito() {
  console.log("ATENCIÓN: Tenés un descuento del 20% si superas los $200.000 en tu compra!");

  // Mostrar la lista de productos con su número
  let lista = "Elija un producto:\n";
  for (let i = 0; i < productos.length; i++) {
    lista += (i + 1) + ". " + productos[i] + " - $" + precios[i] + "\n";
  }

  let opcion = parseInt(prompt(lista));

  if (opcion >= 1 && opcion <= productos.length) {
    carrito.push(precios[opcion - 1]);
    alert(`Agregaste ${productos[opcion - 1]} al carrito.`);
  } else {
    alert("Opción inválida. Intente nuevamente.");
  }
}


// Función 3: calcular total
function calcularTotal() {
  let total = 0;
  for (let precio of carrito) {
    total += precio;
  }

  // Descuento si supera cierto monto
  if (total > 200000) {
    total *= 0.8; // 20% de descuento
    console.log("Se aplicó un descuento del 20% por superar $200.000.");
  }

  alert("El total de tu compra es: $" + total);
  return total;
}

// Programa principal
function simuladorCompras() {
  mostrarProductos();

  let continuar = true;
  while (continuar) {
    agregarAlCarrito();
    continuar = confirm("¿Desea agregar otro producto?");
  }

  calcularTotal();
  alert("¡Gracias por tu compra!");
}

// Llamada al simulador
simuladorCompras();
