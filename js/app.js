// Declaración de productos como objetos
const productos = [
  { id: 1, nombre: "Zapatillas", precio: 135000, img: "https://acdn-us.mitiendanube.com/stores/001/749/890/products/whatsapp-image-2024-06-13-at-13-19-38-badfa4ee5c18a15bc617183124180554-480-0.jpeg" },
  { id: 2, nombre: "Remera", precio: 12000, img: "https://vikati.net/wp-content/uploads/2024/11/negra.webp" },
  { id: 3, nombre: "Pantalón", precio: 18000, img: "https://acdn-us.mitiendanube.com/stores/004/997/328/products/img_2855-c1d66138a86264ebc717418170067621-480-0.jpeg" },
  { id: 4, nombre: "Campera", precio: 55000, img: "https://acdn-us.mitiendanube.com/stores/004/600/346/products/11-campera-eco-cuero-capucha-min-831b0df8253320685a17156999766723-480-0.jpg" },
  { id: 5, nombre: "Gorra", precio: 8000, img: "https://i.pinimg.com/originals/04/36/01/0436010b6e9e3cbaef2884a627f66a47.jpg" },
  { id: 6, nombre: "Mochila", precio: 125000, img: "https://i.etsystatic.com/18815814/r/il/72bbd4/3228610104/il_570xN.3228610104_8rg6.jpg" }
];

// Recuperar carrito de localStorage o inicializar vacío
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Renderizar productos en productos.html
function mostrarProductos() {
  const contenedor = document.getElementById("productList");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  productos.forEach(prod => {
    const card = document.createElement("div");
    card.className = "col-md-4 col-sm-6";
    card.innerHTML = `
      <div class="card h-100">
        <img src="${prod.img}" class="card-img-top img-producto" alt="${prod.nombre}">
        <div class="card-body text-center">
          <h5 class="card-title">${prod.nombre}</h5>
          <p class="card-text">$${prod.precio}</p>
          <button class="btn btn-primary btn-agregar" data-id="${prod.id}">Agregar al carrito</button>
        </div>
      </div>
    `;
    contenedor.appendChild(card);
  });

  // Eventos botones "Agregar al carrito"
  document.querySelectorAll(".btn-agregar").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      agregarAlCarrito(id);
    });
  });

  // Evento imágenes para mostrar en modal
  document.querySelectorAll(".img-producto").forEach(img => {
    img.addEventListener("click", () => {
      const modalImg = document.getElementById("modalImagenGrandeImg");
      modalImg.src = img.src;
      const modal = new bootstrap.Modal(document.getElementById("modalImagenGrande"));
      modal.show();
    });
  });
}

// Agregar producto al carrito con cantidad
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const existente = carrito.find(p => p.id === id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Modal festivo
  const modalTexto = document.getElementById("modalCarritoTexto");
  const modalIcon = document.getElementById("modalCarritoIcon");
  const modalTitulo = document.getElementById("modalCarritoLabel");

  if (modalTexto && modalIcon && modalTitulo) {
    modalTitulo.textContent = "Producto agregado 🎉";
    modalTexto.textContent = `${producto.nombre} agregado al carrito ✅`;
    modalIcon.textContent = "🛒";
    const modal = new bootstrap.Modal(document.getElementById("modalCarrito"));
    modal.show();
  }
}

// Calcular total con descuento
function calcularTotal() {
  let total = carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
  if (total > 200000) {
    total *= 0.8; // 20% descuento
  }
  return total;
}

// Mostrar carrito en carrito.html como tabla
function mostrarCarrito() {
  const contenedor = document.getElementById("carritoContainer");
  const totalDiv = document.getElementById("carritoTotal");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">
          <div class="alert alert-info">
            Todavía no tienes productos en el carrito.  
            <a href="productos.html" class="alert-link">Explora nuestros productos</a>.
          </div>
        </td>
      </tr>
    `;
    totalDiv.innerHTML = "";
    return;
  }

  carrito.forEach((prod, index) => {
    const subtotal = prod.precio * prod.cantidad;
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td data-label="Imagen"><img src="${prod.img}" alt="${prod.nombre}" class="img-carrito"></td>
      <td data-label="Producto">${prod.nombre}</td>
      <td data-label="Precio">$${prod.precio}</td>
      <td data-label="Cantidad">
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-outline-secondary btn-cantidad decrease" data-action="decrease" data-index="${index}">➖</button>
          <span class="mx-2">${prod.cantidad}</span>
          <button class="btn btn-sm btn-outline-secondary btn-cantidad increase" data-action="increase" data-index="${index}">➕</button>
        </div>
      </td>
      <td data-label="Subtotal">$${subtotal}</td>
      <td data-label="Acciones">
        <button class="btn btn-sm btn-danger btn-eliminar" data-action="remove" data-index="${index}">❌ Eliminar</button>
      </td>
    `;
    contenedor.appendChild(fila);
  });

  // Mostrar total
  let total = calcularTotal();
  totalDiv.innerHTML = `
    <h3>Total: $${total}</h3>
    ${total < carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0) 
      ? '<p class="text-success">Se aplicó un descuento del 20% por superar $200.000 ✅</p>' 
      : ''}
    <div class="mt-3">
      <button class="btn btn-warning me-2" id="btnVaciar">Vaciar carrito</button>
      <button class="btn btn-success" id="btnComprar">Comprar</button>
    </div>
  `;

  // Eventos dinámicos
  document.querySelectorAll("[data-action]").forEach(btn => {
    const action = btn.getAttribute("data-action");
    const index = parseInt(btn.getAttribute("data-index"));

    btn.addEventListener("click", () => {
      if (action === "increase") {
        carrito[index].cantidad++;
      } else if (action === "decrease" && carrito[index].cantidad > 1) {
        carrito[index].cantidad--;
      } else if (action === "remove") {
        carrito.splice(index, 1);
      }
      localStorage.setItem("carrito", JSON.stringify(carrito));
      mostrarCarrito();
    });
  });

  // Evento vaciar carrito con modal de confirmación
  const btnVaciar = document.getElementById("btnVaciar");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
      const modal = new bootstrap.Modal(document.getElementById("modalVaciar"));
      modal.show();

      document.getElementById("confirmVaciar").addEventListener("click", () => {
        carrito = [];
        localStorage.removeItem("carrito");
        mostrarCarrito();
        modal.hide();
      }, { once: true });
    });
  }

  // Evento comprar con modal de confirmación
  const btnComprar = document.getElementById("btnComprar");
  if (btnComprar) {
    btnComprar.addEventListener("click", () => {
      const modalConfirmar = new bootstrap.Modal(document.getElementById("modalConfirmarCompra"));
      modalConfirmar.show();

      document.getElementById("confirmarCompra").addEventListener("click", () => {
        const modalTexto = document.getElementById("modalCarritoTexto");
        const modalIcon = document.getElementById("modalCarritoIcon");
        const modalTitulo = document.getElementById("modalCarritoLabel");

        if (modalTexto && modalIcon && modalTitulo) {
          modalTitulo.textContent = "¡Compra realizada! 🎉";
          modalTexto.textContent = "✅ ¡Gracias por tu compra! Tu pedido está en proceso.";
          modalIcon.textContent = "🎊";

          const modalFinal = new bootstrap.Modal(document.getElementById("modalCarrito"));
          modalFinal.show();
        }

        carrito = [];
        localStorage.removeItem("carrito");
        mostrarCarrito();
        modalConfirmar.hide();
      }, { once: true });
    });
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  mostrarProductos();
  mostrarCarrito();
});
