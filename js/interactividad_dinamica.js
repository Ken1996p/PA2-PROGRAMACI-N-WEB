//cambio de tonalidad
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
    }

    createThemeToggle() {
        const navbar = document.querySelector('.navbar .container');
        if (!navbar) return;

        const themeToggle = document.createElement('button');
        themeToggle.className = 'btn btn-outline-light btn-sm ms-2';
        themeToggle.id = 'theme-toggle';
        themeToggle.innerHTML = this.getThemeIcon();
        themeToggle.title = 'Cambiar tema';

        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        //insertar después del carrito
        const cartContainer = navbar.querySelector('.dropdown').parentElement;
        cartContainer.appendChild(themeToggle);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.storeTheme(this.currentTheme);
        
        //actualizar icono
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.getThemeIcon();
        }

        ZapaStyle.Notification.showSuccess(`Tema ${this.currentTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (theme === 'dark') {
            this.injectDarkStyles();
        } else {
            this.removeDarkStyles();
        }
    }

    injectDarkStyles() {
        if (document.getElementById('dark-theme-styles')) return;

        const darkStyles = `
            <style id="dark-theme-styles">
                [data-theme="dark"] {
                    --bs-body-bg: #121212;
                    --bs-body-color: #ffffff;
                    --bs-card-bg: #1e1e1e;
                    --bs-border-color: #333;
                }
                
                [data-theme="dark"] body {
                    background-color: #121212;
                    color: #ffffff;
                }
                
                [data-theme="dark"] .card {
                    background-color: #1e1e1e;
                    border-color: #333;
                    color: #ffffff;
                }
                
                [data-theme="dark"] .navbar-dark {
                    background-color: #000 !important;
                }
                
                [data-theme="dark"] .dropdown-menu {
                    background-color: #1e1e1e;
                    border-color: #333;
                    color: #ffffff;
                }
                
                [data-theme="dark"] .dropdown-item {
                    color: #ffffff;
                }
                
                [data-theme="dark"] .dropdown-item:hover {
                    background-color: #333;
                }
                
                [data-theme="dark"] .btn-outline-secondary {
                    border-color: #666;
                    color: #ffffff;
                }
                
                [data-theme="dark"] .btn-outline-secondary:hover {
                    background-color: #666;
                    border-color: #666;
                }
                
                [data-theme="dark"] .form-control {
                    background-color: #1e1e1e;
                    border-color: #333;
                    color: #ffffff;
                }
                
                [data-theme="dark"] .form-control:focus {
                    background-color: #1e1e1e;
                    border-color: #555;
                    color: #ffffff;
                    box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', darkStyles);
    }

    removeDarkStyles() {
        const darkStyles = document.getElementById('dark-theme-styles');
        if (darkStyles) {
            darkStyles.remove();
        }
    }

    getThemeIcon() {
        return this.currentTheme === 'light' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }

    getStoredTheme() {
        return ZapaStyle.Storage.load('theme');
    }

    storeTheme(theme) {
        ZapaStyle.Storage.save('theme', theme);
    }
}
//gestor favoritos
class FavoritesManager {
    constructor() {
        this.favorites = ZapaStyle.Storage.load('favorites', []);
        this.init();
    }

    init() {
        this.createFavoritesButton();
        this.setupFavoriteButtons();
    }

    createFavoritesButton() {
        const navbar = document.querySelector('.navbar-nav');
        if (!navbar) return;

        const favoritesItem = document.createElement('li');
        favoritesItem.className = 'nav-item dropdown';
        favoritesItem.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="favoritesDropdown" role="button" 
               data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-heart"></i> Favoritos 
                <span class="badge bg-danger" id="favorites-count">${this.favorites.length}</span>
            </a>
            <ul class="dropdown-menu" id="favorites-menu">
                ${this.renderFavoritesList()}
            </ul>
        `;

        navbar.appendChild(favoritesItem);
    }

    setupFavoriteButtons() {
        //agregar botones de favoritos a productos existentes
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-favorite') || e.target.closest('.btn-favorite')) {
                e.preventDefault();
                const button = e.target.matches('.btn-favorite') ? e.target : e.target.closest('.btn-favorite');
                const productId = parseInt(button.dataset.productId);
                this.toggleFavorite(productId);
            }
        });

        //agregar botones a productos cuando se rendericen
        this.addFavoriteButtonsToProducts();
    }

    addFavoriteButtonsToProducts() {
        const products = document.querySelectorAll('.producto');
        products.forEach(product => {
            if (product.querySelector('.btn-favorite')) return; // Ya tiene botón

            const addToCartBtn = product.querySelector('.add-to-cart');
            if (!addToCartBtn) return;

            const productId = parseInt(addToCartBtn.dataset.productId);
            const isFavorite = this.favorites.includes(productId);

            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = `btn btn-outline-danger btn-sm btn-favorite ms-2 ${isFavorite ? 'active' : ''}`;
            favoriteBtn.dataset.productId = productId;
            favoriteBtn.innerHTML = `<i class="fas fa-heart"></i>`;
            favoriteBtn.title = isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos';

            addToCartBtn.parentElement.appendChild(favoriteBtn);
        });
    }

    toggleFavorite(productId) {
        const product = ZapaStyle.Product.getById(productId);
        if (!product) return;

        const index = this.favorites.indexOf(productId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            ZapaStyle.Notification.showSuccess(`${product.name} eliminado de favoritos`);
        } else {
            this.favorites.push(productId);
            ZapaStyle.Notification.showSuccess(`${product.name} agregado a favoritos`);
        }

        this.saveFavorites();
        this.updateUI();
    }

    saveFavorites() {
        ZapaStyle.Storage.save('favorites', this.favorites);
    }

    updateUI() {
        //actualizar contador
        const counter = document.getElementById('favorites-count');
        if (counter) {
            counter.textContent = this.favorites.length;
        }

        //actualizar botones
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            const isFavorite = this.favorites.includes(productId);
            
            btn.classList.toggle('active', isFavorite);
            btn.title = isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos';
        });

        //actualizar lista desplegable
        const menu = document.getElementById('favorites-menu');
        if (menu) {
            menu.innerHTML = this.renderFavoritesList();
        }
    }

    renderFavoritesList() {
        if (this.favorites.length === 0) {
            return '<li><span class="dropdown-item-text">No hay favoritos</span></li>';
        }

        return this.favorites.map(productId => {
            const product = ZapaStyle.Product.getById(productId);
            if (!product) return '';

            return `
                <li>
                    <div class="dropdown-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${product.name}</strong><br>
                            <small class="text-muted">S/ ${product.price}</small>
                        </div>
                        <button class="btn btn-sm btn-primary add-to-cart" data-product-id="${productId}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </li>
            `;
        }).join('');
    }
}
//geestor de comparación de productos
class CompareManager {
    constructor() {
        this.compareList = [];
        this.maxItems = 3;
        this.init();
    }

    init() {
        this.createCompareInterface();
        this.setupCompareButtons();
    }

    createCompareInterface() {
        //boton flotante de comparacion
        const compareButton = document.createElement('div');
        compareButton.className = 'compare-floating-btn';
        compareButton.innerHTML = `
            <button class="btn btn-warning btn-lg rounded-circle shadow" 
                    id="compare-toggle" style="display: none;">
                <i class="fas fa-balance-scale"></i>
                <span class="badge bg-danger" id="compare-count">0</span>
            </button>
        `;

        //estilos para el boton flotante
        const styles = `
            <style>
                .compare-floating-btn {
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    z-index: 1040;
                }
                
                .compare-floating-btn button {
                    position: relative;
                }
                
                .compare-floating-btn .badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                }
                
                .compare-modal .product-compare-card {
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
            </style>
        `;

        if (!document.getElementById('compare-styles')) {
            document.head.insertAdjacentHTML('beforeend', styles.replace('<style>', '<style id="compare-styles">'));
        }

        document.body.appendChild(compareButton);

        //eventos
        document.getElementById('compare-toggle').addEventListener('click', () => {
            this.showCompareModal();
        });
    }

    setupCompareButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-compare') || e.target.closest('.btn-compare')) {
                e.preventDefault();
                const button = e.target.matches('.btn-compare') ? e.target : e.target.closest('.btn-compare');
                const productId = parseInt(button.dataset.productId);
                this.toggleCompare(productId);
            }
        });

        //agregar los botones en los productos
        this.addCompareButtonsToProducts();
    }

    addCompareButtonsToProducts() {
        const products = document.querySelectorAll('.producto');
        products.forEach(product => {
            if (product.querySelector('.btn-compare')) return;

            const addToCartBtn = product.querySelector('.add-to-cart');
            if (!addToCartBtn) return;

            const productId = parseInt(addToCartBtn.dataset.productId);
            const isInCompare = this.compareList.includes(productId);

            const compareBtn = document.createElement('button');
            compareBtn.className = `btn btn-outline-info btn-sm btn-compare ms-1 ${isInCompare ? 'active' : ''}`;
            compareBtn.dataset.productId = productId;
            compareBtn.innerHTML = `<i class="fas fa-balance-scale"></i>`;
            compareBtn.title = 'Comparar producto';

            addToCartBtn.parentElement.appendChild(compareBtn);
        });
    }

    toggleCompare(productId) {
        const product = ZapaStyle.Product.getById(productId);
        if (!product) return;

        const index = this.compareList.indexOf(productId);
        
        if (index > -1) {
            this.compareList.splice(index, 1);
            ZapaStyle.Notification.showSuccess(`${product.name} eliminado de comparación`);
        } else {
            if (this.compareList.length >= this.maxItems) {
                ZapaStyle.Notification.showWarning(`Máximo ${this.maxItems} productos para comparar`);
                return;
            }
            this.compareList.push(productId);
            ZapaStyle.Notification.showSuccess(`${product.name} agregado para comparar`);
        }

        this.updateUI();
    }

    updateUI() {
        //actualizar contador y visibilidad del boton flotante
        const toggleBtn = document.getElementById('compare-toggle');
        const counter = document.getElementById('compare-count');
        
        if (toggleBtn && counter) {
            counter.textContent = this.compareList.length;
            toggleBtn.style.display = this.compareList.length > 0 ? 'block' : 'none';
        }

        //actualizar botones de productos
        document.querySelectorAll('.btn-compare').forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            const isInCompare = this.compareList.includes(productId);
            btn.classList.toggle('active', isInCompare);
        });
    }

    showCompareModal() {
        if (this.compareList.length === 0) return;

        const products = this.compareList.map(id => ZapaStyle.Product.getById(id)).filter(Boolean);
        
        const modalHTML = `
            <div class="modal fade" id="compareModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Comparar Productos</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                ${products.map(product => this.createCompareCard(product)).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" onclick="compareManager.clearCompare()">
                                Limpiar comparación
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        //remover modal que existe
        const existingModal = document.getElementById('compareModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById('compareModal'));
        modal.show();
    }

    createCompareCard(product) {
        return `
            <div class="col-md-4">
                <div class="product-compare-card">
                    <img src="${product.image}" class="img-fluid mb-3" alt="${product.name}">
                    <h6>${product.name}</h6>
                    <p class="text-primary fw-bold">S/ ${product.price}</p>
                    <p><small class="text-muted">Categoría: ${product.category}</small></p>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                            <i class="fas fa-cart-plus"></i> Agregar al carrito
                        </button>
                        <button class="btn btn-outline-danger btn-sm" 
                                onclick="compareManager.removeFromCompare(${product.id})">
                            Quitar de comparación
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    removeFromCompare(productId) {
        const index = this.compareList.indexOf(productId);
        if (index > -1) {
            this.compareList.splice(index, 1);
            this.updateUI();
            
            //si estamos en el modal / actualizar
            const modal = document.getElementById('compareModal');
            if (modal && modal.classList.contains('show')) {
                this.showCompareModal();
            }
        }
    }

    clearCompare() {
        this.compareList = [];
        this.updateUI();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('compareModal'));
        if (modal) {
            modal.hide();
        }
        
        ZapaStyle.Notification.showSuccess('Comparación limpiada');
    }
}
//gestor de estadisticas y analytics
class AnalyticsManager {
    constructor() {
        this.pageViews = ZapaStyle.Storage.load('pageViews', {});
        this.productViews = ZapaStyle.Storage.load('productViews', {});
        this.cartEvents = ZapaStyle.Storage.load('cartEvents', []);
        
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventTracking();
    }

    trackPageView() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (!this.pageViews[currentPage]) {
            this.pageViews[currentPage] = 0;
        }
        this.pageViews[currentPage]++;
        
        ZapaStyle.Storage.save('pageViews', this.pageViews);
    }

    trackProductView(productId) {
        if (!this.productViews[productId]) {
            this.productViews[productId] = 0;
        }
        this.productViews[productId]++;
        
        ZapaStyle.Storage.save('productViews', this.productViews);
    }

    trackCartEvent(eventType, productId, data = {}) {
        const event = {
            type: eventType,
            productId: productId,
            timestamp: new Date().toISOString(),
            data: data
        };
        
        this.cartEvents.push(event);
        
        //tener los ultimos 100 eventos
        if (this.cartEvents.length > 100) {
            this.cartEvents = this.cartEvents.slice(-100);
        }
        
        ZapaStyle.Storage.save('cartEvents', this.cartEvents);
    }

    setupEventTracking() {
        //tracking de clicks en productos
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart') || e.target.closest('.add-to-cart')) {
                const button = e.target.matches('.add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const productId = parseInt(button.dataset.productId);
                this.trackCartEvent('add_to_cart', productId);
            }
        });

        //tracking de compras
        ZapaStyle.Event.on('purchase:completed', (orderData) => {
            orderData.items.forEach(item => {
                this.trackCartEvent('purchase', item.productId, {
                    quantity: item.quantity,
                    price: item.product.price,
                    orderNumber: orderData.orderNumber
                });
            });
        });
    }

    getPopularProducts() {
        const sorted = Object.entries(this.productViews)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
            
        return sorted.map(([productId, views]) => ({
            product: ZapaStyle.Product.getById(parseInt(productId)),
            views: views
        })).filter(item => item.product);
    }

    getStats() {
        return {
            pageViews: this.pageViews,
            productViews: this.productViews,
            cartEvents: this.cartEvents,
            totalPageViews: Object.values(this.pageViews).reduce((a, b) => a + b, 0),
            totalProductViews: Object.values(this.productViews).reduce((a, b) => a + b, 0),
            popularProducts: this.getPopularProducts()
        };
    }
}

//inicializar caracteristicas interactivas
document.addEventListener('DOMContentLoaded', () => {
    //gestores
    window.themeManager = new ThemeManager();
    window.favoritesManager = new FavoritesManager();
    window.compareManager = new CompareManager();
    window.analyticsManager = new AnalyticsManager();
    
    //actualizar botones al renderizar los productos
    ZapaStyle.Event.on('products:rendered', () => {
        window.favoritesManager.addFavoriteButtonsToProducts();
        window.compareManager.addCompareButtonsToProducts();
    });
    
    console.log('✨ Interactive features initialized');
});

//exportar el uso global
window.ZapaStyleFeatures = {
    Theme: ThemeManager,
    Favorites: FavoritesManager,
    Compare: CompareManager,
    Analytics: AnalyticsManager
};