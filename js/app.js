// ===============================
// Config & Estado
// ===============================
const API_URL = "../data/products.json";
const STORAGE_CART = "carrito";
const STORAGE_CLIENTE = "cliente";
const STORAGE_CATALOGO = "catalogo";

let catalogo = [];
let carrito = JSON.parse(localStorage.getItem(STORAGE_CART)) || [];

// ===============================
// Utilidades SweetAlert2
// ===============================
const swalOk = (title, text, icon = "success") =>
  Swal.fire({ title, html: text, icon, confirmButtonText: "Aceptar" });

const swalFestivo = (title, html) =>
  Swal.fire({
    title,
    html,
    icon: "success",
    confirmButtonText: "Seguir comprando",
    showCancelButton: true,
    cancelButtonText: "Ir al carrito",
    cancelButtonColor: "#198754",
    confirmButtonColor: "#6c757d",
    backdrop: true,
  }).then((res) => {
    if (!res.isConfirmed) window.location.href = "carrito.html";
  });

const swalConfirm = async (title, text, confirmText = "Sí") => {
  const res = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
  });
  return res.isConfirmed;
};

// ===============================
// Carga de datos (fetch JSON)
// ===============================
async function cargarCatalogo() {
  const cache = localStorage.getItem(STORAGE_CATALOGO);
  if (cache) {
    catalogo = JSON.parse(cache);
    return;
  }
  const resp = await fetch(API_URL);
  if (!resp.ok) throw new Error("No se pudo cargar el catálogo");
  catalogo = await resp.json();
  localStorage.setItem(STORAGE_CATALOGO, JSON.stringify(catalogo));
}

// ==========================================================
// Función para actualizar contador del carrito en el navbar
// ==========================================================
function actualizarContadorCarrito() {
  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    const totalItems = carrito.reduce((acc, prod) => acc + (prod.cantidad || 0), 0);
    contador.textContent = totalItems;
    contador.style.display = totalItems > 0 ? "inline" : "none";
  }
}

// ===============================
// Render de Productos (productos.html)
// ===============================
function mostrarProductos() {
  const contenedor = document.getElementById("productList");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  catalogo.forEach((prod) => {
    const col = document.createElement("div");
    col.className = "col-md-4 col-sm-6";
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${prod.img}" alt="${prod.nombre}" class="card-img-top img-producto" data-id="${prod.id}">
        <div class="card-body text-center">
          <h5 class="card-title mb-1">${prod.nombre}</h5>
          <p class="card-text text-muted mb-3">$${prod.precio}</p>
          <button class="btn btn-primary btn-agregar" data-id="${prod.id}">
            Agregar al carrito
          </button>
        </div>
      </div>
    `;
    contenedor.appendChild(col);
  });

  // Eventos agregar
  document.querySelectorAll(".btn-agregar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      agregarAlCarrito(id);
    });
  });

  // Evento imagen → ampliar
  document.querySelectorAll(".img-producto").forEach((img) => {
    img.addEventListener("click", () => {
      const id = parseInt(img.getAttribute("data-id"));
      const prod = catalogo.find((p) => p.id === id);
      Swal.fire({
        title: prod.nombre,
        imageUrl: prod.img,
        imageAlt: prod.nombre,
        imageWidth: 600,
        imageHeight: 400,
        showConfirmButton: true,
        confirmButtonText: "Cerrar",
      });
    });
  });
}

// ===============================
// Carrito
// ===============================
function agregarAlCarrito(id) {
  const producto = catalogo.find((p) => p.id === id);
  const existente = carrito.find((p) => p.id === id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  localStorage.setItem(STORAGE_CART, JSON.stringify(carrito));
  actualizarContadorCarrito();

  swalFestivo(
    "Producto agregado 🎉",
    `<div style="font-size:1rem">
      <img src="${producto.img}" alt="${producto.nombre}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" />
      <p class="mt-2 mb-1"><strong>${producto.nombre}</strong> agregado al carrito</p>
      <span class="text-success">🛒 Total ítems: ${carrito.reduce(
        (a, p) => a + p.cantidad,
        0
      )}</span>
    </div>`
  );
}

function calcularTotal() {
  let total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  if (total > 200000) total *= 0.8; // 20% dto
  return total;
}

// ===============================
// Render Carrito (carrito.html)
// ===============================
function mostrarCarrito() {
  const cuerpo = document.getElementById("carritoContainer");
  const totalDiv = document.getElementById("carritoTotal");
  if (!cuerpo) return;

  cuerpo.innerHTML = "";
  if (carrito.length === 0) {
    cuerpo.innerHTML = `
      <tr><td colspan="6" class="text-center">
        <div class="alert alert-info">Tu carrito está vacío. 
          <a class="alert-link" href="productos.html">Ver productos</a>.
        </div>
      </td></tr>
    `;
    totalDiv.innerHTML = "";
    actualizarContadorCarrito();
    return;
  }

  carrito.forEach((prod, index) => {
    const subtotal = prod.precio * prod.cantidad;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${prod.img}" alt="${prod.nombre}" class="img-carrito" style="width:60px;height:60px;object-fit:cover;border-radius:8px"></td>
      <td>${prod.nombre}</td>
      <td>$${prod.precio}</td>
      <td>
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-outline-secondary btn-cantidad decrease me-1" data-action="decrease" data-index="${index}">➖</button>
          <span class="mx-1">${prod.cantidad}</span>
          <button class="btn btn-sm btn-outline-secondary btn-cantidad increase ms-1" data-action="increase" data-index="${index}">➕</button>
        </div>
      </td>
      <td>$${subtotal}</td>
      <td>
        <button class="btn btn-sm btn-danger btn-eliminar" data-action="remove" data-index="${index}">❌ Eliminar</button>
      </td>
    `;
    cuerpo.appendChild(tr);
  });

  const totalSinDto = carrito.reduce((a, p) => a + p.precio * p.cantidad, 0);
  const total = calcularTotal();
  totalDiv.innerHTML = `
    <div class="card shadow-sm p-3">
      <h3 class="mb-0">Total: $${total}</h3>
      ${
        total < totalSinDto
          ? '<p class="text-success mb-0">Se aplicó 20% de descuento por superar $200.000 ✅</p>'
          : ""
      }
      <div class="mt-3">
        <button class="btn btn-warning me-2" id="btnVaciar">Vaciar carrito</button>
        <button class="btn btn-success" id="btnComprar">Comprar</button>
      </div>
    </div>
  `;

  // Eventos dinámicos
  document.querySelectorAll("[data-action]").forEach((btn) => {
    const action = btn.getAttribute("data-action");
    const index = parseInt(btn.getAttribute("data-index"));

    btn.addEventListener("click", async () => {
      if (action === "increase") carrito[index].cantidad++;
      else if (action === "decrease" && carrito[index].cantidad > 1) carrito[index].cantidad--;
      else if (action === "remove") {
        const confirmar = await Swal.fire({
          title: "Eliminar producto",
          html: `¿Querés eliminar <strong>${carrito[index].nombre}</strong> del carrito?`,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Sí, eliminar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#cf0808ff",
          cancelButtonColor: "#6c757d",
        });
        if (!confirmar.isConfirmed) return;
        carrito.splice(index, 1);
        await swalOk("Producto eliminado", "El producto fue eliminado del carrito.", "info");
      }

      localStorage.setItem(STORAGE_CART, JSON.stringify(carrito));
      mostrarCarrito();
      actualizarContadorCarrito();
    });
  });

  // Vaciar carrito
  const btnVaciar = document.getElementById("btnVaciar");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", async () => {
      const ok = await swalConfirm("Vaciar carrito", "¿Querés vaciar el carrito?", "Sí, vaciar");
      if (ok) {
        carrito = [];
        localStorage.removeItem(STORAGE_CART);
        mostrarCarrito();
        actualizarContadorCarrito();
        swalOk("Carrito vacío", "Se eliminaron todos los productos.");
      }
    });
  }

  // Comprar
  const btnComprar = document.getElementById("btnComprar");
  if (btnComprar) {
    btnComprar.addEventListener("click", async () => {
      const { value: datos } = await Swal.fire({
        title: "Completar datos de compra",
        html: `
          <style>
            .swal2-popup .form-field {
              width: 85%;
              margin: 8px auto;
              display: block;
            }
            .swal2-popup select.form-field {
              padding: 10px;
              border-radius: 6px;
              border: 1px solid #ccc;
              font-size: 1rem;
              background-color: #fff;
            }
          </style>
          <input id="swal-nombre" class="swal2-input form-field" placeholder="Nombre y apellido">
          <input id="swal-email" type="email" class="swal2-input form-field" placeholder="Email">
          <input id="swal-direccion" class="swal2-input form-field" placeholder="Dirección de entrega">
          <select id="swal-pago" class="form-field">
            <option value="">Seleccioná un método de pago</option>
            <option value="efectivo">💸 Efectivo o Transferencia</option>
            <option value="debito">💳 Tarjeta de Débito</option>
            <option value="credito">💳 Tarjeta de Crédito</option>
            <option value="mercadopago">🟦 MercadoPago</option>
          </select>
        `,
        focusConfirm: false,
        preConfirm: () => {
          const nombre = document.getElementById("swal-nombre").value.trim();
          const email = document.getElementById("swal-email").value.trim();
          const direccion = document.getElementById("swal-direccion").value.trim();
          const pago = document.getElementById("swal-pago").value;

          if (!nombre || !email || !direccion || !pago) {
            Swal.showValidationMessage("Completá todos los campos");
            return false;
          }

          const emailValido = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
          if (!emailValido) {
            Swal.showValidationMessage("Ingresá un email válido");
            return false;
          }

          return { nombre, email, direccion, pago };
        },
        confirmButtonText: "Confirmar compra",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      });

      if (!datos) return;
      
      const total = calcularTotal();

      localStorage.setItem(STORAGE_CLIENTE, JSON.stringify(datos));
      carrito = [];
      localStorage.removeItem(STORAGE_CART);
      mostrarCarrito();
      actualizarContadorCarrito();

      swalOk(
        "¡Compra realizada! 🎉",
        `Gracias por tu compra, <b>${datos.nombre}</b>.<br>
        Método de pago: <b>${datos.pago.toUpperCase()}</b>.<br>
        Total abonado: <b>$${total}</b>.<br><br>
        Te enviamos un correo a <b>${datos.email}</b> con el detalle del pedido.`
      );
    });
  }
}

// ===============================
// Boot
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await cargarCatalogo();
  } catch (e) {
    await swalOk("Error", "No pudimos cargar el catálogo, recargá la página", "error");
    return;
  }
  mostrarProductos();
  mostrarCarrito();
  actualizarContadorCarrito();
});
