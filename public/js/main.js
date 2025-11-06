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
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    const heroMoviesBtn = document.getElementById('heroMoviesBtn');

    if (navButtons) navButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    if (heroRegisterBtn) heroRegisterBtn.style.display = 'inline-flex';
    if (heroMoviesBtn) heroMoviesBtn.style.display = 'none';
}

// Mettre à jour la navigation pour un utilisateur connecté
function updateNavForAuthenticatedUser(user) {
    const navButtons = document.querySelector('.nav-buttons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminMenuBtn = document.getElementById('adminMenuBtn');

    if (navButtons && userMenu && userName) {
        navButtons.style.display = 'none';
        userMenu.style.display = 'block';
        userName.textContent = user.name;
        
        // Afficher le bouton admin uniquement pour les administrateurs
        if (adminMenuBtn && user.role === 'admin') {
            adminMenuBtn.style.display = 'block';
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
