// Archivo de configuración que carga las variables desde .env
// o usa valores por defecto si no se puede cargar el archivo

// Definir un objeto global para las variables de entorno
window.ENV = {};

// Función para cargar las variables de entorno
async function loadEnvVariables() {
  try {
    const response = await fetch('/.env');
    
    if (!response.ok) {
      console.warn('No se pudo cargar el archivo .env, usando valores de respaldo.');
      return false;
    }
    
    const text = await response.text();
    
    // Parsear el archivo .env (formato clave=valor)
    const lines = text.split('\n');
    lines.forEach(line => {
      // Ignorar comentarios y líneas vacías
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=').map(part => part.trim());
        if (key && value) {
          // Eliminar comillas si existen
          window.ENV[key] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al cargar variables de entorno:', error);
    return false;
  }
}

// Llamar a la función inmediatamente
loadEnvVariables().then(success => {
  if (!success) {
    console.warn('Usando valores de configuración predeterminados o respaldo.');
    // Si no se puede cargar .env, lanzar un evento para notificar que la config está lista
  }
  
  // Disparar evento cuando la configuración esté lista (ya sea con valores reales o de respaldo)
  document.dispatchEvent(new CustomEvent('config-loaded'));
});