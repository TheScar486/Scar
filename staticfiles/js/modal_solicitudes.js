document.addEventListener('DOMContentLoaded', function() {
    // Variables de estado
    const state = {
        currentFilter: 'all',
        filterDropdownVisible: false,
        selectedProducts: [],
        searchQuery: ''
    };

    // Cache de elementos del DOM
    const elements = {
        modal: document.getElementById('searchModal'),
        searchInput: document.getElementById('searchInput'),
        modalSearchInput: document.getElementById('modalSearchInput'),
        closeButton: document.getElementsByClassName('close')[0],
        tableBody: document.getElementById('tableBody'),
        mainTableBody: document.getElementById('mainTableBody'),
        filterDropdown: document.getElementById('filterDropdown'),
        filterButton: document.getElementById('btnFilter')
    };

    // Funciones de utilidad
    const utils = {
        parsePrice: (price) => {
            if (typeof price === 'string') {
                return parseFloat(price.replace(',', '.')) || 0;
            }
            return Number(price) || 0;
        },
        debounce: (func, delay) => {
            let timer;
            return function() {
                const context = this;
                const args = arguments;
                clearTimeout(timer);
                timer = setTimeout(() => func.apply(context, args), delay);
            };
        },
        handleSingleResult: (product) => {
            const quantity = prompt(
                `Ingrese cantidad para ${product.Descripcion}\nStock disponible: ${product.Cantidad_Stock || 'N/A'}`,
                "1"
            );
            
            if (quantity === null) return false;
            
            const parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                alert("Por favor ingrese un número válido mayor a 0");
                return false;
            }
            
            if (product.Cantidad_Stock && parsedQuantity > product.Cantidad_Stock) {
                alert(`No hay suficiente stock. Disponible: ${product.Cantidad_Stock}`);
                return false;
            }
            
            products.addToMainTable(product, parsedQuantity);
            return true;
        }
    };

    // Funciones del modal
    const modal = {
        open: (searchText = '') => {
            elements.modal.style.display = 'block';
            elements.modalSearchInput.value = searchText;
            state.searchQuery = searchText;
            setTimeout(() => elements.modalSearchInput.focus(), 100);
            
            if (searchText) {
                products.load(searchText);
            }
        },
        close: () => {
            elements.modal.style.display = 'none';
        },
        handleDoubleClick: () => {
            modal.open();
        },
        handleMainSearchEnter: (e) => {
            if (e.key === 'Enter') {
                const searchText = e.target.value.trim();
                if (searchText) {
                    products.load(searchText, true).then(data => {
                        if (data && data.length === 1) {
                            if (utils.handleSingleResult(data[0])) {
                                modal.close();
                                e.target.value = '';
                            }
                        } else {
                            modal.open(searchText);
                        }
                    });
                }
            }
        }
    };

    // Funciones de productos
    const products = {
        load: async function(query = '', fromMainSearch = false) {
            try {
                state.searchQuery = query;
                
                if (!fromMainSearch) {
                    elements.tableBody.innerHTML = `
                        <tr>
                            <td colspan="5" style="padding: 20px; text-align: center; color: #6c757d;">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                                Buscando productos...
                            </td>
                        </tr>
                    `;
                }
                
                const response = await fetch(`/distribucion/buscar-productos/?q=${encodeURIComponent(query)}&filter=${state.currentFilter}`);
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (fromMainSearch) {
                    return data;
                }
                
                this.display(data);
                
            } catch (error) {
                console.error("Error al cargar productos:", error);
                elements.tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="color: #dc3545; padding: 20px; text-align: center; font-weight: bold;">
                            Error: ${error.message}
                        </td>
                    </tr>
                `;
                return [];
            }
        },
          
            display: function(data) {
                elements.tableBody.innerHTML = '';
                
                if (!data || data.length === 0) {
                    elements.tableBody.innerHTML = `
                        <tr class="no-results">
                            <td colspan="5">No se encontraron productos</td>
                        </tr>
                    `;
                    return;
                }
                
                data.forEach((item) => {
                    const row = document.createElement('tr');
                    const price = utils.parsePrice(item.Precio_Base);
                    
                    row.innerHTML = `
                        <td>${item.Codigo || 'N/A'}</td>
                        <td>${item.Descripcion || 'N/A'}</td>
                        <td>${item.Proveedor || 'N/A'}</td>
                        <td class="text-center">${item.Cantidad_Stock || 0}</td>
                        <td class="text-right">Q ${price.toFixed(2)}</td>
                    `;
                    
                    row.style.cursor = 'pointer';
                    
                    // Eliminamos el evento de click simple
                    // Y lo reemplazamos con doble click
                    row.addEventListener('dblclick', function() {
                        document.querySelectorAll('#tableBody tr').forEach(r => {
                            r.style.backgroundColor = '';
                        });
                        this.style.backgroundColor = '#e6f7ff';
                        
                        // Llamamos directamente a la función para agregar el producto
                        // con cantidad por defecto 1 (puedes cambiarlo)
                        const quantity = prompt(
                            `Ingrese cantidad para ${item.Descripcion}\nStock disponible: ${item.Cantidad_Stock || 'N/A'}`,
                            "1"
                        );
                        
                        if (quantity === null) return;
                        
                        const parsedQuantity = parseInt(quantity);
                        if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                            alert("Por favor ingrese un número válido mayor a 0");
                            return;
                        }
                        
                        if (item.Cantidad_Stock && parsedQuantity > item.Cantidad_Stock) {
                            alert(`No hay suficiente stock. Disponible: ${item.Cantidad_Stock}`);
                            return;
                        }
                        
                        products.addToMainTable(item, parsedQuantity);
                    });
                    
                    // Opcional: mantener el resaltado al hacer click simple
                    row.addEventListener('click', function() {
                        document.querySelectorAll('#tableBody tr').forEach(r => {
                            r.style.backgroundColor = '';
                        });
                        this.style.backgroundColor = '#e6f7ff';
                    });
                    
                    elements.tableBody.appendChild(row);
                });
            },
        
            // ... (el resto del código permanece igual)
    
        addToMainTable: function(product, quantity = 1) {
            const existingProduct = state.selectedProducts.find(p => p.ID_Articulo === product.ID_Articulo);
            if (existingProduct) {
                const quantityElement = document.querySelector(`span[data-id="${product.ID_Articulo}"]`);
                const newQuantity = parseInt(quantityElement.textContent) + parseInt(quantity);
                quantityElement.textContent = newQuantity;
                existingProduct.Cantidad = newQuantity;
                return;
            }
            
            const row = document.createElement('tr');
            row.setAttribute('data-id', product.ID_Articulo);
            
            row.innerHTML = `
                <td>${product.Codigo || 'N/A'}</td>
                <td>${product.Descripcion || 'N/A'}</td>
                <td>${product.Proveedor || 'N/A'}</td>
                <td>${quantity}</td>
            `;
            
            elements.mainTableBody.appendChild(row);
            state.selectedProducts.push({
                ...product,
                Cantidad: parseInt(quantity)
            });
            
            // Ajustar altura después de agregar fila
            adjustTableHeight();
        }
    };

    // Reemplaza la función adjustTableHeight con esta versión mejorada
    function adjustTableHeight() {
        const header = document.querySelector('.distribucion-header');
        const toolsBar = document.querySelector('.tools-bar');
        const contentSection = document.querySelector('.content-section');
        
        if (!header || !toolsBar || !contentSection) return;
        
        const headerHeight = header.offsetHeight;
        const toolsHeight = toolsBar.offsetHeight;
        const contentPadding = 20; // Espacio adicional
        
        // Calcular altura disponible considerando padding y márgenes
        const availableHeight = window.innerHeight - headerHeight - toolsHeight - contentPadding;
        
        // Aplicar altura al contenedor de contenido
        contentSection.style.height = `${availableHeight}px`;
        
        // Calcular altura máxima para el cuerpo de la tabla
        const tableHeader = document.querySelector('.data-table thead');
        const tableHeaderHeight = tableHeader ? tableHeader.offsetHeight : 0;
        const maxBodyHeight = availableHeight - tableHeaderHeight - 10; // 10px de margen
        
        // Aplicar altura máxima al cuerpo de la tabla
        const tableBody = document.querySelector('.data-table tbody');
        if (tableBody) {
            tableBody.style.maxHeight = `${maxBodyHeight}px`;
        }
    }

// Modificar el event listener para que se ejecute después del renderizado
window.addEventListener('load', function() {
    // Pequeño delay para asegurar que todo esté renderizado
    setTimeout(adjustTableHeight, 50);
});

window.addEventListener('resize', utils.debounce(function() {
    adjustTableHeight();
}, 100));

    // Funciones de filtro
    const filter = {
        toggleDropdown: (e) => {
            e.stopPropagation();
            state.filterDropdownVisible = !state.filterDropdownVisible;
            elements.filterDropdown.style.display = state.filterDropdownVisible ? 'block' : 'none';
        },
        
        setActive: (filterType) => {
            state.currentFilter = filterType;
            products.load(elements.modalSearchInput.value);
            elements.filterDropdown.style.display = 'none';
            state.filterDropdownVisible = false;
        }
    };
    
    // Llamar al cargar y al cambiar tamaño
    window.addEventListener('load', adjustTableHeight);
    window.addEventListener('resize', adjustTableHeight);

    // Event Listeners
    function setupEventListeners() {
        // Modal events
        elements.searchInput.addEventListener('dblclick', modal.handleDoubleClick);
        elements.searchInput.addEventListener('keydown', modal.handleMainSearchEnter);
        
        document.addEventListener('keydown', (e) => e.key === 'Escape' && elements.modal.style.display === 'block' && modal.close());
        elements.closeButton.addEventListener('click', modal.close);
        window.addEventListener('click', (e) => e.target === elements.modal && modal.close());
        
        // Filter events
        elements.filterButton.addEventListener('click', filter.toggleDropdown);
        document.querySelectorAll('input[name="filterType"]').forEach(radio => {
            radio.addEventListener('change', (e) => filter.setActive(e.target.value));
        });
        document.addEventListener('click', () => {
            if (state.filterDropdownVisible) {
                elements.filterDropdown.style.display = 'none';
                state.filterDropdownVisible = false;
            }
        });
        
        // Search events
        elements.modalSearchInput.addEventListener('input', utils.debounce(() => {
            products.load(elements.modalSearchInput.value);
        }, 300));
        
        // Global function for modal selection
        window.seleccionarProductoModal = function(product) {
            const quantity = prompt(
                `Ingrese cantidad para ${product.Descripcion}\nStock disponible: ${product.Cantidad_Stock || 'N/A'}`,
                "1"
            );
            
            if (quantity === null) return;
            
            const parsedQuantity = parseInt(quantity);
            if (isNaN(parsedQuantity)) {
                alert("Por favor ingrese un número válido");
                return;
            }
            
            if (parsedQuantity <= 0) {
                alert("La cantidad debe ser mayor a cero");
                return;
            }
            
            if (product.Cantidad_Stock && parsedQuantity > product.Cantidad_Stock) {
                alert(`No hay suficiente stock. Disponible: ${product.Cantidad_Stock}`);
                return;
            }
            
            products.addToMainTable(product, parsedQuantity);
        };
    }

    // Inicialización
    function init() {
        setupEventListeners();
        products.load();
    }

    init();
});