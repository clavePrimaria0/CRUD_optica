// Módulo principal de la aplicación Óptica X
const OpticaApp = (function() {
    // Constantes y variables privadas
    const FIREBASE_EVENTS = {
      READY: 'firebase-ready',
    };
  
    // Inicialización de la aplicación
    function init() {
      // Inicializar Bootstrap
      initBootstrap();
      
      // Verificar si estamos en la página de login o home
      const isLoginPage = window.location.pathname.includes('index.html') || 
                          window.location.pathname.endsWith('/');
      const isHomePage = window.location.pathname.includes('home.html');
  
      // Inicializar la página correspondiente
      if (isLoginPage) {
        initLoginPage();
      } else if (isHomePage) {
        initHomePage();
      }
    }
    
    // Inicializar componentes de Bootstrap
    function initBootstrap() {
      // Cargar Bootstrap JS si no está ya cargado
      if (typeof bootstrap === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.4/dist/js/bootstrap.bundle.min.js';
        script.integrity = 'sha384-YUe2LzesAfftltw+PEaao2tjU/QATaW/rOitAq67e0CT0Zi2VVRL0oC4+gAaeBKu';
        script.crossOrigin = 'anonymous';
        
        // Esperar a que Bootstrap se cargue completamente antes de continuar
        script.onload = function() {
          // Disparar un evento cuando Bootstrap esté listo
          document.dispatchEvent(new CustomEvent('bootstrap-ready'));
        };
        
        document.body.appendChild(script);
      } else {
        // Si Bootstrap ya está cargado, disparar el evento inmediatamente
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('bootstrap-ready'));
        }, 0);
      }
    }
  
    // Inicialización de la página de login
    function initLoginPage() {
      document.addEventListener(FIREBASE_EVENTS.READY, handleFirebaseReady);
      document.addEventListener('bootstrap-ready', initBootstrapComponents);
      
      // Toggle para mostrar/ocultar contraseña
      const passwordField = document.getElementById('password');
      const togglePassword = document.getElementById('toggle-password');
      
      if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
          const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
          passwordField.setAttribute('type', type);
          togglePassword.innerHTML = type === 'password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
        });
      }
  
      // Variable para almacenar la referencia al modal
      let registerModal;
      
      function initBootstrapComponents() {
        // Solo inicializar el modal cuando Bootstrap esté listo
        const registerModalElement = document.getElementById('registerModal');
        if (registerModalElement) {
          registerModal = new bootstrap.Modal(registerModalElement);
          
          // Botón para abrir modal de registro
          const registerBtn = document.getElementById('register-btn');
          if (registerBtn) {
            registerBtn.addEventListener('click', function() {
              registerModal.show();
            });
          }
        }
      }
  
      function handleFirebaseReady(event) {
        const { auth } = event.detail;
        initAuthForms(auth);
      }
  
      function initAuthForms(auth) {
        // Referencias a elementos del DOM
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const forgotPasswordForm = document.getElementById('forgot-password-form');
        const errorElement = document.getElementById('auth-error');
        
        // Event listeners
        if (loginForm) {
          loginForm.addEventListener('submit', handleLogin);
        }
        
        if (registerForm) {
          registerForm.addEventListener('submit', handleRegister);
        }
        
        if (forgotPasswordForm) {
          forgotPasswordForm.addEventListener('submit', handleForgotPassword);
        }
  
        // Manejadores de eventos
        function handleLogin(e) {
          e.preventDefault();
          hideError();
  
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
  
          import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js')
            .then(({ signInWithEmailAndPassword }) => {
              signInWithEmailAndPassword(auth, email, password)
                .then(() => {
                  window.location.href = "home.html";
                })
                .catch(handleAuthError);
            });
        }
  
        function handleRegister(e) {
          e.preventDefault();
          
          const email = document.getElementById('register-email').value;
          const password = document.getElementById('register-password').value;
          const name = document.getElementById('register-name').value;
          
          // Validación básica
          if (!email || !password) {
            showModalError('register-error', 'Por favor, completa todos los campos');
            return;
          }
          
          if (password.length < 6) {
            showModalError('register-error', 'La contraseña debe tener al menos 6 caracteres');
            return;
          }
          
          import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js')
            .then(({ createUserWithEmailAndPassword, updateProfile }) => {
              createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                  // Actualizar perfil con el nombre si se proporcionó
                  if (name) {
                    updateProfile(userCredential.user, {
                      displayName: name
                    }).then(() => {
                      window.location.href = "home.html";
                    }).catch(error => {
                      showModalError('register-error', error.message);
                    });
                  } else {
                    window.location.href = "home.html";
                  }
                })
                .catch(error => {
                  console.error("Error de registro:", error);
                  showModalError('register-error', getErrorMessage(error.code));
                });
            });
        }
        
        function handleForgotPassword(e) {
          e.preventDefault();
          
          const email = document.getElementById('forgot-email').value;
          
          if (!email) {
            showModalError('forgot-error', 'Por favor, ingresa tu correo electrónico');
            return;
          }
          
          import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js')
            .then(({ sendPasswordResetEmail }) => {
              sendPasswordResetEmail(auth, email)
                .then(() => {
                  document.getElementById('forgot-success').classList.remove('d-none');
                  document.getElementById('forgot-error').classList.add('d-none');
                  // Limpiar el campo de email
                  document.getElementById('forgot-email').value = '';
                })
                .catch(error => {
                  showModalError('forgot-error', getErrorMessage(error.code));
                });
            });
        }
  
        function handleAuthError(error) {
          showError(getErrorMessage(error.code));
        }
        
        function getErrorMessage(errorCode) {
          // Mapeo de códigos de error a mensajes amigables
          const errorMessages = {
            'auth/email-already-in-use': 'Este correo electrónico ya está registrado.',
            'auth/invalid-email': 'El correo electrónico no es válido.',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
            'auth/user-not-found': 'No existe un usuario con este correo electrónico.',
            'auth/wrong-password': 'Contraseña incorrecta.',
            'auth/weak-password': 'La contraseña es demasiado débil.',
            'auth/missing-password': 'Por favor, ingresa una contraseña.'
          };
          
          return errorMessages[errorCode] || `Error: ${errorCode}`;
        }
  
        function showError(message) {
          if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
          }
        }
  
        function hideError() {
          if (errorElement) {
            errorElement.classList.add('d-none');
          }
        }
        
        function showModalError(elementId, message) {
          const element = document.getElementById(elementId);
          if (element) {
            element.textContent = message;
            element.classList.remove('d-none');
          }
        }
      }
    }
  
    // Inicialización de la página de inicio (home)
    function initHomePage() {
      document.addEventListener(FIREBASE_EVENTS.READY, handleFirebaseReady);
      
      function handleFirebaseReady(event) {
        const { auth, app, db } = event.detail;
        checkAuthState(auth);
        setupLogout(auth);
        
        // Cargar scripts de CRUD
        loadCrudScripts().then(() => {
          // Inicializar el gestor CRUD con la base de datos
          if (window.CrudManager) {
            window.CrudManager.init(db);
          }
        });
      }
      
      // Cargar scripts de CRUD
      function loadCrudScripts() {
        return new Promise((resolve, reject) => {
          const scripts = [
            'crud/utils.js',
            'crud/create.js',
            'crud/read.js',
            'crud/update.js',
            'crud/delete.js',
            'crud/index.js'
          ];
          
          let loadedCount = 0;
          
          scripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            
            script.onload = () => {
              loadedCount++;
              if (loadedCount === scripts.length) {
                resolve();
              }
            };
            
            script.onerror = (err) => {
              console.error(`Error al cargar script: ${src}`, err);
              reject(err);
            };
            
            document.body.appendChild(script);
          });
        });
      }
  
      function checkAuthState(auth) {
        import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js')
          .then(({ onAuthStateChanged }) => {
            onAuthStateChanged(auth, (user) => {
              if (!user) {
                // Redirigir al login si no hay usuario autenticado
                window.location.href = "index.html";
              } else {
                // Mostrar información del usuario
                updateUserInfo(user);
              }
            });
          });
      }
  
      function updateUserInfo(user) {
        const userEmail = document.getElementById('user-email');
        const userName = document.getElementById('user-name');
        const userInitial = document.getElementById('user-initial');
        const navUserName = document.getElementById('nav-user-name');
        const navUserInitial = document.getElementById('nav-user-initial');
        
        // Actualizar inicial y nombre en la barra de navegación
        if (navUserName && user.displayName) {
          navUserName.textContent = user.displayName;
        } else if (navUserName) {
          navUserName.textContent = "Usuario";
        }
        
        if (navUserInitial) {
          const initial = user.displayName 
            ? user.displayName.charAt(0).toUpperCase() 
            : user.email.charAt(0).toUpperCase();
          navUserInitial.textContent = initial;
        }
        
        // Actualizar información en tarjeta de usuario si existe
        if (userEmail) {
          userEmail.textContent = user.email;
        }
        
        if (userName && user.displayName) {
          userName.textContent = user.displayName;
        }
        
        if (userInitial) {
          const initial = user.displayName 
            ? user.displayName.charAt(0).toUpperCase() 
            : user.email.charAt(0).toUpperCase();
          userInitial.textContent = initial;
        }
      }
  
      function setupLogout(auth) {
        const logoutBtn = document.getElementById('logout-btn');
        const logoutBtnCard = document.getElementById('logout-btn-card');
        
        const handleLogout = () => {
          import('https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js')
            .then(({ signOut }) => {
              signOut(auth).then(() => {
                window.location.href = "index.html";
              });
            });
        };
        
        if (logoutBtn) {
          logoutBtn.addEventListener('click', handleLogout);
        }
        
        if (logoutBtnCard) {
          logoutBtnCard.addEventListener('click', handleLogout);
        }
      }
    }
    
    // Función auxiliar para mostrar notificaciones (delegada al CrudUtils si está disponible)
    function showToast(message, type = 'info') {
      if (window.CrudManager) {
        window.CrudManager.showToast(message, type);
      } else {
        if (type === 'error') {
          alert(`Error: ${message}`);
        } else {
          alert(message);
        }
      }
    }
  
    // API pública
    return {
      init: init,
      showToast: showToast
    };
  })();
  
  // Inicializar la aplicación cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', OpticaApp.init);
  
  // Exponer la aplicación globalmente
  window.OpticaApp = OpticaApp;