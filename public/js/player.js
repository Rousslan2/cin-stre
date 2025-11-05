// Récupérer l'ID du film depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

// Éléments du DOM
let video = document.getElementById('mainVideo');
let playPauseBtn = document.getElementById('playPauseBtn');
let volumeBtn = document.getElementById('volumeBtn');
let volumeSlider = document.getElementById('volumeSlider');
let currentTimeEl = document.getElementById('currentTime');
let durationEl = document.getElementById('duration');
let progressBar = document.getElementById('progressBar');
let progressHandle = document.getElementById('progressHandle');
let fullscreenBtn = document.getElementById('fullscreenBtn');
let centerPlayBtn = document.getElementById('centerPlayBtn');
let loadingOverlay = document.getElementById('loadingOverlay');
let videoControls = document.getElementById('videoControls');

// Flag pour savoir si on utilise un embed ou le lecteur HTML5
let isUsingEmbed = false;

// Charger les informations du film
async function loadMovieData() {
    try {
        // Vérifier l'authentification
        const authResponse = await fetch('/api/check-auth');
        const authData = await authResponse.json();

        const response = await fetch(`/api/movies/${movieId}`);
        const movie = await response.json();

        // Vérifier l'accès au film
        const isPremium = movie.premium;
        const hasAccess = !isPremium || (authData.authenticated && authData.user.subscription_type !== 'free');

        if (!hasAccess) {
            // Rediriger vers la page d'abonnement si pas d'accès
            showAccessDenied(movie);
            return;
        }

        // Mettre à jour les informations
        document.getElementById('movieTitle').textContent = movie.title;
        document.getElementById('moviePoster').src = movie.poster;
        document.getElementById('movieYear').textContent = movie.year;
        document.getElementById('movieDuration').textContent = movie.duration;
        document.getElementById('movieGenre').textContent = movie.genre;
        document.getElementById('movieRating').textContent = movie.rating;
        document.getElementById('movieDescription').textContent = movie.description;

        // Système de priorité pour l'affichage vidéo
        if (movie.embed_code && movie.embed_code.trim()) {
            // Priorité 1: Code embed (recommandé)
            console.log('✅ Code embed détecté - utilisation de l\'intégration embed');
            isUsingEmbed = true;
            showEmbedCode(movie.embed_code, movie.poster);
        } else if (movie.video_url) {
            // Priorité 2: URL directe ou lien d'hébergement
            if (movie.video_url.includes('.mp4') || movie.video_url.includes('.webm') || movie.video_url.includes('.ogg')) {
                // URL directe - utiliser le lecteur HTML5
                console.log('✅ URL directe détectée - utilisation du lecteur HTML5');
                video.src = movie.video_url;
                video.poster = movie.poster;
            } else if (movie.video_url.includes('youtube.com') || movie.video_url.includes('youtu.be')) {
                // YouTube - ouvrir dans un nouvel onglet
                console.log('⚠️ Lien YouTube détecté - ouverture externe');
                showExternalVideoMessage(movie.video_url);
            } else {
                // Lien d'hébergement externe - essayer iframe
                console.log('⚠️ Lien d\'hébergement externe détecté - tentative d\'intégration iframe');
                isUsingEmbed = true;
                tryIframeIntegration(movie.video_url);
            }
        } else {
            // Aucune source vidéo disponible
            console.error('❌ Aucune source vidéo disponible');
            showNoVideoMessage();
        }

        // Charger des films similaires
        loadSimilarMovies(movie.genre);
    } catch (error) {
        console.error('❌ Erreur lors du chargement du film:', error);
        showNoVideoMessage();
    }
}

// Afficher le message d'accès refusé
function showAccessDenied(movie) {
    const videoSection = document.querySelector('.video-player-section');
    videoSection.innerHTML = `
        <div class="access-denied">
            <div class="access-denied-content">
                <i class="fas fa-lock"></i>
                <h2>Contenu Premium</h2>
                <p>Ce film nécessite un abonnement premium pour être visionné.</p>
                <div class="subscription-info">
                    <h3>Abonnement requis</h3>
                    <p>Profitez d'un accès illimité à tous nos films premium</p>
                    <div class="pricing">
                        <span class="price">9.99€/mois</span>
                    </div>
                </div>
                <div class="actions">
                    <a href="subscription.html" class="btn btn-primary">S'abonner maintenant</a>
                    <a href="movies.html" class="btn btn-outline">Voir d'autres films</a>
                </div>
            </div>
        </div>
    `;

    // Masquer les sections d'informations du film
    document.querySelector('.movie-info-section').style.display = 'none';
    document.querySelector('.similar-movies').style.display = 'none';
}

// Charger des films similaires
async function loadSimilarMovies(genre) {
    try {
        const response = await fetch('/api/movies');
        const allMovies = await response.json();
        const similarMovies = allMovies
            .filter(m => m.id != movieId && m.genre.includes(genre.split(',')[0]))
            .slice(0, 6);
        
        const container = document.getElementById('similarMovies');
        container.innerHTML = similarMovies.map(movie => `
            <div class="movie-card" onclick="window.location.href='player.html?id=${movie.id}'">
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
        console.error('Erreur lors du chargement des films similaires:', error);
    }
}

// Contrôles vidéo - Ne s'appliquent que si on utilise le lecteur HTML5
function initializeVideoControls() {
    if (isUsingEmbed) return; // Ne pas initialiser les contrôles pour les embeds

    // Play/Pause
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
    if (centerPlayBtn) centerPlayBtn.addEventListener('click', togglePlayPause);
    if (video) video.addEventListener('click', togglePlayPause);

    // Mise à jour du temps
    if (video) video.addEventListener('timeupdate', updateProgress);

    // Barre de progression
    const progressBarContainer = document.querySelector('.progress-bar');
    if (progressBarContainer) {
        progressBarContainer.addEventListener('click', (e) => {
            if (!video) return;
            const rect = progressBarContainer.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            video.currentTime = percent * video.duration;
        });
    }

    // Volume
    if (volumeBtn) volumeBtn.addEventListener('click', toggleMute);
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            if (!video) return;
            video.volume = e.target.value / 100;
            updateVolumeIcon(e.target.value);
        });
    }

    // Plein écran
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Événements de chargement
    if (video) {
        video.addEventListener('loadstart', () => {
            if (loadingOverlay) loadingOverlay.classList.add('show');
        });

        video.addEventListener('canplay', () => {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
        });

        video.addEventListener('waiting', () => {
            if (loadingOverlay) loadingOverlay.classList.add('show');
        });

        video.addEventListener('playing', () => {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
        });
    }

    // Masquer les contrôles après inactivité
    let controlsTimeout;
    const videoPlayer = document.querySelector('.video-player');

    if (videoPlayer) {
        videoPlayer.addEventListener('mousemove', () => {
            if (!videoControls) return;
            videoControls.classList.add('show');
            clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                if (video && !video.paused) {
                    videoControls.classList.remove('show');
                }
            }, 3000);
        });

        videoPlayer.addEventListener('mouseleave', () => {
            if (video && !video.paused && videoControls) {
                videoControls.classList.remove('show');
            }
        });
    }
}

function togglePlayPause() {
    if (!video) return;
    if (video.paused) {
        video.play();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        if (centerPlayBtn) centerPlayBtn.classList.add('hide');
    } else {
        video.pause();
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        if (centerPlayBtn) centerPlayBtn.classList.remove('hide');
    }
}

function updateProgress() {
    if (!video || !video.duration) return;
    const percent = (video.currentTime / video.duration) * 100;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressHandle) progressHandle.style.left = `${percent}%`;
    
    if (currentTimeEl) currentTimeEl.textContent = formatTime(video.currentTime);
    if (durationEl) durationEl.textContent = formatTime(video.duration);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function toggleMute() {
    if (!video) return;
    video.muted = !video.muted;
    if (video.muted) {
        if (volumeBtn) volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        if (volumeSlider) volumeSlider.value = 0;
    } else {
        updateVolumeIcon(video.volume * 100);
        if (volumeSlider) volumeSlider.value = video.volume * 100;
    }
}

function updateVolumeIcon(volume) {
    if (!volumeBtn) return;
    if (volume == 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 50) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function toggleFullscreen() {
    if (!video) return;
    if (!document.fullscreenElement) {
        video.parentElement.requestFullscreen();
        if (fullscreenBtn) fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        if (fullscreenBtn) fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// Raccourcis clavier - Ne s'appliquent que si on utilise le lecteur HTML5
document.addEventListener('keydown', (e) => {
    if (isUsingEmbed) return; // Désactiver les raccourcis pour les embeds
    if (!video) return;

    switch(e.key) {
        case ' ':
        case 'k':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowRight':
            video.currentTime += 10;
            break;
        case 'ArrowLeft':
            video.currentTime -= 10;
            break;
        case 'ArrowUp':
            e.preventDefault();
            video.volume = Math.min(1, video.volume + 0.1);
            if (volumeSlider) volumeSlider.value = video.volume * 100;
            updateVolumeIcon(video.volume * 100);
            break;
        case 'ArrowDown':
            e.preventDefault();
            video.volume = Math.max(0, video.volume - 0.1);
            if (volumeSlider) volumeSlider.value = video.volume * 100;
            updateVolumeIcon(video.volume * 100);
            break;
        case 'f':
            toggleFullscreen();
            break;
        case 'm':
            toggleMute();
            break;
    }
});

// Masquer le header en plein écran
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        document.body.classList.add('hide-header');
    } else {
        document.body.classList.remove('hide-header');
    }
});

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
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (userMenu && userName) {
        userMenu.style.display = 'block';
        userName.textContent = user.name;
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

// Fonction pour essayer d'intégrer la vidéo dans un iframe
function tryIframeIntegration(videoUrl) {
    const videoContainer = document.querySelector('.video-player-section');

    // Créer un iframe pour intégrer la vidéo
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'iframe-video-container';
    iframeContainer.innerHTML = `
        <div class="iframe-video-wrapper">
            <iframe src="${videoUrl}"
                    frameborder="0"
                    marginwidth="0"
                    marginheight="0"
                    scrolling="no"
                    width="100%"
                    height="100%"
                    allowfullscreen
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    class="video-iframe"
                    referrerpolicy="no-referrer">
            </iframe>
            <div class="iframe-controls">
                <button onclick="goBackToPlayer()" class="btn btn-outline iframe-back-btn">
                    <i class="fas fa-arrow-left"></i>
                    Retour
                </button>
            </div>
            <div class="iframe-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Chargement de la vidéo...</p>
            </div>
        </div>
    `;

    videoContainer.innerHTML = '';
    videoContainer.appendChild(iframeContainer);

    // Masquer le loader après le chargement
    const iframe = iframeContainer.querySelector('.video-iframe');
    const loading = iframeContainer.querySelector('.iframe-loading');

    iframe.onload = () => {
        console.log('✅ Iframe chargé avec succès');
        if (loading) loading.style.display = 'none';
    };

    iframe.onerror = () => {
        console.error('❌ Erreur de chargement de l\'iframe');
        handleIframeError();
    };

    // Timeout de fallback (15 secondes pour les vidéos qui mettent du temps à charger)
    setTimeout(() => {
        if (loading) {
            console.log('⏱️ Timeout atteint - masquage du loader');
            loading.style.display = 'none';
        }
    }, 15000);

    // Masquer les autres sections
    document.querySelector('.movie-info-section').style.display = 'none';
    document.querySelector('.similar-movies').style.display = 'none';
}

// Fonction pour afficher un message pour les vidéos externes (fallback)
function showExternalVideoMessage(videoUrl) {
    const videoContainer = document.querySelector('.video-player-section');

    videoContainer.innerHTML = `
        <div class="external-video-notice">
            <div class="external-video-content">
                <i class="fas fa-external-link-alt"></i>
                <h2>Vidéo Hébergée Externement</h2>
                <p>Cette vidéo est hébergée sur un service externe. Cliquez sur le bouton ci-dessous pour la visionner.</p>
                <div class="external-video-actions">
                    <a href="${videoUrl}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-play"></i>
                        Visionner la vidéo
                    </a>
                    <button onclick="goBackToMovies()" class="btn btn-outline">
                        <i class="fas fa-arrow-left"></i>
                        Retour
                    </button>
                </div>
                <p class="external-notice">
                    <i class="fas fa-info-circle"></i>
                    La vidéo s'ouvrira dans un nouvel onglet.
                </p>
            </div>
        </div>
    `;

    // Masquer les autres sections
    document.querySelector('.movie-info-section').style.display = 'none';
    document.querySelector('.similar-movies').style.display = 'none';
}

// Fonction pour afficher un message quand aucune vidéo n'est disponible
function showNoVideoMessage() {
    const videoContainer = document.querySelector('.video-player-section');

    videoContainer.innerHTML = `
        <div class="no-video-notice">
            <div class="no-video-content">
                <i class="fas fa-video-slash"></i>
                <h2>Vidéo Non Disponible</h2>
                <p>Cette vidéo n'est pas encore disponible ou est en cours d'ajout.</p>
                <div class="no-video-actions">
                    <button onclick="goBackToMovies()" class="btn btn-primary">
                        <i class="fas fa-arrow-left"></i>
                        Retour aux films
                    </button>
                </div>
            </div>
        </div>
    `;

    // Masquer les autres sections
    document.querySelector('.movie-info-section').style.display = 'none';
    document.querySelector('.similar-movies').style.display = 'none';
}

// Fonction pour revenir au lecteur normal
function goBackToPlayer() {
    location.reload();
}

// Fonction pour revenir à la liste des films
function goBackToMovies() {
    window.location.href = 'movies.html';
}

// Fonction de fallback pour les iframes qui ne se chargent pas
function handleIframeError() {
    const loading = document.querySelector('.embed-loading, .iframe-loading');
    if (loading) {
        loading.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 48px; margin-bottom: 15px;"></i>
            <p style="margin-bottom: 15px;">Erreur de chargement de la vidéo</p>
            <button onclick="goBackToPlayer()" class="btn btn-primary" style="padding: 10px 20px; border-radius: 8px; background: var(--gradient); border: none; color: white; cursor: pointer; font-weight: 600;">
                <i class="fas fa-arrow-left" style="margin-right: 8px;"></i>
                Retour
            </button>
        `;
        loading.style.display = 'flex';
        loading.style.flexDirection = 'column';
        loading.style.alignItems = 'center';
    }
}

// Fonction pour afficher le code embed
function showEmbedCode(embedCode, posterUrl) {
    console.log('🎬 Affichage du code embed...');

    const videoContainer = document.querySelector('.video-player-section');

    // Nettoyer le code embed (supprimer les attributs problématiques)
    let cleanedEmbedCode = embedCode
        .replace(/width="[^"]*"/gi, '')
        .replace(/height="[^"]*"/gi, '')
        .replace(/style="[^"]*"/gi, '')
        // Remplacer toutes les références à player_blank.jpg par un placeholder SVG
        .replace(/https:\/\/[^\/]*\/[^\/]*\/player_blank\.jpg/gi, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwIi8+PC9zdmc+')
        .replace(/src="[^"]*player_blank\.jpg[^"]*"/gi, 'src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwIi8+PC9zdmc+"')
        .replace(/<img[^>]*src="[^"]*player_blank\.jpg[^"]*"[^>]*>/gi, '<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDAwIi8+PC9zdmc+" alt="Video Placeholder">');

    // Créer un conteneur pour l'embed
    const embedContainer = document.createElement('div');
    embedContainer.className = 'embed-video-container';
    embedContainer.innerHTML = `
        <div class="embed-video-wrapper" style="background-image: url('${posterUrl}'); background-size: cover; background-position: center;">
            <div class="embed-content">
                ${cleanedEmbedCode}
            </div>
            <div class="iframe-controls">
                <button onclick="goBackToMovies()" class="btn btn-outline iframe-back-btn">
                    <i class="fas fa-arrow-left"></i>
                    Retour
                </button>
            </div>
            <div class="embed-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Chargement de la vidéo...</p>
            </div>
        </div>
    `;

    videoContainer.innerHTML = '';
    videoContainer.appendChild(embedContainer);

    // Gérer le chargement de l'iframe
    const iframe = embedContainer.querySelector('iframe');
    const loading = embedContainer.querySelector('.embed-loading');

    if (iframe) {
        console.log('✅ Iframe trouvé dans l\'embed code');

        // Gestionnaire de chargement réussi
        iframe.onload = function() {
            console.log('✅ Iframe chargé avec succès');
            if (loading) {
                setTimeout(() => loading.style.display = 'none', 500);
            }
        };

        // Gestionnaire d'erreur
        iframe.onerror = function() {
            console.error('❌ Erreur de chargement de l\'iframe');
            handleIframeError();
        };

        // Timeout de sécurité (15 secondes pour les services d'hébergement lents)
        setTimeout(() => {
            if (loading && loading.style.display !== 'none') {
                console.log('⏱️ Timeout atteint - masquage du loader');
                loading.style.display = 'none';
            }
        }, 15000);
    } else {
        console.warn('⚠️ Aucun iframe trouvé dans le code embed');
        if (loading) loading.style.display = 'none';
    }

    // Masquer les autres sections
    document.querySelector('.movie-info-section').style.display = 'none';
    document.querySelector('.similar-movies').style.display = 'none';

    console.log('✅ Code embed injecté dans le DOM');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Initialisation du lecteur vidéo...');
    
    if (movieId) {
        loadMovieData().then(() => {
            // Initialiser les contrôles uniquement si on n'utilise pas d'embed
            if (!isUsingEmbed) {
                initializeVideoControls();
                console.log('✅ Contrôles vidéo HTML5 initialisés');
            } else {
                console.log('ℹ️ Mode embed activé - contrôles HTML5 désactivés');
            }
        });
        checkAuth();
    } else {
        console.error('❌ Aucun ID de film fourni');
        window.location.href = 'movies.html';
    }
});

console.log('✅ Lecteur vidéo initialisé avec support des codes embed amélioré');
