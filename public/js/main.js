// ========================================
// 📱 GESTION DU MENU MOBILE
// ========================================

// Initialisation du menu mobile
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;

    if (mobileMenuToggle && mobileMenuOverlay && mobileMenu) {
        // Toggle du menu mobile
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        
        // Fermer le menu en cliquant sur l'overlay
        mobileMenuOverlay.addEventListener('click', closeMobileMenu);
        
        // Fermer le menu en cliquant sur un lien
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-menu a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Fermer le menu si on change la taille de fenêtre
        window.addEventListener('resize', () => {
            if (window.innerWidth > 767) {
                closeMobileMenu();
            }
        });
    }
});

// Toggle du menu mobile
function toggleMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;

    mobileMenuToggle.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
    body.classList.toggle('menu-open');

    // Empêcher le scroll du body quand le menu est ouvert
    if (body.classList.contains('menu-open')) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = '';
    }
}

// Fermer le menu mobile
function closeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenu = document.getElementById('mobileMenu');
    const body = document.body;

    mobileMenuToggle.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    body.classList.remove('menu-open');
    body.style.overflow = '';

    // Fermer le dropdown mobile aussi
    const mobileDropdownMenu = document.getElementById('mobileDropdownMenu');
    if (mobileDropdownMenu) {
        mobileDropdownMenu.classList.remove('show');
    }
}

// Toggle du dropdown utilisateur mobile
function toggleMobileDropdown() {
    const mobileDropdownMenu = document.getElementById('mobileDropdownMenu');
    if (mobileDropdownMenu) {
        mobileDropdownMenu.classList.toggle('show');
    }
}

// Effet de scroll sur la navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Charger les films populaires
async function loadPopularMovies() {
    try {
        const response = await fetch('/api/movies', {
            credentials: 'include' // ESSENTIEL pour les cookies de session
        });
        const movies = await response.json();
        
        const container = document.getElementById('popularMovies');
        if (!container) return;
        
        container.innerHTML = movies.map(movie => `
            <div class="movie-card" onclick="goToMovie(${movie.id})">
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span>${movie.year}</span>
                        <div class="movie-rating">
                            <i class="fas fa-star"></i>
                            <span>${movie.rating}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur lors du chargement des films:', error);
    }
}

// Rediriger vers la page du film
function goToMovie(movieId) {
    window.location.href = `player.html?id=${movieId}`;
}

// Vérifier l'authentification
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', {
            credentials: 'include' // ESSENTIEL pour les cookies de session
        });
        const data = await response.json();

        if (data.authenticated) {
            updateNavForAuthenticatedUser(data.user);
        } else {
            showGuestUI();
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        showGuestUI();
    }
}

// Fonction pour afficher l'interface invité
function showGuestUI() {
    const navButtons = document.querySelector('.nav-buttons');
    const userMenu = document.getElementById('userMenu');
    const mobileNavButtons = document.getElementById('mobileNavButtons');
    const mobileUserMenu = document.getElementById('mobileUserMenu');
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    const heroMoviesBtn = document.getElementById('heroMoviesBtn');

    // Navigation desktop
    if (navButtons) navButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    
    // Navigation mobile
    if (mobileNavButtons) mobileNavButtons.style.display = 'flex';
    if (mobileUserMenu) mobileUserMenu.style.display = 'none';
    
    // Boutons hero
    if (heroRegisterBtn) heroRegisterBtn.style.display = 'inline-flex';
    if (heroMoviesBtn) heroMoviesBtn.style.display = 'none';
}

// Mettre à jour la navigation pour un utilisateur connecté
function updateNavForAuthenticatedUser(user) {
    const navButtons = document.querySelector('.nav-buttons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminMenuBtn = document.getElementById('adminMenuBtn');
    
    const mobileNavButtons = document.getElementById('mobileNavButtons');
    const mobileUserMenu = document.getElementById('mobileUserMenu');
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileAdminMenuBtn = document.getElementById('mobileAdminMenuBtn');

    // Navigation desktop
    if (navButtons && userMenu && userName) {
        navButtons.style.display = 'none';
        userMenu.style.display = 'block';
        userName.textContent = user.name;
        
        // Afficher le bouton admin uniquement pour les administrateurs
        if (adminMenuBtn && user.role === 'admin') {
            adminMenuBtn.style.display = 'block';
        }
    }

    // Navigation mobile
    if (mobileNavButtons && mobileUserMenu && mobileUserName) {
        mobileNavButtons.style.display = 'none';
        mobileUserMenu.style.display = 'block';
        mobileUserName.textContent = user.name;
        
        // Afficher le bouton admin uniquement pour les administrateurs
        if (mobileAdminMenuBtn && user.role === 'admin') {
            mobileAdminMenuBtn.style.display = 'block';
        }
    }

    // Mettre à jour les boutons du hero pour les utilisateurs connectés
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    const heroMoviesBtn = document.getElementById('heroMoviesBtn');

    if (heroRegisterBtn && heroMoviesBtn) {
        heroRegisterBtn.style.display = 'none';
        heroMoviesBtn.style.display = 'inline-flex';
    } else {
        // Essayer de trouver par classe
        const guestButtons = document.querySelectorAll('.guest-only');
        const userButtons = document.querySelectorAll('.user-only');

        guestButtons.forEach(btn => btn.style.display = 'none');
        userButtons.forEach(btn => btn.style.display = 'inline-flex');
    }
}

// Déconnexion
async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include' // ESSENTIEL pour les cookies de session
        });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
}

// Animation au scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observer tous les éléments avec la classe 'animate'
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .movie-card, .pricing-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Charger les films
    loadPopularMovies();
    
    // Vérifier l'authentification
    checkAuth();
});

// Smooth scroll
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

// Effet de parallaxe sur le hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// ========================================
// 🖼️ LAZY LOADING DES IMAGES
// ========================================

// Intersection Observer pour lazy loading
const imageObserverOptions = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.01
};

const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        }
    });
}, imageObserverOptions);

// Initialiser le lazy loading
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// ========================================
// 👆 OPTIMISATIONS TACTILES
// ========================================

// Améliorer le feedback tactile
function initTouchOptimizations() {
    // Ajouter des zones de touch plus grandes pour les éléments interactifs
    const touchElements = document.querySelectorAll('.btn, .movie-card, .feature-card, .pricing-card');
    
    touchElements.forEach(element => {
        // Augmenter la zone de touch
        element.style.touchAction = 'manipulation';
        
        // Améliorer le feedback visuel
        element.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.98)';
        });
        
        element.addEventListener('touchend', function(e) {
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
        
        // Empêcher le zoom accidentel sur double tap
        element.addEventListener('touchend', function(e) {
            const now = Date.now();
            if (this.lastTouch && now - this.lastTouch < 300) {
                e.preventDefault();
            }
            this.lastTouch = now;
        });
    });
}

// ========================================
// 📱 OPTIMISATIONS iOS & ANDROID
// ========================================

// Détecter la plateforme
function detectPlatform() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    let os = 'unknown';
    let device = 'desktop';
    
    if (/Android/i.test(userAgent)) {
        os = 'android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
        os = 'ios';
    }
    
    if (/Mobile|Android|iP(hone|od)/i.test(userAgent)) {
        device = 'mobile';
    }
    
    return { os, device };
}

// Optimisations spécifiques iOS
function initIOSOptimizations() {
    const { os } = detectPlatform();
    
    if (os === 'ios') {
        // Corriger le zoom sur les inputs iOS
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (this.type !== 'range' && this.type !== 'color') {
                    setTimeout(() => {
                        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 500);
                }
            });
        });
        
        // Empêcher le bounce scroll sur iOS
        document.addEventListener('touchmove', function(e) {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY <= 0 && e.touches[0].clientY < e.touches[0].clientY) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Optimiser les performances des animations sur iOS
        const animatedElements = document.querySelectorAll('.hero-visual, .floating-card');
        animatedElements.forEach(el => {
            el.style.transformStyle = 'preserve-3d';
            el.style.willChange = 'transform';
        });
    }
}

// Optimisations spécifiques Android
function initAndroidOptimizations() {
    const { os } = detectPlatform();
    
    if (os === 'android') {
        // Améliorer les performances sur Android
        document.body.style.setProperty('--animation-duration', '0.2s');
        
        // Optimiser les images pour Android
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.style.imageRendering = '-webkit-optimize-contrast';
        });
    }
}

// ========================================
// 🚀 OPTIMISATIONS PERFORMANCE
// ========================================

// Optimiser les animations pour mobile
function optimizeAnimationsForMobile() {
    const { device } = detectPlatform();
    
    if (device === 'mobile') {
        // Réduire les animations sur mobile pour économiser la batterie
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.3s !important;
                transition-duration: 0.3s !important;
            }
            
            .floating-card {
                animation-duration: 8s !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// 📐 GESTION RESPONSIVE AVANCÉE
// ========================================

// Gérer les changements d'orientation
function handleOrientationChange() {
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Forcer un re-layout
            window.dispatchEvent(new Event('resize'));
            
            // Fermer le menu mobile en cas de rotation
            closeMobileMenu();
        }, 500);
    });
}

// Gérer les changements de taille d'écran
function handleResize() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Réinitialiser les animations si nécessaire
            const floatingCards = document.querySelectorAll('.floating-card');
            floatingCards.forEach(card => {
                card.style.animation = 'none';
                setTimeout(() => {
                    card.style.animation = '';
                }, 10);
            });
        }, 250);
    });
}

// ========================================
// 🔍 INITIALISATION COMPLÈTE MOBILE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le lazy loading
    initLazyLoading();
    
    // Initialiser les optimisations tactiles
    initTouchOptimizations();
    
    // Initialiser les optimisations iOS
    initIOSOptimizations();
    
    // Initialiser les optimisations Android
    initAndroidOptimizations();
    
    // Optimiser les animations pour mobile
    optimizeAnimationsForMobile();
    
    // Gérer l'orientation
    handleOrientationChange();
    
    // Gérer le redimensionnement
    handleResize();
    
    // Initialiser les animations des éléments
    const animateElements = document.querySelectorAll('.feature-card, .movie-card, .pricing-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Charger les films
    loadPopularMovies();
    
    // Vérifier l'authentification
    checkAuth();
});

// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input').value;
        alert('Merci de vous être abonné ! Vous recevrez nos dernières actualités.');
        newsletterForm.reset();
    });
}
