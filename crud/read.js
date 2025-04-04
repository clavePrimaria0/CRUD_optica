// Módulo para leer datos de clientes de Firestore
const ClienteRead = (function() {
    // Cargar datos de clientes desde Firestore
    async function loadClientesData(db, onSetupComplete) {
      try {
        const { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');
        
        // Obtener referencia a la colección
        const clientesCollection = collection(db, 'clientes');
        
        // Limpiar la tabla y mostrar indicador de carga
        const tableBody = document.getElementById('clientesTableBody');
        tableBody.innerHTML = `
          <tr>
            <td colspan="8" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <p class="mt-2">Cargando datos...</p>
            </td>
          </tr>
        `;
        
        // Crear la consulta
        const q = query(clientesCollection, orderBy('Nombres'), limit(50));
        
        // Ejecutar la consulta
        const querySnapshot = await getDocs(q);
        
        // Comprobar si hay datos
        if (querySnapshot.empty) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="8" class="text-center py-4">
                <p>No se encontraron registros</p>
              </td>
            </tr>
          `;
          return clientesCollection;
        }
        
        // Generar filas de la tabla
        let tableRows = '';
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const docId = doc.id;
          
          // Formatear la fecha de compra
          let fechaCompra = "No disponible";
          if (data['Fecha de Compra'] && data['Fecha de Compra'].toDate) {
            const fecha = data['Fecha de Compra'].toDate();
            fechaCompra = fecha.toLocaleDateString('es-ES');
          }
          
          // Determinar el estado para mostrar la insignia correcta
          let estadoClass = "bg-secondary";
          let estadoText = "Inactivo";
          
          if (data.Estado === "1") {
            estadoClass = "bg-success";
            estadoText = "Activo";
          } else if (data.Estado === "2") {
            estadoClass = "bg-warning text-dark";
            estadoText = "Pendiente";
          }
          
          // Crear la fila sin la columna de acciones
          tableRows += `
            <tr data-id="${docId}">
              <td class="text-center">
                <div class="form-check">
                  <input class="form-check-input cliente-checkbox" type="checkbox" value="${docId}" id="check-${docId}">
                </div>
              </td>
              <td>${data.Nombres || '-'}</td>
              <td>${data.Apellidos || '-'}</td>
              <td>${data.DNI || '-'}</td>
              <td>${data.Celular || '-'}</td>
              <td><span class="badge ${estadoClass}">${estadoText}</span></td>
              <td>${fechaCompra}</td>
              <td>${data['Monto de Compra'] || '0'}</td>
            </tr>
          `;
        });
        
        // Actualizar la tabla
        tableBody.innerHTML = tableRows;
        
        // Notificar que se ha completado la carga para configurar eventos
        if (onSetupComplete && typeof onSetupComplete === 'function') {
          onSetupComplete();
        }
        
        return clientesCollection;
      } catch (error) {
        console.error("Error al cargar datos de clientes:", error);
        showToast("Error al cargar los datos", "error");
        return null;
      }
    }
    
    // Buscar clientes por término de búsqueda (implementación en el cliente)
    function searchClientes(searchTerm) {
      const term = searchTerm.toLowerCase();
      const rows = document.querySelectorAll('#clientesTableBody tr');
      
      let foundCount = 0;
      
      rows.forEach(row => {
        // Saltar filas que no tienen datos de clientes (como mensajes de carga)
        if (!row.getAttribute('data-id')) return;
        
        let text = row.textContent.toLowerCase();
        if (text.includes(term)) {
          row.style.display = '';
          foundCount++;
        } else {
          row.style.display = 'none';
        }
      });
      
      return foundCount;
    }
    
    // Obtener un cliente específico por ID
    async function getClienteById(db, clienteId) {
      try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');
        
        const clienteRef = doc(db, 'clientes', clienteId);
        const clienteSnap = await getDoc(clienteRef);
        
        if (clienteSnap.exists()) {
          return {
            id: clienteId,
            ...clienteSnap.data()
          };
        } else {
          showToast('No se encontró el cliente', 'error');
          return null;
        }
      } catch (error) {
        console.error('Error al obtener cliente:', error);
        showToast('Error al obtener datos del cliente', 'error');
        return null;
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
      loadClientesData,
      searchClientes,
      getClienteById,
      showToast
    };
  })();