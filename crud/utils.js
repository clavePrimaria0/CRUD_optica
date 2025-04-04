// Módulo con utilidades comunes para las operaciones CRUD
const CrudUtils = (function() {
    // Configurar manejo de selección de clientes mediante checkboxes
    function setupCheckboxes(onSelectionChange) {
      const selectAllCheckbox = document.getElementById('selectAllCheckbox');
      const clienteCheckboxes = document.querySelectorAll('.cliente-checkbox');
      
      // Array para mantener los IDs de clientes seleccionados
      let clientesSeleccionados = [];
      
      // Evento para "Seleccionar todos"
      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
          const isChecked = this.checked;
          
          clienteCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            
            const clienteId = checkbox.value;
            if (isChecked) {
              // Añadir a seleccionados si no está ya
              if (!clientesSeleccionados.includes(clienteId)) {
                clientesSeleccionados.push(clienteId);
              }
            } else {
              // Remover de seleccionados
              clientesSeleccionados = clientesSeleccionados.filter(id => id !== clienteId);
            }
          });
          
          // Notificar cambio en la selección
          if (onSelectionChange && typeof onSelectionChange === 'function') {
            onSelectionChange(clientesSeleccionados);
          }
        });
      }
      
      // Evento para cada checkbox individual
      clienteCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const clienteId = this.value;
          
          if (this.checked) {
            // Añadir a seleccionados si no está ya
            if (!clientesSeleccionados.includes(clienteId)) {
              clientesSeleccionados.push(clienteId);
            }
          } else {
            // Remover de seleccionados
            clientesSeleccionados = clientesSeleccionados.filter(id => id !== clienteId);
            
            // Desmarcar "seleccionar todos" si alguno no está seleccionado
            if (selectAllCheckbox && selectAllCheckbox.checked) {
              selectAllCheckbox.checked = false;
            }
          }
          
          // Notificar cambio en la selección
          if (onSelectionChange && typeof onSelectionChange === 'function') {
            onSelectionChange(clientesSeleccionados);
          }
        });
      });
      
      // Inicializar con selección vacía
      return clientesSeleccionados;
    }
    
    // Actualiza el estado de habilitación de los botones según la selección
    function updateSelectionButtons(clientesSeleccionados) {
      const btnEditarSeleccionado = document.getElementById('btnEditarSeleccionado');
      const btnEliminarSeleccionado = document.getElementById('btnEliminarSeleccionado');
      
      const haySeleccionados = clientesSeleccionados.length > 0;
      
      if (btnEditarSeleccionado) {
        btnEditarSeleccionado.disabled = !haySeleccionados;
      }
      
      if (btnEliminarSeleccionado) {
        btnEliminarSeleccionado.disabled = !haySeleccionados;
      }
    }
    
    // Configurar manejadores de eventos para los botones de acción en cada fila
    function setupRowActionButtons(onEdit, onDelete) {
      // Botones de editar
      const btnEditar = document.querySelectorAll('.btn-editar');
      btnEditar.forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          if (onEdit && typeof onEdit === 'function') {
            onEdit(id);
          }
        });
      });
      
      // Botones de eliminar
      const btnEliminar = document.querySelectorAll('.btn-eliminar');
      btnEliminar.forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          if (onDelete && typeof onDelete === 'function') {
            onDelete(id);
          }
        });
      });
    }
    
    // Función auxiliar para mostrar notificaciones
    function showToast(message, type = 'info') {
      // Crear un elemento toast de Bootstrap
      const toastId = 'toast-' + Date.now();
      const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${getToastClass(type)} border-0" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body">
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      `;
      
      // Verificar si existe el contenedor de toasts, si no, crearlo
      let toastContainer = document.getElementById('toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
      }
      
      // Añadir el toast al contenedor
      toastContainer.innerHTML += toastHtml;
      
      // Inicializar y mostrar el toast
      const toastElement = document.getElementById(toastId);
      const bsToast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
      });
      
      bsToast.show();
      
      // Auto-eliminar del DOM después de ocultarse
      toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
      });
    }
    
    // Función auxiliar para mapear tipos de toast a clases de Bootstrap
    function getToastClass(type) {
      switch (type.toLowerCase()) {
        case 'success':
          return 'success';
        case 'error':
          return 'danger';
        case 'warning':
          return 'warning';
        case 'info':
        default:
          return 'info';
      }
    }
    
    // Función para formatear fechas
    function formatDate(timestamp, format = 'short') {
      if (!timestamp || !timestamp.toDate) return 'No disponible';
      
      const date = timestamp.toDate();
      
      switch (format) {
        case 'iso':
          return date.toISOString().split('T')[0]; // YYYY-MM-DD
        case 'full':
          return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        case 'short':
        default:
          return date.toLocaleDateString('es-ES');
      }
    }
    
    // Función para validar formulario de cliente
    function validateClienteForm() {
      const nombres = document.getElementById('nombres').value;
      const apellidos = document.getElementById('apellidos').value;
      
      if (!nombres || !apellidos) {
        showToast('Nombres y Apellidos son campos obligatorios', 'warning');
        return false;
      }
      
      return true;
    }
    
    // API pública
    return {
      setupCheckboxes,
      updateSelectionButtons,
      setupRowActionButtons,
      showToast,
      formatDate,
      validateClienteForm
    };
  })();