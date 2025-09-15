//clase base para modelos
class BaseModel {
    constructor(data = {}) {
        this.data = { ...data };
        this.listeners = [];
        this.id = data.id || this.generateId();
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    get(key) {
        return this.data[key];
    }

    set(key, value) {
        const oldValue = this.data[key];
        this.data[key] = value;
        this.notifyChange(key, value, oldValue);
        return this;
    }

    setAll(data) {
        Object.keys(data).forEach(key => {
            this.set(key, data[key]);
        });
        return this;
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return this;
    }

    unsubscribe(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
        return this;
    }

    notifyChange(key, newValue, oldValue) {
        this.listeners.forEach(callback => {
            callback.call(this, key, newValue, oldValue);
        });
    }

    toJSON() {
        return { ...this.data };
    }
}
//clase base para vistas
class BaseView {
    constructor(element, model = null) {
        this.element = typeof element === 'string' ? document.querySelector(element) : element;
        this.model = model;
        this.events = {};
        this.childViews = [];
        
        if (this.model) {
            this.bindModelEvents();
        }
        
        this.init();
    }

    init() {
        //override en clases hijas
    }

    bindModelEvents() {
        if (this.model && this.model.subscribe) {
            this.model.subscribe((key, newValue, oldValue) => {
                this.onModelChange(key, newValue, oldValue);
            });
        }
    }

    onModelChange(key, newValue, oldValue) {
        //override en clases hijas
        this.render();
    }

    render() {
        //override en clases hijas
        return this;
    }

    bindEvents() {
        Object.keys(this.events).forEach(eventKey => {
            const [eventType, selector] = eventKey.split(' ');
            const callback = this.events[eventKey];
            
            if (selector) {
                this.element.addEventListener(eventType, (e) => {
                    if (e.target.matches(selector) || e.target.closest(selector)) {
                        callback.call(this, e);
                    }
                });
            } else {
                this.element.addEventListener(eventType, callback.bind(this));
            }
        });
    }

    addChildView(view) {
        this.childViews.push(view);
        return this;
    }

    removeChildView(view) {
        this.childViews = this.childViews.filter(child => child !== view);
        return this;
    }

    destroy() {
        this.childViews.forEach(child => child.destroy());
        this.childViews = [];
        
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    $(selector) {
        return this.element.querySelector(selector);
    }

    $$(selector) {
        return this.element.querySelectorAll(selector);
    }
}
//Clase base para controladores
class BaseController {
    constructor() {
        this.views = {};
        this.models = {};
    }

    addView(name, view) {
        this.views[name] = view;
        return this;
    }

    addModel(name, model) {
        this.models[name] = model;
        return this;
    }

    getView(name) {
        return this.views[name];
    }

    getModel(name) {
        return this.models[name];
    }

    init() {
        //override en clases hijas
    }

    destroy() {
        Object.values(this.views).forEach(view => {
            if (view.destroy) view.destroy();
        });
        this.views = {};
        this.models = {};
    }
}
//router simple para navegación SPA
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });
        
        //manejar ruta inicial
        this.handleRoute();
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
        return this;
    }

    navigate(path) {
        window.location.hash = path;
        return this;
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const handler = this.routes[hash];
        
        if (handler) {
            if (this.currentRoute) {
                this.currentRoute.destroy && this.currentRoute.destroy();
            }
            
            this.currentRoute = handler();
        }
    }
}
//sistema de componentes que se pueden reutilizar
class Component extends BaseView {
    constructor(element, props = {}) {
        super(element);
        this.props = props;
        this.state = {};
    }

    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.onStateChange(this.state, oldState);
        this.render();
    }

    onStateChange(newState, oldState) {
        //override en clases hijas
    }
}
//modelo de producto
class ProductModel extends BaseModel {
    constructor(data) {
        super(data);
    }

    get name() {
        return this.get('name');
    }

    set name(value) {
        return this.set('name', value);
    }

    get price() {
        return this.get('price');
    }

    set price(value) {
        return this.set('price', value);
    }

    get category() {
        return this.get('category');
    }

    set category(value) {
        return this.set('category', value);
    }

    get image() {
        return this.get('image');
    }

    set image(value) {
        return this.set('image', value);
    }

    isInCategory(category) {
        return this.category === category;
    }

    matchesSearch(query) {
        const searchTerm = query.toLowerCase();
        return this.name.toLowerCase().includes(searchTerm) ||
               this.category.toLowerCase().includes(searchTerm);
    }
}
//vista de Producto
class ProductView extends BaseView {
    constructor(element, model) {
        super(element, model);
        this.template = this.createTemplate();
    }

    createTemplate() {
        return `
            <div class="card h-100 product-card" data-product-id="{{id}}">
                <img src="{{image}}" class="card-img-top" alt="{{name}}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">{{name}}</h5>
                    <p class="card-text text-primary fw-bold">S/ {{price}}</p>
                    <p class="card-text text-muted small">{{category}}</p>
                    <div class="btn-group mt-auto" role="group">
                        <button class="btn btn-primary add-to-cart" data-product-id="{{id}}">
                            <i class="fas fa-cart-plus"></i> Agregar
                        </button>
                        <button class="btn btn-outline-danger btn-favorite" data-product-id="{{id}}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn btn-outline-info btn-compare" data-product-id="{{id}}">
                            <i class="fas fa-balance-scale"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        if (!this.model || !this.element) return this;

        const data = this.model.toJSON();
        let html = this.template;
        
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, data[key]);
        });
        
        this.element.innerHTML = html;
        return this;
    }

    onModelChange() {
        this.render();
    }
}
//vista de lista de los productos
class ProductListView extends BaseView {
    constructor(element) {
        super(element);
        this.products = [];
        this.filteredProducts = [];
        this.productViews = [];
        this.events = {
            'click .add-to-cart': 'handleAddToCart',
            'click .btn-favorite': 'handleToggleFavorite',
            'click .btn-compare': 'handleToggleCompare'
        };
        
        this.bindEvents();
    }

    init() {
        this.loadProducts();
    }

    loadProducts() {
        const productData = ZapaStyle.Product.getAll();
        this.products = productData.map(data => new ProductModel(data));
        this.filteredProducts = [...this.products];
        this.render();
    }

    filterByCategory(category) {
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.isInCategory(category)
            );
        }
        this.render();
    }

    search(query) {
        if (!query.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product =>
                product.matchesSearch(query)
            );
        }
        this.render();
    }

    sortBy(criteria) {
        switch (criteria) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-asc':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
        }
        this.render();
    }

    render() {
        if (!this.element) return this;

        //limpiar vistas anteriores
        this.productViews.forEach(view => view.destroy());
        this.productViews = [];

        if (this.filteredProducts.length === 0) {
            this.element.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h5>No se encontraron productos</h5>
                    <p class="text-muted">Intenta con otros filtros de búsqueda</p>
                </div>
            `;
            return this;
        }

        //crear elementos para cada producto
        const productElements = this.filteredProducts.map(product => {
            const productElement = document.createElement('div');
            productElement.className = 'col-md-6 col-lg-3 mb-4';
            
            const productView = new ProductView(productElement, product);
            productView.render();
            
            this.productViews.push(productView);
            
            return productElement;
        });

        //limpiar y agregar nuevos elementos
        this.element.innerHTML = '';
        productElements.forEach(element => {
            this.element.appendChild(element);
        });

        //animaciones
        this.animateProducts();

        return this;
    }

    animateProducts() {
        const productCards = this.$$('.product-card');
        productCards.forEach((card, index) => {
            setTimeout(() => {
                ZapaStyle.Animation.slideIn(card, 'up');
            }, index * 100);
        });
    }

    handleAddToCart(e) {
        e.preventDefault();
        const productId = parseInt(e.target.dataset.productId || 
                                 e.target.closest('.add-to-cart').dataset.productId);
        
        ZapaStyle.Cart.addItem(productId);
        ZapaStyle.Animation.addToCartAnimation(e.target);
    }

    handleToggleFavorite(e) {
        e.preventDefault();
        const productId = parseInt(e.target.dataset.productId || 
                                 e.target.closest('.btn-favorite').dataset.productId);
        
        if (window.favoritesManager) {
            window.favoritesManager.toggleFavorite(productId);
        }
    }

    handleToggleCompare(e) {
        e.preventDefault();
        const productId = parseInt(e.target.dataset.productId || 
                                 e.target.closest('.btn-compare').dataset.productId);
        
        if (window.compareManager) {
            window.compareManager.toggleCompare(productId);
        }
    }
}
//controlador de productos
class ProductController extends BaseController {
    constructor() {
        super();
        this.init();
    }

    init() {
        //iInicializar vista de lista de productos que existen
        const productListElement = document.querySelector('.productos-grid');
        if (productListElement) {
            const productListView = new ProductListView(productListElement);
            this.addView('productList', productListView);
            
            //configuracion de los filtros
            this.setupFilters();
        }
    }

    setupFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const sortSelect = document.getElementById('sort-select');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.getView('productList').filterByCategory(e.target.value);
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.getView('productList').sortBy(e.target.value);
            });
        }
    }

    searchProducts(query) {
        const productListView = this.getView('productList');
        if (productListView) {
            productListView.search(query);
        }
    }
}
//aplicacion principal del framework
class ZapaStyleApp {
    constructor() {
        this.router = new Router();
        this.controllers = {};
        this.services = {};
        
        this.init();
    }

    init() {
        this.initializeServices();
        this.initializeControllers();
        this.setupRoutes();
        
        console.log('🏗️ ZapaStyle Framework initialized');
    }

    initializeServices() {
        //servicios que ya estan disponibles
        this.services = {
            storage: ZapaStyle.Storage,
            notification: ZapaStyle.Notification,
            product: ZapaStyle.Product,
            cart: ZapaStyle.Cart,
            animation: ZapaStyle.Animation,
            event: ZapaStyle.Event
        };
    }

    initializeControllers() {
        //inicializar controladores segun la página actual
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'ofertas.html':
            case 'index.html':
                this.controllers.product = new ProductController();
                break;
        }
    }

    setupRoutes() {
        this.router
            .addRoute('/', () => this.loadHomePage())
            .addRoute('/products', () => this.loadProductsPage())
            .addRoute('/cart', () => this.loadCartPage())
            .addRoute('/favorites', () => this.loadFavoritesPage());
    }

    getCurrentPage() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    loadHomePage() {
        console.log('Loading home page');
        return this.controllers.product;
    }

    loadProductsPage() {
        console.log('Loading products page');
        return this.controllers.product;
    }

    loadCartPage() {
        console.log('Loading cart page');
        // Implementar vista completa del carrito
    }

    loadFavoritesPage() {
        console.log('Loading favorites page');
        // Implementar vista favoritaas
    }

    addController(name, controller) {
        this.controllers[name] = controller;
        return this;
    }

    getController(name) {
        return this.controllers[name];
    }

    addService(name, service) {
        this.services[name] = service;
        return this;
    }

    getService(name) {
        return this.services[name];
    }
}
//factor de creacion de componentes
class ComponentFactory {
    static components = {};

    static register(name, componentClass) {
        this.components[name] = componentClass;
    }

    static create(name, element, props = {}) {
        const ComponentClass = this.components[name];
        if (!ComponentClass) {
            throw new Error(`Component '${name}' not registered`);
        }
        
        return new ComponentClass(element, props);
    }

    static createFromAttribute(element) {
        const componentName = element.getAttribute('data-component');
        if (!componentName) return null;
        
        const props = this.parseProps(element);
        return this.create(componentName, element, props);
    }

    static parseProps(element) {
        const props = {};
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-prop-')) {
                const propName = attr.name.replace('data-prop-', '');
                props[propName] = attr.value;
            }
        });
        return props;
    }

    static autoInitialize() {
        document.querySelectorAll('[data-component]').forEach(element => {
            const component = this.createFromAttribute(element);
            if (component) {
                element.__component = component;
            }
        });
    }
}
//registro de componentes base
ComponentFactory.register('ProductView', ProductView);
ComponentFactory.register('ProductListView', ProductListView);

//iniciar el framework cuando el DOM este listo
document.addEventListener('DOMContentLoaded', () => {
    window.zapaStyleApp = new ZapaStyleApp();
    
    //auto inicializar componentes
    ComponentFactory.autoInitialize();
    
    //exportar clases para uso global
    window.ZapaStyleFramework = {
        BaseModel,
        BaseView,
        BaseController,
        Component,
        Router,
        ProductModel,
        ProductView,
        ProductListView,
        ProductController,
        ComponentFactory,
        App: ZapaStyleApp
    };
});

//automaticamente exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseModel,
        BaseView,
        BaseController,
        Component,
        Router,
        ProductModel,
        ProductView,
        ProductListView,
        ProductController,
        ComponentFactory,
        ZapaStyleApp
    };
}