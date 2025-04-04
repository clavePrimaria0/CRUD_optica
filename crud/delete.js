// Módulo para eliminar clientes de Firestore
const ClienteDelete = (function() {
    // Función para abrir el modal de confirmación de eliminación individual
    function openDeleteModal(clienteId, eliminarModal) {
      // Establecer título del modal
      const eliminarModalLabel = document.getElementById('eliminarModalLabel');
      if (eliminarModalLabel) {
        eliminarModalLabel.textContent = 'Confirmar Eliminación';
      }
      
      // Actualizar texto del modal
      const modalBody = document.querySelector('#eliminarModal .modal-body p');
      if (modalBody) {
        modalBody.textContent = "¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.";
      }
      
      // Guardar ID en el modal
      const eliminarClienteId = document.getElementById('eliminarClienteId');
      if (eliminarClienteId) {
        eliminarClienteId.value = clienteId;
      }
      
      // Mostrar modal de confirmación
      if (eliminarModal) {
        eliminarModal.show();
      }
    }
    
    // Función para abrir el modal de confirmación de eliminación múltiple
    function openMultiDeleteModal(clientesSeleccionados, eliminarModal) {
      if (clientesSeleccionados.length === 0) {
        showToast('No hay clientes seleccionados para eliminar', 'warning');
        return false;
      }
      
      // Establecer título del modal
      const eliminarModalLabel = document.getElementById('eliminarModalLabel');
      if (eliminarModalLabel) {
        eliminarModalLabel.textContent = 'Confirmar Eliminación Múltiple';
      }
      
      // Actualizar texto del modal
      const modalBody = document.querySelector('#eliminarModal .modal-body p');
      if (modalBody) {
        modalBody.textContent = `¿Estás seguro de que deseas eliminar ${clientesSeleccionados.length} cliente(s)? Esta acción no se puede deshacer.`;
      }
      
      // Guardar indicador de múltiple eliminación
      const eliminarClienteId = document.getElementById('eliminarClienteId');
      if (eliminarClienteId) {
        eliminarClienteId.value = 'multiple';
      }
      
      // Mostrar modal
      if (eliminarModal) {
        eliminarModal.show();
      }
      
      return true;
    }
    
    // Función para confirmar y realizar la eliminación
    async function confirmDelete(db, eliminarModal, clientesSeleccionados, onSuccess) {
      try {
        const { doc, deleteDoc, writeBatch } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');
        
        const eliminarClienteId = document.getElementById('eliminarClienteId').value;
        
        if (eliminarClienteId === 'multiple') {
          // Eliminar múltiples clientes
          if (clientesSeleccionados.length === 0) {
            showToast('No hay clientes seleccionados para eliminar', 'warning');
            return false;
          }
          
          const batch = writeBatch(db);
          
          clientesSeleccionados.forEach(id => {
            const clienteRef = doc(db, 'clientes', id);
            batch.delete(clienteRef);
          });
          
          await batch.commit();
          showToast(`${clientesSeleccionados.length} clientes eliminados exitosamente`, 'success');
        } else {
          // Eliminar un solo cliente
          const clienteRef = doc(db, 'clientes', eliminarClienteId);
          await deleteDoc(clienteRef);
          showToast('Cliente eliminado exitosamente', 'success');
        }
        
        // Cerrar modal
        if (eliminarModal) {
          eliminarModal.hide();
        }
        
        // Notificar éxito para recargar datos
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        
        return true;
      } catch (error) {
        console.error('Error al eliminar cliente(s):', error);
        showToast('Error al eliminar el cliente', 'error');
        return false;
      }
    }
    
    // Función auxiliar para mostrar notificaciones
    function showToast(message, type = 'info') {
      // Si existe una implementación de toast en la aplicación principal, usarla
      if (window.OpticaApp && window.OpticaApp.showToast) {
        window.OpticaApp.showToast(message, type);
        return;
      }
      
      // Implementación básica de alerta si no hay toast
      if (type === 'error') {
        alert(`Error: ${message}`);
      } else {
        alert(message);
      }
    }
    
    // API pública
    return {
      openDeleteModal,
      openMultiDeleteModal,
      confirmDelete,
      showToast
    };
  })();