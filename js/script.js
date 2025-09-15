// ============================
// CLASE PRODUCTO (con métodos)
// ============================
class Producto {
  constructor(id, nombre, precio) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
  }

  mostrar() {
    return `${this.nombre} - S/ ${this.precio}`;
  }
}

// ============================
// DATOS Y FUNCIONES DEL CARRITO
// ============================
const productos = [
  new Producto(1, "Zapatilla Urbana Dama", 120),
  new Producto(2, "Zapatilla Running Caballero", 150),
];

let carrito = [];

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (producto) {
    carrito.push(producto);
    actualizarCarrito();
  }
}

function actualizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const total = document.getElementById("total");
  lista.innerHTML = "";

  let suma = 0;
  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item.mostrar();
    lista.appendChild(li);
    suma += item.precio;
  });

  total.textContent = suma;
}

// ============================
// EVENTO PARA VACIAR CARRITO
// ============================
document.addEventListener("DOMContentLoaded", () => {
  const botonVaciar = document.getElementById("vaciar");
  if (botonVaciar) {
    botonVaciar.addEventListener("click", () => {
      carrito = [];
      actualizarCarrito();
    });
  }

  // Evento de teclado (presionar Enter para mostrar carrito)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const seccionCarrito = document.getElementById("carrito");
      seccionCarrito.classList.toggle("oculto");
    }
  });

  // Temporizador para saludo
  setTimeout(() => {
    alert("¡Bienvenido a ZapaStyle! 🎉 Descubre nuestras promociones.");
  }, 3000);
});

// ============================
// Función flecha (extra)
// ============================
const saludarCliente = (nombre = "cliente") => console.log(`Hola, ${nombre}! Gracias por visitarnos.`);
saludarCliente();
