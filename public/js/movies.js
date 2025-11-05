let allMovies = [];
let filteredMovies = [];
let currentFilter = 'all';
let currentUser = null;

// Vérifier l'authentification et charger les films
async function loadAllMovies() {
    try {
        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('noResults').style.display = 'none';

        // Vérifier l'authentification
        const authResponse = await fetch('/api/check-auth');
        const authData = await authResponse.json();

        if (authData.authenticated) {
            currentUser = authData.user;
        }

        const response = await fetch('/api/movies');
        allMovies = await response.json();
        filteredMovies = allMovies;

        displayMovies(filteredMovies);
        document.getElementById('loadingSpinner').style.display = 'none';
    } catch (error) {
        console.error('Erreur lors du chargement des films:', error);
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

// Afficher les films
function displayMovies(movies) {
    const grid = document.getElementById('moviesGrid');

    if (movies.length === 0) {
        grid.innerHTML = '';
        document.getElementById('noResults').style.display = 'block';
        return;
    }

    document.getElementById('noResults').style.display = 'none';

    grid.innerHTML = movies.map(movie => {
        const isPremium = movie.premium;
        const hasAccess = !isPremium || (currentUser && currentUser.subscription_type !== 'free');
        const canWatch = hasAccess;

        return `
            <div class="movie-card ${!canWatch ? 'premium-locked' : ''}" onclick="${canWatch ? `goToMovie(${movie.id})` : `showSubscriptionPrompt(${movie.id})`}">
                ${isPremium ? '<div class="premium-badge"><i class="fas fa-crown"></i> Premium</div>' : ''}
                ${!canWatch ? '<div class="lock-overlay"><i class="fas fa-lock"></i><span>Abonnement requis</span></div>' : ''}
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
                <div class="movie-overlay">
                    <div class="play-button">
                        <i class="fas fa-${canWatch ? 'play' : 'lock'}"></i>
                    </div>
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-description">${movie.description}</p>
                    <div class="movie-meta">
                        <span class="movie-year">${movie.year}</span>
                        <span class="movie-genre">${movie.genre.split(',')[0]}</span>
                        <div class="movie-rating">
                            <i class="fas fa-star"></i>
                            <span>${movie.rating}</span>
                        </div>
                        <span class="movie-duration">${movie.duration}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filtrer par catégorie
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Retirer la classe active de tous les boutons
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        currentFilter = filter;
        
        if (filter === 'all') {
            filteredMovies = allMovies;
        } else if (filter === 'premium') {
            filteredMovies = allMovies.filter(movie => movie.premium);
        } else {
            filteredMovies = allMovies.filter(movie => 
                movie.genre.toLowerCase().includes(filter.toLowerCase())
            );
        }
        
        displayMovies(filteredMovies);
    });
});

// Recherche
const searchInput = document.getElementById('searchInput');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (searchTerm === '') {
            filteredMovies = currentFilter === 'all' ? allMovies : 
                            currentFilter === 'premium' ? allMovies.filter(m => m.premium) :
                            allMovies.filter(m => m.genre.toLowerCase().includes(currentFilter.toLowerCase()));
        } else {
            filteredMovies = allMovies.filter(movie => 
                movie.title.toLowerCase().includes(searchTerm) ||
                movie.description.toLowerCase().includes(searchTerm) ||
                movie.genre.toLowerCase().includes(searchTerm)
            );
        }
        
        displayMovies(filteredMovies);
    }, 300);
});

// Changer la vue (grille/liste)
document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const view = btn.getAttribute('data-view');
        const grid = document.getElementById('moviesGrid');
        
        if (view === 'list') {
            grid.classList.add('list-view');
        } else {
            grid.classList.remove('list-view');
        }
    });
});

// Rediriger vers le lecteur
function goToMovie(movieId) {
    window.location.href = `player.html?id=${movieId}`;
}

// Afficher le prompt d'abonnement
function showSubscriptionPrompt(movieId) {
    // Créer un modal de prompt d'abonnement
    const modal = document.createElement('div');
    modal.className = 'subscription-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-crown"></i> Contenu Premium</h3>
                <button class="close-modal" onclick="closeSubscriptionModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Ce film nécessite un abonnement premium pour être visionné.</p>
                <div class="subscription-options">
                    <div class="option">
                        <h4>Abonnement Mensuel</h4>
                        <p>Accès illimité à tous les films premium</p>
                        <span class="price">9.99€/mois</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeSubscriptionModal()">Plus tard</button>
                <a href="subscription.html" class="btn btn-primary">S'abonner maintenant</a>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Fermer le modal en cliquant en dehors
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSubscriptionModal();
        }
    });
}

// Fermer le modal d'abonnement
function closeSubscriptionModal() {
    const modal = document.querySelector('.subscription-modal');
    if (modal) {
        modal.remove();
    }
}

// Animation au scroll
const movieObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observer les cartes de films après le chargement
function observeMovieCards() {
    const cards = document.querySelectorAll('.movie-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        movieObserver.observe(card);
    });
}

// Vérifier l'authentification et mettre à jour la navigation
async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();

        if (data.authenticated) {
            updateNavForAuthenticatedUser(data.user);
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
    }
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
}

// Déconnexion
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadAllMovies().then(() => {
        setTimeout(observeMovieCards, 100);
    });
    checkAuth();
});