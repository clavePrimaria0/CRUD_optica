// Módulo para crear nuevos clientes en Firestore
const ClienteCreate = (function() {
    // Función para abrir el modal de creación
    function openCreateModal(clienteModal) {
      // Limpiar formulario
      const clienteForm = document.getElementById('clienteForm');
      if (clienteForm) {
        clienteForm.reset();
      }
      
      // Establecer título del modal
      const clienteModalLabel = document.getElementById('clienteModalLabel');
      if (clienteModalLabel) {
        clienteModalLabel.textContent = 'Nuevo Cliente';
      }
      
      // Limpiar ID de cliente
      const clienteIdField = document.getElementById('clienteId');
      if (clienteIdField) {
        clienteIdField.value = '';
      }
      
      // Mostrar modal
      if (clienteModal) {
        clienteModal.show();
      }
    }
    
    // Función para guardar un nuevo cliente
    async function saveCliente(db, clientesCollection, clienteModal, onSuccess) {
      try {
        const { addDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');
        
        // Obtener los valores del formulario
        const nombres = document.getElementById('nombres').value;
        const apellidos = document.getElementById('apellidos').value;
        const dni = document.getElementById('dni').value;
        const celular = document.getElementById('celular').value;
        const estado = document.getElementById('estado').value;
        const fechaCompraStr = document.getElementById('fechaCompra').value;
        const montoCompra = parseFloat(document.getElementById('montoCompra').value) || 0;
        const medidaOjoDerecho = document.getElementById('medidaOjoDerecho').value;
        const medidaOjoIzquierdo = document.getElementById('medidaOjoIzquierdo').value;
        const observaciones = document.getElementById('observaciones').value;
        
        // Validar campos obligatorios
        if (!nombres || !apellidos) {
          showToast('Nombres y Apellidos son campos obligatorios', 'warning');
          return false;
        }
        
        // Preparar objeto de datos
        const clienteData = {
          Nombres: nombres,
          Apellidos: apellidos,
          DNI: dni || "0",
          Celular: celular || "-",
          Estado: estado,
          "Medida Ojo Derecho": medidaOjoDerecho || "1",
          "Medida Ojo Izquierdo": medidaOjoIzquierdo || "1",
          "Monto de Compra": montoCompra,
          Observaciones: observaciones || "-"
        };
        
        // Convertir la fecha si existe
        if (fechaCompraStr) {
          const fechaCompra = new Date(fechaCompraStr);
          clienteData["Fecha de Compra"] = Timestamp.fromDate(fechaCompra);
        } else {
          clienteData["Fecha de Compra"] = Timestamp.now();
        }
        
        // Crear nuevo documento
        await addDoc(clientesCollection, clienteData);
        showToast('Cliente creado exitosamente', 'success');
        
        // Cerrar modal
        if (clienteModal) {
          clienteModal.hide();
        }
        
        // Notificar éxito para recargar datos
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        
        return true;
      } catch (error) {
        console.error('Error al crear cliente:', error);
        showToast('Error al guardar los datos del cliente', 'error');
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
      openCreateModal,
      saveCliente,
      showToast
    };
  })();