class FirebaseComponent extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      // Inicializar Firebase cuando el componente se conecta al DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeFirebase());
      } else {
        this.initializeFirebase();
      }
    }
  
    async initializeFirebase() {
      try {
        // Importar dinámicamente los módulos de Firebase
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');
  
        // Verificar que las variables de entorno estén disponibles
        if (!window.ENV) {
          console.error("Las variables de entorno no están disponibles");
          return;
        }
  
        // Usar las variables de entorno globales
        const firebaseConfig = {
          apiKey: window.ENV.FIREBASE_API_KEY,
          authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
          projectId: window.ENV.FIREBASE_PROJECT_ID,
          storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
          messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
          appId: window.ENV.FIREBASE_APP_ID
        };
  
        // Inicializar Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
  
        // Exponer Firebase al ámbito global para que otros scripts puedan usarlo
        window.firebaseApp = app;
        window.firebaseAuth = auth;
        window.firebaseDb = db;
  
        // Disparar un evento para notificar que Firebase está listo
        const event = new CustomEvent('firebase-ready', { 
          bubbles: true, 
          composed: true,
          detail: { app, auth, db } 
        });
        this.dispatchEvent(event);
        document.dispatchEvent(event);
      } catch (error) {
        console.error("Error al inicializar Firebase:", error);
      }
    }
  }
  
  customElements.define('firebase-component', FirebaseComponent);