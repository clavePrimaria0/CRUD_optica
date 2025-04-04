// Módulo para actualizar clientes en Firestore
const ClienteUpdate = (function() {
    // Función para abrir el modal de edición y cargar los datos del cliente
    async function openEditModal(db, clienteId, clienteModal) {
      try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');
        
        // Obtener los datos del cliente
        const clienteDoc = doc(db, 'clientes', clienteId);
        const clienteSnap = await getDoc(clienteDoc);
        
        if (clienteSnap.exists()) {
          const data = clienteSnap.data();
          
          // Establecer título del modal
          const clienteModalLabel = document.getElementById('clienteModalLabel');
          if (clienteModalLabel) {
            clienteModalLabel.textContent = 'Editar Cliente';
          }
          
          // Llenar formulario con los datos
          document.getElementById('clienteId').value = clienteId;
          document.getElementById('nombres').value = data.Nombres || '';
          document.getElementById('apellidos').value = data.Apellidos || '';
          document.getElementById('dni').value = data.DNI || '';
          document.getElementById('celular').value = data.Celular || '';
          document.getElementById('estado').value = data.Estado || '0';
          
          // Formatear fecha para input date
          if (data['Fecha de Compra'] && data['Fecha de Compra'].toDate) {
            const fecha = data['Fecha de Compra'].toDate();
            const fechaFormateada = fecha.toISOString().split('T')[0];
            document.getElementById('fechaCompra').value = fechaFormateada;
          } else {
            document.getElementById('fechaCompra').value = '';
          }
          
          document.getElementById('montoCompra').value = data['Monto de Compra'] || '0';
          document.getElementById('medidaOjoDerecho').value = data['Medida Ojo Derecho'] || '';
          document.getElementById('medidaOjoIzquierdo').value = data['Medida Ojo Izquierdo'] || '';
          document.getElementById('observaciones').value = data.Observaciones || '';
          
          // Mostrar modal
          if (clienteModal) {
            clienteModal.show();
          }
        } else {
          showToast('No se encontró el cliente', 'error');
        }
      } catch (error) {
        console.error('Error al obtener datos del cliente:', error);
        showToast('Error al obtener datos del cliente', 'error');
      }
    }
    
    // Función para actualizar un cliente existente
    async function updateCliente(db, clienteModal, onSuccess) {
      try {
        const { doc, setDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');
        
        // Obtener ID del cliente
        const clienteId = document.getElementById('clienteId').value;
        
        // Verificar que sea una actualización
        if (!clienteId) {
          showToast('ID de cliente no válido', 'error');
          return false;
        }
        
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
          // Mantener la fecha existente o usar la actual si no hay
          clienteData["Fecha de Compra"] = Timestamp.now();
        }
        
        // Actualizar documento existente
        const clienteRef = doc(db, 'clientes', clienteId);
        await setDoc(clienteRef, clienteData, { merge: true });
        showToast('Cliente actualizado exitosamente', 'success');
        
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
        console.error('Error al actualizar cliente:', error);
        showToast('Error al actualizar los datos del cliente', 'error');
        return false;
      }
    }
    
    // Función para manejar la edición de múltiples clientes
    function handleMultiEdit(clientesSeleccionados, onEdit) {
      if (clientesSeleccionados.length === 1) {
        // Si solo hay uno seleccionado, editar ese
        if (onEdit && typeof onEdit === 'function') {
          onEdit(clientesSeleccionados[0]);
          return true;
        }
      } else if (clientesSeleccionados.length > 1) {
        // Si hay más de uno, mostrar mensaje
        showToast('Solo se puede editar un cliente a la vez', 'warning');
      } else {
        showToast('No hay clientes seleccionados para editar', 'warning');
      }
      
      return false;
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
      openEditModal,
      updateCliente,
      handleMultiEdit,
      showToast
    };
  })();