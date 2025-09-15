# PA1-PROGRAMACION WEB
PROYECTO 1 PW
# Proyecto 1

Este proyecto de **Programación Web**.  
Incluye la integración de **Bootstrap 5**, **Font Awesome**, un **carrito de compras sincronizado** entre páginas, y mejoras de accesibilidad.

## 📌 Descripción
El sitio web está diseñado para ser **responsivo**, **accesible** y **fácil de usar**.  
Cuenta con múltiples páginas (`index.html`, `nosotros.html`, `servicios.html`, `ofertas.html`, `contacto.html`) conectadas por una **barra de navegación unificada**.

## 🚀 Tecnologías utilizadas
- **HTML5** para la estructura del contenido.
- **CSS3** (archivo unificado `css/styles.css`) para estilos y animaciones.
- **JavaScript** (`js/main_cart.js`) para la lógica del carrito y sincronización con `localStorage`.
- **Bootstrap 5** para el diseño responsivo y componentes.
- **Font Awesome** para íconos.
- **LocalStorage** para mantener el estado del carrito entre páginas.

## 🛒 Funcionalidad del carrito
- **Agregar producto**: Los botones con la clase `.add-to-cart` y atributos `data-name` y `data-price` permiten añadir productos.
- **Animación llamativa**: El ícono del carrito rebota y el contador parpadea al agregar un producto.
- **Carrito desplegable**: Muestra nombre y precio de cada producto.
- **Sincronización**: El contenido del carrito se mantiene al cambiar de página o recargar.
- **Vaciar carrito**: Botón para eliminar todos los productos.
- **Total**: Calcula el monto total de los productos añadidos.

## 🎨 Mejoras visuales y de accesibilidad
- Navbar responsiva en todas las páginas.
- Botón **Back to top** (⬆) en la parte inferior derecha.
- Contraste mejorado y foco visible para elementos interactivos.
- Estructura semántica con etiquetas HTML apropiadas.
- Etiquetas `aria-label` para mejorar accesibilidad del carrito.

