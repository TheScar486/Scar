document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let allPedidos = [];
    const fechaBtn = document.querySelector('.ped-fecha-btn');
    const filtroBtn = document.querySelector('.ped-filtro-btn');
    const searchInput = document.getElementById('ped-search-input');
    const tableBody = document.getElementById('ped-table-body');
    
    // Filtros activos
    let activeFilters = {
        fecha: null,
        estado: null,
        creado_por: null,
        grupo: null
    };

    // Formatear fecha para mostrar
    function formatFecha(fechaStr) {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Cargar pedidos desde el servidor
    async function cargarPedidos() {
        try {
            const response = await fetch('/distribucion/api/pedidos/listar/');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            allPedidos = await response.json();
            console.log('Datos recibidos:', allPedidos); // ← Corregido a allPedidos
            aplicarFiltros();
            
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            mostrarErrorEnTabla(error);
        }
    }
    
    function mostrarErrorEnTabla(error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="error-message">
                    Error al cargar pedidos: ${error.message}<br>
                    Intente recargar la página
                </td>
            </tr>
        `;
    }

    // Aplicar todos los filtros activos
    function aplicarFiltros() {
        let filtered = [...allPedidos];
        
        // Filtro de búsqueda general
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(pedido => 
                Object.values(pedido).some(
                    val => val && val.toString().toLowerCase().includes(searchTerm)
                )
            );
        }
        
        // Filtro por fecha
        if (activeFilters.fecha) {
            const filterDate = new Date(activeFilters.fecha).setHours(0, 0, 0, 0);
            filtered = filtered.filter(pedido => {
                const pedidoDate = new Date(pedido.fecha_creacion).setHours(0, 0, 0, 0);
                return pedidoDate === filterDate;
            });
        }
        
        // Filtros específicos
        Object.keys(activeFilters).forEach(key => {
            if (key !== 'fecha' && activeFilters[key]) {
                filtered = filtered.filter(pedido => 
                    pedido[key] && pedido[key].toString().toLowerCase() === activeFilters[key].toLowerCase()
                );
            }
        });
        
        mostrarPedidos(filtered);
    }

    // Mostrar pedidos en la tabla
    function mostrarPedidos(pedidos) {
        if (pedidos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No se encontraron pedidos</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        
        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            
            // SOLUCIÓN: Verifica y asigna el ID correctamente
            const pedidoId = pedido.id || extraerIdDeNumeroPedido(pedido.numero_pedido);
            if (!pedidoId) {
                console.error('Pedido sin ID válido:', pedido);
                return; // Omitir este pedido o asignar un valor por defecto
            }
            
            row.setAttribute('data-pedido-id', pedidoId.toString());
            
            // Determinar clase CSS según estado
            let estadoClass = '';
            switch(pedido.estado) {
                case 'Aprobado':
                case 'Completado':
                    estadoClass = 'estado-aprobado';
                    break;
                case 'Rechazado':
                case 'Cancelado':
                    estadoClass = 'estado-rechazado';
                    break;
                case 'En revisión':
                    estadoClass = 'estado-revision';
                    break;
                case 'Enviado':
                    estadoClass = 'estado-enviado';
                    break;
                default:
                    estadoClass = 'estado-pendiente';
            }
            
            row.innerHTML = `
                <td>${pedido.numero_pedido || 'N/A'}</td>
                <td>${pedido.creado_por || 'N/A'}</td>
                <td>${pedido.grupo || 'N/A'}</td>
                <td class="${estadoClass}">${pedido.estado || 'N/A'}</td>
                <td>${formatFecha(pedido.fecha_creacion)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    
        // Función para extraer ID del número de pedido (ej: "PE-001" → 1)
        function extraerIdDeNumeroPedido(numeroPedido) {
            if (!numeroPedido) return null;
            const match = numeroPedido.match(/PE-(\d+)/);
            return match ? parseInt(match[1], 10) : null;
        }
    }

    // Mostrar modal de filtro por fecha
    function mostrarFechaModal() {
        const fechaInput = document.createElement('input');
        fechaInput.type = 'date';
        fechaInput.className = 'ped-filter-date';
        
        // Si ya hay un filtro de fecha, establecerlo
        if (activeFilters.fecha) {
            fechaInput.value = activeFilters.fecha;
        }
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'ped-filter-modal';
        modal.innerHTML = `
            <div class="ped-filter-content">
                <h3>Filtrar por fecha</h3>
                <div class="ped-filter-inputs">
                    ${fechaInput.outerHTML}
                </div>
                <div class="ped-filter-actions">
                    <button class="ped-filter-clear">Limpiar</button>
                    <button class="ped-filter-apply">Aplicar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.ped-filter-apply').addEventListener('click', () => {
            const selectedDate = modal.querySelector('.ped-filter-date').value;
            if (selectedDate) {
                activeFilters.fecha = selectedDate;
                aplicarFiltros();
            }
            modal.remove();
        });
        
        modal.querySelector('.ped-filter-clear').addEventListener('click', () => {
            activeFilters.fecha = null;
            aplicarFiltros();
            modal.remove();
        });
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Mostrar modal de filtros avanzados
    function mostrarFiltrosModal() {
        // Obtener valores únicos para los filtros
        const estados = [...new Set(allPedidos.map(p => p.estado))].filter(Boolean);
        const creadores = [...new Set(allPedidos.map(p => p.creado_por))].filter(Boolean);
        const grupos = [...new Set(allPedidos.map(p => p.grupo))].filter(Boolean);
        
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'ped-filter-modal';
        modal.innerHTML = `
            <div class="ped-filter-content">
                <h3>Filtros avanzados</h3>
                <div class="ped-filter-inputs">
                    <div class="ped-filter-group">
                        <label>Estado:</label>
                        <select class="ped-filter-select" data-filter="estado">
                            <option value="">Todos</option>
                            ${estados.map(estado => 
                                `<option value="${estado}" ${activeFilters.estado === estado ? 'selected' : ''}>
                                    ${estado}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="ped-filter-group">
                        <label>Creado por:</label>
                        <select class="ped-filter-select" data-filter="creado_por">
                            <option value="">Todos</option>
                            ${creadores.map(creador => 
                                `<option value="${creador}" ${activeFilters.creado_por === creador ? 'selected' : ''}>
                                    ${creador}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="ped-filter-group">
                        <label>Grupo:</label>
                        <select class="ped-filter-select" data-filter="grupo">
                            <option value="">Todos</option>
                            ${grupos.map(grupo => 
                                `<option value="${grupo}" ${activeFilters.grupo === grupo ? 'selected' : ''}>
                                    ${grupo}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="ped-filter-actions">
                    <button class="ped-filter-clear">Limpiar todo</button>
                    <button class="ped-filter-apply">Aplicar filtros</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.ped-filter-apply').addEventListener('click', () => {
            const selects = modal.querySelectorAll('.ped-filter-select');
            selects.forEach(select => {
                const filterType = select.dataset.filter;
                activeFilters[filterType] = select.value || null;
            });
            aplicarFiltros();
            modal.remove();
        });
        
        modal.querySelector('.ped-filter-clear').addEventListener('click', () => {
            Object.keys(activeFilters).forEach(key => {
                activeFilters[key] = null;
            });
            aplicarFiltros();
            modal.remove();
        });
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Event Listeners
    searchInput.addEventListener('input', () => aplicarFiltros());
    fechaBtn.addEventListener('click', mostrarFechaModal);
    filtroBtn.addEventListener('click', mostrarFiltrosModal);

    // Inicializar
    cargarPedidos();
});


document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('ped-table-body');
    
    if (!tableBody) {
        console.error('Tabla no encontrada');
        return;
    }

    // Un solo listener de doble clic
    tableBody.addEventListener('dblclick', function(e) {
        const row = e.target.closest('tr');
        if (!row) {
            console.warn('Clic fuera de fila');
            return;
        }

        // Obtén el ID de 3 formas diferentes (a prueba de errores)
        const pedidoId = row.dataset.pedidoId || 
                        row.getAttribute('data-pedido-id') || 
                        obtenerIdDesdeTexto(row.cells[0]?.textContent);
        
        if (!pedidoId || pedidoId === 'undefined') {
            console.error('ID no válido. Fila completa:', row.outerHTML);
            alert('No se puede generar PDF: ID de pedido no encontrado');
            return;
        }

        console.log('Generando PDF para pedido:', pedidoId);
        window.open(`/distribucion/generar-pdf-pedido/${pedidoId}/`, '_blank');
    });

    // Función para extraer ID del texto (ej: "PE-001" → "1")
    function obtenerIdDesdeTexto(texto) {
        if (!texto) return null;
        const match = texto.trim().match(/PE-(\d+)/);
        return match ? match[1] : null;
    }
});