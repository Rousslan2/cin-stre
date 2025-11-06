// ========================================
// 📱 CONFIGURATION GLOBALE MOBILE
// ═══════════════════════════════════════════════════════════

/**
 * Configuration centralisée pour toutes les optimisations mobile
 * Gère la détection de dispositif, les optimisations automatiques
 * et les fonctionnalités spécifiques plateforme
 */

class MobileConfig {
    constructor() {
        this.device = this.detectDevice();
        this.os = this.detectOS();
        this.browser = this.detectBrowser();
        this.isMobile = this.device === 'mobile';
        this.isTablet = this.device === 'tablet';
        this.isDesktop = this.device === 'desktop';
        
        this.init();
    }

    // ========================================
    // 🔍 DÉTECTION DE DISPOSITIF
    // ========================================

    detectDevice() {
        const userAgent = navigator.userAgent;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Détection basée sur la taille d'écran et user agent
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
            if (width >= 768 && width <= 1024) {
                return 'tablet';
            }
            return 'mobile';
        }
        
        if (width <= 767) {
            return 'mobile';
        }
        
        if (width >= 768 && width <= 1024) {
            return 'tablet';
        }
        
        return 'desktop';
    }

    detectOS() {
        const userAgent = navigator.userAgent;
        
        if (/Android/i.test(userAgent)) {
            return 'android';
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            return 'ios';
        } else if (/Windows/i.test(userAgent)) {
            return 'windows';
        } else if (/Mac/i.test(userAgent)) {
            return 'macos';
        } else if (/Linux/i.test(userAgent)) {
            return 'linux';
        }
        
        return 'unknown';
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        
        if (/Chrome/i.test(userAgent)) {
            return 'chrome';
        } else if (/Safari/i.test(userAgent)) {
            return 'safari';
        } else if (/Firefox/i.test(userAgent)) {
            return 'firefox';
        } else if (/Edge/i.test(userAgent)) {
            return 'edge';
        } else if (/Opera/i.test(userAgent)) {
            return 'opera';
        }
        
        return 'unknown';
    }

    // ========================================
    // 🚀 INITIALISATION
    // ========================================

    init() {
        // Ajouter les classes CSS pour le styling conditionnel
        this.applyCSSClasses();
        
        // Appliquer les optimisations spécifiques plateforme
        this.applyPlatformOptimizations();
        
        // Configurer les event listeners
        this.setupEventListeners();
        
        // Optimiser les performances
        this.optimizePerformance();
        
        console.log(`📱 Mobile Config Initialized: ${this.device} | ${this.os} | ${this.browser}`);
    }

    applyCSSClasses() {
        const body = document.body;
        
        // Classes pour le type de dispositif
        body.classList.add(`device-${this.device}`);
        body.classList.add(`os-${this.os}`);
        body.classList.add(`browser-${this.browser}`);
        
        // Classes pour les fonctionnalités
        if (this.isMobile || this.isTablet) {
            body.classList.add('touch-device');
        }
        
        if (this.os === 'ios') {
            body.classList.add('ios-device');
        } else if (this.os === 'android') {
            body.classList.add('android-device');
        }
        
        // Support des fonctionnalités modernes
        if ('serviceWorker' in navigator) {
            body.classList.add('sw-supported');
        }
        
        if ('IntersectionObserver' in window) {
            body.classList.add('io-supported');
        }
    }

    // ========================================
    // 🎯 OPTIMISATIONS SPÉCIFIQUES PLATEFORME
    // ========================================

    applyPlatformOptimizations() {
        // Optimisations iOS
        if (this.os === 'ios') {
            this.applyIOSOptimizations();
        }
        
        // Optimisations Android
        if (this.os === 'android') {
            this.applyAndroidOptimizations();
        }
        
        // Optimisations spécifiques navigateur
        if (this.browser === 'safari') {
            this.applySafariOptimizations();
        }
    }

    applyIOSOptimizations() {
        // Corriger le zoom sur les inputs
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                if (e.target.type !== 'range' && e.target.type !== 'color') {
                    setTimeout(() => {
                        e.target.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 500);
                }
            });
        });

        // Empêcher le bounce scroll
        document.addEventListener('touchmove', (e) => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY <= 0 && e.touches[0].clientY < e.touches[0].clientY) {
                e.preventDefault();
            }
        }, { passive: false });

        // Optimiser les animations
        const animatedElements = document.querySelectorAll('.hero-visual, .floating-card');
        animatedElements.forEach(el => {
            el.style.transformStyle = 'preserve-3d';
            el.style.willChange = 'transform';
        });
    }

    applyAndroidOptimizations() {
        // Améliorer les performances
        document.body.style.setProperty('--animation-duration', '0.2s');
        
        // Optimiser les images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.style.imageRendering = '-webkit-optimize-contrast';
        });
    }

    applySafariOptimizations() {
        // Corriger les problèmes de backdrop-filter
        const backdropElements = document.querySelectorAll('.navbar, .modal');
        backdropElements.forEach(el => {
            if (el.style.backdropFilter) {
                el.style.backdropFilter = 'blur(20px)';
            }
        });
    }

    // ========================================
    // 📡 EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // Gestion du changement d'orientation
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 500);
        });

        // Gestion du changement de taille
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Gestion de la visibilité de la page
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Gestion du online/offline
        window.addEventListener('online', () => {
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.handleOffline();
        });
    }

    handleOrientationChange() {
        // Forcer un re-layout
        window.dispatchEvent(new Event('resize'));
        
        // Fermer le menu mobile en cas de rotation
        if (window.innerWidth > 767) {
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');
            const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
            if (mobileMenuToggle && mobileMenuOverlay) {
                mobileMenuToggle.classList.remove('active');
                mobileMenuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
                document.body.style.overflow = '';
            }
        }
    }

    handleResize() {
        // Réinitialiser les animations si nécessaire
        const floatingCards = document.querySelectorAll('.floating-card');
        floatingCards.forEach(card => {
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = '';
            }, 10);
        });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page cachée - réduire les animations
            document.body.classList.add('page-hidden');
        } else {
            // Page visible - restaurer les animations
            document.body.classList.remove('page-hidden');
        }
    }

    handleOnline() {
        document.body.classList.remove('offline');
        console.log('📶 Connection restored');
    }

    handleOffline() {
        document.body.classList.add('offline');
        console.log('📴 Connection lost');
    }

    // ========================================
    // ⚡ OPTIMISATIONS PERFORMANCE
    // ========================================

    optimizePerformance() {
        // Réduire les animations sur mobile pour économiser la batterie
        if (this.isMobile) {
            this.reduceAnimationsForMobile();
        }

        // Optimiser les images pour mobile
        if (this.isMobile || this.isTablet) {
            this.optimizeImagesForMobile();
        }

        // Précharger les ressources critiques
        this.preloadCriticalResources();
    }

    reduceAnimationsForMobile() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.3s !important;
                transition-duration: 0.3s !important;
            }
            
            .floating-card {
                animation-duration: 8s !important;
            }
            
            .page-hidden * {
                animation-play-state: paused !important;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeImagesForMobile() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Lazy loading si pas déjà configuré
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
            
            // Optimiser le chargement
            img.loading = 'lazy';
        });
    }

    preloadCriticalResources() {
        // Précharger les polices critiques
        const criticalFonts = [
            '/fonts/main-font.woff2'
        ];
        
        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            link.href = font;
            document.head.appendChild(link);
        });
    }

    // ========================================
    // 🛠️ MÉTHODES UTILITAIRES
    // ========================================

    // Vérifier si une fonctionnalité est supportée
    supports(feature) {
        switch (feature) {
            case 'serviceWorker':
                return 'serviceWorker' in navigator;
            case 'intersectionObserver':
                return 'IntersectionObserver' in window;
            case 'webp':
                return this.checkWebPSupport();
            case 'avif':
                return this.checkAVIFSupport();
            default:
                return false;
        }
    }

    // Obtenir les informations de performance
    getPerformanceInfo() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
            };
        }
        return null;
    }

    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    checkAVIFSupport() {
        return new Promise((resolve) => {
            const avif = new Image();
            avif.onload = avif.onerror = () => {
                resolve(avif.height === 2);
            };
            avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EAMAAAAAAAAAAAEAAAZCdWAgbG9hZABnZXQAAAABAAAAAQAAAAEAAAAZGF0YQAAAAA=';
        });
    }

    // Debug info
    getDebugInfo() {
        return {
            device: this.device,
            os: this.os,
            browser: this.browser,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            performance: this.getPerformanceInfo()
        };
    }
}

// ========================================
// 🚀 INITIALISATION GLOBALE
// ========================================

// Créer l'instance globale
window.mobileConfig = new MobileConfig();

// Exposer des méthodes utilitaires globales
window.MobileUtils = {
    // Vérifier si c'est un dispositif mobile
    isMobile() {
        return window.mobileConfig.isMobile;
    },
    
    // Obtenir l'OS
    getOS() {
        return window.mobileConfig.os;
    },
    
    // Vérifier le support d'une fonctionnalité
    supports(feature) {
        return window.mobileConfig.supports(feature);
    },
    
    // Obtenir les infos de debug
    getDebugInfo() {
        return window.mobileConfig.getDebugInfo();
    }
};

console.log('📱 Mobile Configuration Loaded Successfully');