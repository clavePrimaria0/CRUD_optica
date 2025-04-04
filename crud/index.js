// Módulo principal que integra todas las operaciones CRUD
const CrudManager = (function() {
    // Variables privadas
    let db = null;
    let clientesCollection = null;
    let clientesSeleccionados = [];
    let clienteModal = null;
    let eliminarModal = null;
    
    // Inicialización del módulo
    function init(firebaseDb) {
      // Guardar referencia a la base de datos
      db = firebaseDb;
      
      // Inicializar modales cuando Bootstrap esté listo
      document.addEventListener('bootstrap-ready', initModals);
      
      // Cargar datos y configurar eventos
      setupCrud();
    }
    
    // Inicializar modales de Bootstrap
    function initModals() {
      const clienteModalEl = document.getElementById('clienteModal');
      const eliminarModalEl = document.getElementById('eliminarModal');
      
      if (clienteModalEl) {
        clienteModal = new bootstrap.Modal(clienteModalEl);
      }
      
      if (eliminarModalEl) {
        eliminarModal = new bootstrap.Modal(eliminarModalEl);
      }
    }
    
    // Configurar todos los componentes CRUD
    async function setupCrud() {
      try {
        // Cargar datos y obtener referencia a la colección
        clientesCollection = await ClienteRead.loadClientesData(db, setupEventHandlers);
        
        // Configurar botones principales
        setupMainButtons();
      } catch (error) {
        console.error('Error al configurar CRUD:', error);
        CrudUtils.showToast('Error al inicializar la aplicación', 'error');
      }
    }
    
    // Configurar manejadores de eventos después de cargar datos
    function setupEventHandlers() {
      // Configurar checkboxes y obtener array de seleccionados
      clientesSeleccionados = CrudUtils.setupCheckboxes(function(seleccionados) {
        clientesSeleccionados = seleccionados;
        CrudUtils.updateSelectionButtons(clientesSeleccionados);
      });
      
      // Configurar botones de acción en cada fila
      CrudUtils.setupRowActionButtons(
        // Handler para editar
        function(id) {
          ClienteUpdate.openEditModal(db, id, clienteModal);
        },
        // Handler para eliminar
        function(id) {
          ClienteDelete.openDeleteModal(id, eliminarModal);
        }
      );
      
      // Actualizar estado inicial de los botones
      CrudUtils.updateSelectionButtons(clientesSeleccionados);
    }
    
    // Configurar botones principales
    function setupMainButtons() {
      // Botón de crear cliente
      const btnCrearCliente = document.getElementById('btnCrearCliente');
      if (btnCrearCliente) {
        btnCrearCliente.addEventListener('click', function() {
          ClienteCreate.openCreateModal(clienteModal);
        });
      }
      
      // Botón de editar seleccionado
      const btnEditarSeleccionado = document.getElementById('btnEditarSeleccionado');
      if (btnEditarSeleccionado) {
        btnEditarSeleccionado.addEventListener('click', function() {
          ClienteUpdate.handleMultiEdit(clientesSeleccionados, function(id) {
            ClienteUpdate.openEditModal(db, id, clienteModal);
          });
        });
      }
      
      // Botón de eliminar seleccionado
      const btnEliminarSeleccionado = document.getElementById('btnEliminarSeleccionado');
      if (btnEliminarSeleccionado) {
        btnEliminarSeleccionado.addEventListener('click', function() {
          ClienteDelete.openMultiDeleteModal(clientesSeleccionados, eliminarModal);
        });
      }
      
      // Botón de filtro de fechas
      const btnFiltroFechas = document.getElementById('btnFiltroFechas');
      if (btnFiltroFechas) {
        btnFiltroFechas.addEventListener('click', function() {
          CrudUtils.showToast('Funcionalidad de filtro por fechas en desarrollo', 'info');
        });
      }
      
      // Campo de búsqueda
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.addEventListener('input', function() {
          const count = ClienteRead.searchClientes(this.value);
          if (this.value.trim() !== '' && count === 0) {
            CrudUtils.showToast('No se encontraron resultados', 'info');
          }
        });
      }
      
      // Botón guardar cliente
      const btnGuardarCliente = document.getElementById('btnGuardarCliente');
      if (btnGuardarCliente) {
        btnGuardarCliente.addEventListener('click', handleGuardarCliente);
      }
      
      // Botón confirmar eliminar
      const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
      if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', function() {
          ClienteDelete.confirmDelete(db, eliminarModal, clientesSeleccionados, function() {
            // Reset selection and reload data
            clientesSeleccionados = [];
            setupCrud();
          });
        });
      }
    }
    
    // Manejar el guardar cliente (crear nuevo o actualizar)
    function handleGuardarCliente() {
      // Validar formulario
      if (!CrudUtils.validateClienteForm()) return;
      
      // Comprobar si es creación o actualización
      const clienteId = document.getElementById('clienteId').value;
      
      if (clienteId) {
        // Es una actualización
        ClienteUpdate.updateCliente(db, clienteModal, function() {
          setupCrud(); // Recargar datos
        });
      } else {
        // Es una creación
        ClienteCreate.saveCliente(db, clientesCollection, clienteModal, function() {
          setupCrud(); // Recargar datos
        });
      }
    }
    
    // Función para recargar datos
    function refreshData() {
      setupCrud();
    }
    
    // API pública
    return {
      init,
      refreshData,
      showToast: CrudUtils.showToast
    };
  })();
  
  // Exportar para uso en la aplicación principal
  window.CrudManager = CrudManager;