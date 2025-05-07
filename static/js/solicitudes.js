document.addEventListener("DOMContentLoaded", function () {
    // Activa la barra de búsqueda automáticamente
    document.getElementById("searchInput").focus();

    // Variable para rastrear la fila seleccionada
    let selectedRow = null;

    // Función para resaltar una fila seleccionada
    function highlightRow(row) {
        if (selectedRow) {
            selectedRow.classList.remove("selected-row");
        }
        selectedRow = row;
        selectedRow.classList.add("selected-row");
    }

    // Delegación de eventos para seleccionar una fila al hacer clic
    document.getElementById("mainTableBody").addEventListener("click", function (event) {
        let row = event.target.closest("tr");
        if (row) {
            highlightRow(row);
        }
    });

    // Botón de editar cantidad
    document.querySelector(".action-btn.cant").addEventListener("click", function () {
        if (selectedRow) {
            let quantityCell = selectedRow.cells[3]; // Suponiendo que la cantidad está en la cuarta columna
            let currentValue = quantityCell.textContent;
            let newValue = prompt("Ingrese la nueva cantidad:", currentValue);
            if (newValue !== null) {
                quantityCell.textContent = newValue;
            }
        } else {
            alert("Seleccione una fila para editar.");
        }
    });

    // Botón de eliminar fila
    document.querySelector(".action-btn.danger").addEventListener("click", function () {
        if (selectedRow) {
            if (confirm("¿Está seguro de eliminar esta fila?")) {
                selectedRow.remove();
                selectedRow = null;
            }
        } else {
            alert("Seleccione una fila para eliminar.");
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const guardarBtn = document.getElementById('guardarBtn');
    const groupSelect = document.getElementById('groupSelect');
    const mainTableBody = document.getElementById('mainTableBody');
    const mensajeExito = document.getElementById('mensajeExito');
    const numeroPedidoDisplay = document.createElement('div'); // Nuevo elemento para mostrar el número

    // Configurar el nuevo elemento para el número de pedido
    numeroPedidoDisplay.className = 'alert alert-info mt-3';
    numeroPedidoDisplay.style.display = 'none';
    mensajeExito.parentNode.insertBefore(numeroPedidoDisplay, mensajeExito.nextSibling);

    guardarBtn.addEventListener('click', async function() {
        // Validaciones previas (se mantienen igual)
        const grupoSeleccionado = groupSelect.value;
        if (!grupoSeleccionado) {
            alert('Por favor seleccione un grupo');
            return;
        }

        const filas = mainTableBody.querySelectorAll('tr');
        if (filas.length === 0) {
            alert('No hay items para guardar');
            return;
        }

        // Obtener datos de la tabla (se mantiene igual)
        const items = [];
        filas.forEach(fila => {
            const celdas = fila.querySelectorAll('td');
            items.push({
                codigo: celdas[0].textContent.trim(),
                descripcion: celdas[1].textContent.trim(),
                departamento: celdas[2].textContent.trim(),
                cantidad: parseInt(celdas[3].textContent.trim()) || 1
            });
        });

        try {
            // Enviar datos al servidor (se mantiene igual)
            const pedidoData = {
                grupo: grupoSeleccionado,
                estado: 'Pendiente',
                creado_por: 'UsuarioLogueado',
                items: items
            };

            const response = await fetch('/distribucion/api/pedidos/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify(pedidoData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Error al guardar el pedido');
            }

            const data = await response.json();
            console.log('Pedido guardado:', data);
            
            // Mostrar mensaje de éxito principal
            mensajeExito.style.display = 'block';
            mensajeExito.textContent = 'Solicitud creada correctamente';
            
            // Mostrar número de pedido de forma persistente
            numeroPedidoDisplay.style.display = 'block';
            numeroPedidoDisplay.innerHTML = `
                <strong>Número de pedido:</strong> ${data.numero_pedido}
                <button class="btn btn-sm btn-outline-secondary ml-2" onclick="copiarNumeroPedido('${data.numero_pedido}')">
                    <i class="fas fa-copy"></i> Copiar
                </button>
            `;
            
            // Limpiar la tabla después de 2 segundos (el mensaje permanece)
            setTimeout(() => {
                mainTableBody.innerHTML = '';
                groupSelect.value = '';
                mensajeExito.style.display = 'none';
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('401') || error.message.includes('autenticación')) {
                window.location.href = '/accounts/login/?next=' + encodeURIComponent(window.location.pathname);
            } else {
                alert('Error al guardar el pedido: ' + error.message);
            }
        }
    });

    // Función para copiar el número de pedido
    window.copiarNumeroPedido = function(numero) {
        navigator.clipboard.writeText(numero)
            .then(() => {
                const btn = document.querySelector('.btn-outline-secondary');
                btn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                }, 2000);
            });
    };

    // Función para obtener el token CSRF (se mantiene igual)
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
