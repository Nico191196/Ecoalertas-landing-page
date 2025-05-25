// =============================================
// CONFIGURACIÓN FIREBASE - MEJORADA
// =============================================

// TODO: Mover estas credenciales a variables de entorno en producción
const firebaseConfig = {
    apiKey: "AIzaSyDFcl8QNdxr8UyaHJJyxmLF_ggT5pj1Zt4",
    authDomain: "ecoalertas-ba8d4.firebaseapp.com",
    projectId: "ecoalertas-ba8d4",
    storageBucket: "ecoalertas-ba8d4.appspot.com",
    messagingSenderId: "295847368577",
    appId: "1:295847368577:web:b8a07e6b94b7f7e2f7b7c7",
    measurementId: "G-1XYZT9WXYZ"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// =============================================
// UTILIDADES Y VALIDACIONES
// =============================================

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Validación mejorada de email
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        throw new ValidationError('Email es requerido');
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (trimmedEmail.length > 254) {
        throw new ValidationError('Email demasiado largo');
    }
    
    if (!emailRegex.test(trimmedEmail)) {
        throw new ValidationError('Formato de email inválido');
    }
    
    return trimmedEmail;
}

// Sanitización básica para prevenir XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[<>\"'&]/g, function(match) {
            const escapeMap = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return escapeMap[match];
        });
}

// Rate limiting básico (prevenir spam)
class RateLimiter {
    constructor(maxAttempts = 3, windowMs = 60000) {
        this.attempts = new Map();
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }
    
    isAllowed(key) {
        const now = Date.now();
        const userAttempts = this.attempts.get(key) || [];
        
        // Limpiar intentos antiguos
        const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
        
        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }
        
        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        return true;
    }
}

const newsletterLimiter = new RateLimiter(3, 60000); // 3 intentos por minuto

// =============================================
// SISTEMA DE NOTIFICACIONES
// =============================================

function showNotification(message, type = 'info', duration = 5000) {
    // Crear contenedor de notificaciones si no existe
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 8px;
    `;
    
    notification.innerHTML = `
        <strong>${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</strong>
        ${sanitizeInput(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove después del tiempo especificado
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

// =============================================
// MANEJO DE LOADING STATES
// =============================================

function setLoadingState(button, isLoading, originalText = null) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status"></span>
            Cargando...
        `;
    } else {
        button.disabled = false;
        button.innerHTML = originalText || button.dataset.originalText || button.innerHTML;
    }
}

// =============================================
// FUNCIONES DE NEWSLETTER MEJORADAS
// =============================================

async function subscribeToNewsletter(email, source = 'landing') {
    try {
        // Validar email
        const validEmail = validateEmail(email);
        
        // Verificar rate limiting
        if (!newsletterLimiter.isAllowed(validEmail)) {
            throw new ValidationError('Demasiados intentos. Espera un minuto antes de intentar de nuevo.');
        }
        
        // Verificar si ya está suscrito
        const existingSubscription = await db.collection('newsletter')
            .where('email', '==', validEmail)
            .get();
        
        if (!existingSubscription.empty) {
            throw new ValidationError('Este email ya está suscrito al newsletter');
        }
        
        // Crear nueva suscripción
        const subscriptionData = {
            email: validEmail,
            subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
            source: sanitizeInput(source),
            status: 'active',
            ipAddress: null, // Se podría obtener del servidor
            userAgent: navigator.userAgent.substring(0, 200) // Limitado por seguridad
        };
        
        await db.collection('newsletter').add(subscriptionData);
        
        // Analytics tracking (si Google Analytics está configurado)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'newsletter_signup', {
                'event_category': 'engagement',
                'event_label': source
            });
        }
        
        return { success: true, message: '¡Te has suscrito exitosamente al newsletter!' };
        
    } catch (error) {
        console.error('Error en suscripción al newsletter:', error);
        
        if (error instanceof ValidationError) {
            throw error;
        }
        
        // Error genérico para errores de Firebase u otros
        throw new Error('Error al procesar la suscripción. Por favor intenta de nuevo.');
    }
}

// =============================================
// FUNCIONES DE AUTENTICACIÓN MEJORADAS
// =============================================

async function loginUser(email, password) {
    try {
        const validEmail = validateEmail(email);
        
        if (!password || password.length < 6) {
            throw new ValidationError('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Verificar rate limiting para login
        if (!newsletterLimiter.isAllowed(`login_${validEmail}`)) {
            throw new ValidationError('Demasiados intentos de login. Espera un minuto.');
        }
        
        const userCredential = await auth.signInWithEmailAndPassword(validEmail, password);
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'login', {
                'event_category': 'engagement',
                'method': 'email'
            });
        }
        
        return { 
            success: true, 
            user: userCredential.user,
            message: 'Login exitoso. Redirigiendo al dashboard...' 
        };
        
    } catch (error) {
        console.error('Error en login:', error);
        
        if (error instanceof ValidationError) {
            throw error;
        }
        
        // Mapear errores de Firebase a mensajes user-friendly
        let message;
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No existe una cuenta con este email';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta';
                break;
            case 'auth/too-many-requests':
                message = 'Demasiados intentos fallidos. Intenta más tarde';
                break;
            case 'auth/user-disabled':
                message = 'Esta cuenta ha sido deshabilitada';
                break;
            default:
                message = 'Error al iniciar sesión. Verifica tus credenciales';
        }
        
        throw new Error(message);
    }
}

// =============================================
// EVENT LISTENERS Y DOM MANIPULATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    // Newsletter form handler
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (!emailInput || !submitButton) return;
            
            setLoadingState(submitButton, true);
            
            try {
                await subscribeToNewsletter(emailInput.value, 'main_form');
                showNotification('¡Gracias por suscribirte! Pronto recibirás noticias sobre EcoAlertas.', 'success');
                emailInput.value = '';
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoadingState(submitButton, false);
            }
        });
    }
    
    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const passwordInput = this.querySelector('input[type="password"]');
            const submitButton = this.querySelector('button[type="submit"]');
            
            if (!emailInput || !passwordInput || !submitButton) return;
            
            setLoadingState(submitButton, true);
            
            try {
                const result = await loginUser(emailInput.value, passwordInput.value);
                showNotification(result.message, 'success');
                
                // Redirigir al dashboard después de 1 segundo
                setTimeout(() => {
                    window.location.href = '/dashboard'; // Ajustar URL según tu estructura
                }, 1000);
                
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                setLoadingState(submitButton, false);
            }
        });
    }
    
    // Auth state observer
    auth.onAuthStateChanged(function(user) {
        if (user) {
            console.log('Usuario autenticado:', user.email);
            // Actualizar UI para usuario autenticado
            updateUIForAuthenticatedUser(user);
        } else {
            console.log('Usuario no autenticado');
            updateUIForUnauthenticatedUser();
        }
    });
});

// =============================================
// FUNCIONES DE UI
// =============================================

function updateUIForAuthenticatedUser(user) {
    const authButtons = document.querySelectorAll('.auth-button');
    authButtons.forEach(button => {
        if (button.textContent.includes('Dashboard')) {
            button.style.display = 'inline-block';
        } else if (button.textContent.includes('Iniciar Sesión')) {
            button.style.display = 'none';
        }
    });
}

function updateUIForUnauthenticatedUser() {
    const authButtons = document.querySelectorAll('.auth-button');
    authButtons.forEach(button => {
        if (button.textContent.includes('Dashboard')) {
            button.style.display = 'none';
        } else if (button.textContent.includes('Iniciar Sesión')) {
            button.style.display = 'inline-block';
        }
    });
}

// =============================================
// FUNCIONES DE UTILIDAD ADICIONALES
// =============================================

// Función para analytics personalizado
function trackCustomEvent(eventName, properties = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // También se puede enviar a otros servicios de analytics
    console.log('Custom Event:', eventName, properties);
}

// Función para detectar si es mobile
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Smooth scroll para anchors internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// =============================================
// ERROR HANDLING GLOBAL
// =============================================

window.addEventListener('error', function(e) {
    console.error('Error global capturado:', e.error);
    
    // En producción, enviar errores a un servicio de monitoring
    // como Sentry, LogRocket, etc.
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejection no manejada:', e.reason);
    e.preventDefault(); // Prevenir que aparezca en la consola del browser
});
