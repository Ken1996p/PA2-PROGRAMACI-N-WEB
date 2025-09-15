//responsabilidad gestion del almacenamiento persistente de datos / servicio almacenamiento 
class StorageService {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
}
// Responsabilidad mostrar notificaciones al usuario/ servicio notificacion
class NotificationService {
    static show(message, type = 'info', duration = 3000) {
        // Crear contenedor si no existe
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '1050';
            document.body.appendChild(container);
        }

        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `alert alert-${this.getBootstrapType(type)} alert-dismissible fade show`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        container.appendChild(notification);

        // Auto-remove después del duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        return notification;
    }

    static getBootstrapType(type) {
        const typeMap = {
            'success': 'success',
            'error': 'danger',
            'warning': 'warning',
            'info': 'info'
        };
        return typeMap[type] || 'info';
    }

    static showSuccess(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    static showError(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    static showWarning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }
}
 //Responsabilidad gestion de la información de productos / servicio producto
class ProductService {
    static products = [
        { id: 1, name: 'Zapatilla Urbana Dama', price: 120, category: 'urbana', image: 'imagenes/ofertas1.png' },
        { id: 2, name: 'Zapatilla Running Caballero', price: 150, category: 'deportiva', image: 'imagenes/oferta2.png' },
        { id: 3, name: 'Zapatilla Deportiva', price: 65, category: 'deportiva', image: 'imagenes/za1.jpg' },
        { id: 4, name: 'Zapatilla Casual', price: 50, category: 'casual', image: 'imagenes/za2.jpg' },
        { id: 5, name: 'Zapatilla Outdoor', price: 80, category: 'outdoor', image: 'imagenes/za3.jpg' },
        { id: 6, name: 'Zapatilla Running', price: 75, category: 'deportiva', image: 'imagenes/za4.jpg' },
        { id: 7, name: 'Zapatilla Deportiva Pro', price: 65, category: 'deportiva', image: 'imagenes/za5.jpg' },
        { id: 8, name: 'Zapatilla Urbana', price: 55, category: 'urbana', image: 'imagenes/za6.jpg' },
        { id: 9, name: 'Zapatilla Fitness', price: 70, category: 'fitness', image: 'imagenes/za7.jpg' },
        { id: 10, name: 'Zapatilla Trail', price: 85, category: 'outdoor', image: 'imagenes/za8.jpg' }
    ];

    static getAll() {
        return [...this.products];
    }

    static getById(id) {
        return this.products.find(product => product.id === parseInt(id));
    }

    static getByCategory(category) {
        return this.products.filter(product => product.category === category);
    }

    static search(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    static getCategories() {
        return [...new Set(this.products.map(product => product.category))];
    }

    static getFeatured(limit = 4) {
        return this.products.slice(0, limit);
    }

    static getOffers() {
        // Simular ofertas - productos con descuento
        return this.products.filter(product => product.price < 70);
    }
}
 //Responsabilidad gestion del estado del carrito / servicio carritos de compras
class CartService {
    static STORAGE_KEY = 'zapaStyle_cart';
    static items = [];
    static listeners = [];

    static init() {
        this.items = StorageService.load(this.STORAGE_KEY, []);
        this.notifyListeners();
    }

    static addItem(productId, quantity = 1) {
        const product = ProductService.getById(productId);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                productId: productId,
                quantity: quantity,
                product: product,
                addedAt: new Date()
            });
        }

        this.saveCart();
        this.notifyListeners();
        
        NotificationService.showSuccess(`${product.name} agregado al carrito`);
        
        return this.items;
    }

    static removeItem(productId) {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.productId !== productId);
        
        if (this.items.length < initialLength) {
            this.saveCart();
            this.notifyListeners();
            NotificationService.showSuccess('Producto eliminado del carrito');
        }
        
        return this.items;
    }

    static updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                return this.removeItem(productId);
            }
            item.quantity = quantity;
            this.saveCart();
            this.notifyListeners();
        }
        return this.items;
    }

    static clear() {
        this.items = [];
        this.saveCart();
        this.notifyListeners();
        NotificationService.showSuccess('Carrito vaciado');
    }

    static getItems() {
        return [...this.items];
    }

    static getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    static getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    static saveCart() {
        StorageService.save(this.STORAGE_KEY, this.items);
    }

    static subscribe(callback) {
        this.listeners.push(callback);
        // Llamar inmediatamente con el estado actual
        callback(this.getCartState());
    }

    static unsubscribe(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    static notifyListeners() {
        const state = this.getCartState();
        this.listeners.forEach(callback => callback(state));
    }

    static getCartState() {
        return {
            items: this.getItems(),
            count: this.getItemCount(),
            total: this.getTotal()
        };
    }
}
// Responsabilidad gestiona de animaciones y efectos visuales / servicio animacion
class AnimationService {
    static bounceElement(element, duration = 600) {
        if (!element) return;
        
        element.style.animation = `bounce ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    static pulseElement(element, duration = 1000) {
        if (!element) return;
        
        element.style.animation = `pulse ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    static slideIn(element, direction = 'left', duration = 500) {
        if (!element) return;
        
        element.style.animation = `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    static fadeIn(element, duration = 500) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
    }

    static addToCartAnimation(buttonElement) {
        this.bounceElement(buttonElement);
        
        // Animación del ícono del carrito
        const cartIcon = document.querySelector('#cart-btn i');
        if (cartIcon) {
            this.bounceElement(cartIcon);
        }
        
        // Animación del contador
        const cartCount = document.querySelector('#cart-count');
        if (cartCount) {
            this.pulseElement(cartCount, 800);
        }
    }
}
//Responsabilidad gestion de eventos personalizados de la aplicación / servicio eventos
class EventService {
    static events = {};

    static on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    static off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    static emit(eventName, data = null) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${eventName}:`, error);
                }
            });
        }
    }
}
//Responsabilidad coordinar todos los servicios y gestionar el ciclo de vida de la app o servicio general
class AppService {
    static isInitialized = false;

    static async init() {
        if (this.isInitialized) return;

        try {
            // Inicializar servicios
            CartService.init();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Inyectar estilos de animacion
            this.injectAnimationStyles();
            
            this.isInitialized = true;
            
            EventService.emit('app:initialized');
            console.log('🚀 ZapaStyle App initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            NotificationService.showError('Error al inicializar la aplicación');
        }
    }

    static setupGlobalEvents() {
        //botones back to top
        document.addEventListener('click', (e) => {
            if (e.target.matches('.back-to-top')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        //botones de agregar al carrito
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart') || e.target.closest('.add-to-cart')) {
                e.preventDefault();
                const button = e.target.matches('.add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const productId = parseInt(button.dataset.productId);
                
                if (productId) {
                    CartService.addItem(productId);
                    AnimationService.addToCartAnimation(button);
                }
            }
        });

        // Mostrar o ocultar boton back to top
        window.addEventListener('scroll', () => {
            const backToTop = document.querySelector('.back-to-top');
            if (backToTop) {
                backToTop.style.display = window.pageYOffset > 100 ? 'block' : 'none';
            }
        });
    }

    static injectAnimationStyles() {
        const styles = `
            <style id="zapaStyle-animations">
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-15px); }
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                @keyframes slideInLeft {
                    0% { transform: translateX(-100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideInRight {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideInUp {
                    0% { transform: translateY(100%); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes slideInDown {
                    0% { transform: translateY(-100%); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                
                .add-to-cart:hover {
                    transform: translateY(-2px);
                    transition: transform 0.2s ease;
                }
                
                #notification-container .alert {
                    margin-bottom: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
            </style>
        `;
        
        if (!document.getElementById('zapaStyle-animations')) {
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    static getVersion() {
        return '1.0.0';
    }

    static getServices() {
        return {
            storage: StorageService,
            notification: NotificationService,
            product: ProductService,
            cart: CartService,
            animation: AnimationService,
            event: EventService
        };
    }
}

// Exportar servicios para uso global
window.ZapaStyle = {
    App: AppService,
    Storage: StorageService,
    Notification: NotificationService,
    Product: ProductService,
    Cart: CartService,
    Animation: AnimationService,
    Event: EventService
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppService.init());
} else {
    AppService.init();
}