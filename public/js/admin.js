// Fonction pour changer d'option vidéo
function switchVideoOption(option) {
    // Masquer toutes les options
    document.querySelectorAll('.video-option').forEach(opt => {
        opt.classList.remove('active');
    });

    // Désactiver tous les onglets
    document.querySelectorAll('.option-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Activer l'option sélectionnée
    document.getElementById(`${option}-option`).classList.add('active');
    document.querySelector(`[data-option="${option}"]`).classList.add('active');
}

// Variables globales
let editingMovieId = null;
let isSubmitting = false;
let selectedFile = null;

// Vérifier l'accès admin au chargement
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();

        if (!data.authenticated || data.user.role !== 'admin') {
            window.location.href = 'login.html';
            return;
        }

        // Initialiser l'interface admin
        initializeAdminInterface(data.user);

        // Charger les données du tableau de bord
        loadDashboardStats();
        loadUsers();
        loadMovies();

        // Initialiser l'upload de fichiers
        initializeFileUpload();

    } catch (error) {
        console.error('Erreur lors de la vérification admin:', error);
        window.location.href = 'login.html';
    }
});

// Initialiser l'interface admin
function initializeAdminInterface(user) {
    document.getElementById('adminName').textContent = user.name;

    // Gestionnaire de navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('.nav-item').getAttribute('data-section');
            switchSection(section);
        });
    });
}

// Changer de section
function switchSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Désactiver tous les éléments de navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Activer la section et l'élément de navigation sélectionnés
    document.getElementById(`${sectionName}-section`).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
}

// Charger les statistiques du tableau de bord
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/stats');
        const stats = await response.json();

        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalSubscribers').textContent = stats.totalSubscribers;
        document.getElementById('totalMovies').textContent = stats.totalMovies;
        document.getElementById('totalPremiumMovies').textContent = stats.totalPremiumMovies;

        // Charger les statistiques d'abonnement pour la section abonnements
        loadSubscriptionStats();
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Charger les statistiques d'abonnement
async function loadSubscriptionStats() {
    try {
        const response = await fetch('/api/admin/subscription-stats');
        const stats = await response.json();

        document.getElementById('basicCount').textContent = stats.basic;
        document.getElementById('standardCount').textContent = stats.standard;
        document.getElementById('premiumCount').textContent = stats.premium;
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques d\'abonnement:', error);
    }
}

// Charger la liste des utilisateurs
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();

        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="subscription-badge ${user.subscription_type}">
                        ${getSubscriptionDisplayName(user.subscription_type)}
                    </span>
                </td>
                <td>
                    <span class="role-badge ${user.role}">
                        ${getRoleDisplayName(user.role)}
                    </span>
                </td>
                <td>${new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                <td>
                    <button class="action-btn edit" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn ${user.role === 'admin' ? 'admin' : 'delete'}"
                            onclick="${user.role === 'admin' ? 'toggleAdminRole' : 'deleteUser'}(${user.id})">
                        <i class="fas fa-${user.role === 'admin' ? 'user' : 'trash'}"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
}

// Charger la liste des films
async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        const movies = await response.json();

        const container = document.getElementById('moviesGridAdmin');
        container.innerHTML = movies.map(movie => `
            <div class="movie-card-admin">
                ${movie.premium ? '<div class="premium-badge"><i class="fas fa-crown"></i> Premium</div>' : ''}
                <img src="${movie.poster}" alt="${movie.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <div class="movie-meta">
                        <span>${movie.year}</span>
                        <span>${movie.genre}</span>
                    </div>
                </div>
                <div class="movie-actions">
                    <button class="action-btn edit" onclick="editMovie(${movie.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteMovie(${movie.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur lors du chargement des films:', error);
        showMessage('Erreur lors du chargement des films', 'error');
    }
}

// Fonctions utilitaires
function getSubscriptionDisplayName(type) {
    const names = {
        'free': 'Gratuit',
        'basic': 'Basique',
        'standard': 'Standard',
        'premium': 'Premium'
    };
    return names[type] || 'Gratuit';
}

function getRoleDisplayName(role) {
    const names = {
        'user': 'Utilisateur',
        'admin': 'Administrateur'
    };
    return names[role] || 'Utilisateur';
}

// Gestion des utilisateurs
async function toggleAdminRole(userId) {
    if (!confirm('Êtes-vous sûr de vouloir changer le rôle de cet utilisateur ?')) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: 'user' })
        });

        if (response.ok) {
            showMessage('Rôle mis à jour avec succès', 'success');
            loadUsers();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

async function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Utilisateur supprimé avec succès', 'success');
            loadUsers();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

// Gestion des films
function openAddMovieModal() {
    // Remettre à zéro l'état d'édition
    editingMovieId = null;
    isSubmitting = false;
    
    // Changer le titre et le bouton
    document.querySelector('.modal-header h2').textContent = 'Ajouter un film';
    const submitBtn = document.querySelector('.modal-actions .btn-primary');
    submitBtn.textContent = 'Ajouter le film';
    submitBtn.disabled = false;

    // Réinitialiser le formulaire
    document.getElementById('addMovieForm').reset();
    switchVideoOption('embed');

    // Ouvrir le modal
    document.getElementById('addMovieModal').classList.add('active');
    
    console.log('🎬 Modal ouvert en mode AJOUT, editingMovieId =', editingMovieId);
}

// Initialiser l'upload de fichiers
function initializeFileUpload() {
    const fileInput = document.getElementById('movieFile');
    const uploadArea = document.getElementById('fileUploadArea');

    if (!fileInput || !uploadArea) return;

    // Gestionnaire de clic sur la zone d'upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target.closest('.btn')) return; // Ne pas déclencher si clic sur le bouton
        fileInput.click();
    });

    // Gestionnaire de changement de fichier
    fileInput.addEventListener('change', handleFileSelection);

    // Gestionnaire de drag & drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        console.log('Fichiers déposés:', files.length);
        if (files.length > 0) {
            handleFileSelection({ target: { files }, dataTransfer: { files } });
        }
    });
}

// Gérer la sélection de fichier
function handleFileSelection(event) {
    const files = event.target.files || event.dataTransfer.files;
    const file = files[0];
    if (!file) {
        console.log('Aucun fichier détecté');
        return;
    }

    console.log('Fichier sélectionné:', file.name, file.type, file.size);

    // Vérifier le type de fichier (plus permissif)
    const validExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mkv'];
    const fileName = file.name.toLowerCase();
    const isValidType = file.type.startsWith('video/') || validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidType) {
        showMessage('Veuillez sélectionner un fichier vidéo valide (MP4, WebM, OGG, AVI, MKV)', 'error');
        return;
    }

    // Vérifier la taille (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
        showMessage('Le fichier est trop volumineux (maximum 500MB)', 'error');
        return;
    }

    selectedFile = file;
    updateUploadUI(file);
    console.log('Fichier accepté et interface mise à jour');
}

// Mettre à jour l'interface d'upload
function updateUploadUI(file) {
    const uploadArea = document.getElementById('fileUploadArea');
    const uploadContent = uploadArea.querySelector('.upload-content');
    const uploadProgress = uploadArea.querySelector('.upload-progress');
    const fileInfo = uploadArea.querySelector('.file-info');
    const fileInfoText = document.getElementById('fileInfoText');

    uploadArea.classList.add('has-file');
    uploadContent.style.display = 'none';
    uploadProgress.style.display = 'none';
    fileInfo.style.display = 'block';

    if (fileInfoText) {
        fileInfoText.textContent = `${file.name} (${formatFileSize(file.size)}) - Prêt pour l'upload`;
    }
    console.log('Fichier accepté et interface mise à jour');
}

// Afficher l'URL de la vidéo après upload
function showVideoUrl(url) {
    const videoInput = document.getElementById('movieVideo');
    const videoUrlStatus = document.getElementById('videoUrlStatus');
    const videoUrlDisplay = document.getElementById('videoUrlDisplay');
    
    if (videoInput && videoUrlStatus && videoUrlDisplay) {
        videoInput.value = url;
        videoInput.style.borderColor = 'rgba(34, 197, 94, 0.5)';
        videoInput.style.background = 'rgba(34, 197, 94, 0.05)';
        
        videoUrlDisplay.textContent = url;
        videoUrlStatus.style.display = 'block';
        videoUrlStatus.style.background = 'rgba(34, 197, 94, 0.1)';
        videoUrlStatus.style.borderLeft = '4px solid #4ade80';
        
        console.log('✅ URL de la vidéo affichée:', url);
    }
}

// Formater la taille du fichier
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    isSubmitting = false;
    editingMovieId = null;
    selectedFile = null;
    
    // Réinitialiser l'upload de fichier
    const uploadArea = document.getElementById('fileUploadArea');
    if (uploadArea) {
        uploadArea.classList.remove('has-file');
        const uploadContent = uploadArea.querySelector('.upload-content');
        const fileInfo = uploadArea.querySelector('.file-info');
        if (uploadContent) uploadContent.style.display = 'flex';
        if (fileInfo) fileInfo.style.display = 'none';
    }
    
    // Réinitialiser l'affichage de l'URL vidéo
    const videoInput = document.getElementById('movieVideo');
    const videoUrlStatus = document.getElementById('videoUrlStatus');
    if (videoInput) {
        videoInput.style.borderColor = '';
        videoInput.style.background = '';
    }
    if (videoUrlStatus) {
        videoUrlStatus.style.display = 'none';
    }
}

// Fonction pour afficher l'état de chargement
function setSubmitButtonLoading(isLoading) {
    const submitBtn = document.querySelector('.modal-actions .btn-primary');
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
    } else {
        submitBtn.disabled = false;
        const isEditing = editingMovieId !== null;
        submitBtn.textContent = isEditing ? 'Modifier le film' : 'Ajouter le film';
    }
}

// Gestionnaire du formulaire d'ajout/modification de film
document.getElementById('addMovieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Empêcher les doubles soumissions
    if (isSubmitting) {
        console.log('⚠️ Soumission déjà en cours...');
        return;
    }
    
    isSubmitting = true;
    setSubmitButtonLoading(true);
    
    const isEditing = editingMovieId !== null;
    console.log('🎬 Début de la soumission, Mode:', isEditing ? 'MODIFICATION' : 'AJOUT');
    console.log('📝 editingMovieId =', editingMovieId);

    try {
        // Récupérer les données selon l'option sélectionnée
        const activeOption = document.querySelector('.option-tab.active').getAttribute('data-option');
        console.log('Option vidéo sélectionnée:', activeOption);
        
        let formData = {
            title: document.getElementById('movieTitle').value.trim(),
            year: parseInt(document.getElementById('movieYear').value),
            description: document.getElementById('movieDescription').value.trim(),
            genre: document.getElementById('movieGenre').value.trim(),
            duration: document.getElementById('movieDuration').value.trim(),
            poster: document.getElementById('moviePoster').value.trim(),
            rating: parseFloat(document.getElementById('movieRating').value) || 0,
            premium: document.getElementById('moviePremium').checked
        };

        // Validation basique
        if (!formData.title || !formData.year || !formData.description || !formData.genre) {
            showMessage('Veuillez remplir tous les champs obligatoires', 'error');
            isSubmitting = false;
            setSubmitButtonLoading(false);
            return;
        }

        // Ajouter les données selon l'option choisie
        if (activeOption === 'embed') {
            formData.embed_code = document.getElementById('movieEmbed').value.trim();
            formData.video_url = '';
            formData.trailer = '';

            if (!formData.embed_code) {
                showMessage('Veuillez entrer le code embed', 'error');
                isSubmitting = false;
                setSubmitButtonLoading(false);
                return;
            }
        } else if (activeOption === 'url') {
            formData.trailer = document.getElementById('movieTrailer').value.trim();
            formData.video_url = document.getElementById('movieVideo').value.trim();
            formData.embed_code = '';

            // Si un fichier est sélectionné, l'uploader d'abord
            if (selectedFile) {
                try {
                    console.log('Début de l\'upload du fichier:', selectedFile.name, selectedFile.type, selectedFile.size, 'bytes');
                    
                    const uploadFormData = new FormData();
                    uploadFormData.append('video', selectedFile);

                    showMessage('Upload en cours... Cela peut prendre quelques instants.', 'info');

                    const uploadResponse = await fetch('/api/admin/upload-video', {
                        method: 'POST',
                        body: uploadFormData
                    });

                    console.log('Réponse upload reçue, status:', uploadResponse.status);

                    if (uploadResponse.ok) {
                        const uploadData = await uploadResponse.json();
                        formData.video_url = uploadData.fileUrl;
                        console.log('✅ Fichier uploadé avec succès:', uploadData.fileUrl);
                        
                        // Afficher l'URL dans le champ
                        showVideoUrl(uploadData.fileUrl);
                        
                        showMessage('Fichier uploadé avec succès! L\'URL a été remplie automatiquement.', 'success');
                    } else {
                        const uploadError = await uploadResponse.json();
                        console.error('❌ Erreur upload serveur:', uploadError);
                        showMessage(uploadError.error || 'Erreur lors de l\'upload', 'error');
                        isSubmitting = false;
                        setSubmitButtonLoading(false);
                        return;
                    }
                } catch (uploadError) {
                    console.error('❌ Erreur upload (exception):', uploadError);
                    showMessage('Erreur lors de l\'upload du fichier: ' + uploadError.message, 'error');
                    isSubmitting = false;
                    setSubmitButtonLoading(false);
                    return;
                }
            }

            if (!formData.video_url) {
                showMessage('Veuillez entrer l\'URL de la vidéo ou uploader un fichier', 'error');
                isSubmitting = false;
                setSubmitButtonLoading(false);
                return;
            }
        } else if (activeOption === 'youtube') {
            formData.trailer = document.getElementById('movieYoutube').value.trim();
            formData.video_url = '';
            formData.embed_code = '';

            if (!formData.trailer) {
                showMessage('Veuillez entrer l\'URL YouTube', 'error');
                isSubmitting = false;
                setSubmitButtonLoading(false);
                return;
            }
        }

        console.log('📦 Données à envoyer:', formData);

        const url = isEditing ? `/api/admin/movies/${editingMovieId}` : '/api/admin/movies';
        const method = isEditing ? 'PUT' : 'POST';

        console.log(`📡 Envoi requête ${method} vers ${url}`);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('📨 Réponse reçue, status:', response.status);

        if (response.ok) {
            const responseData = await response.json();
            console.log('✅ Succès:', responseData);
            
            const message = isEditing ? '✅ Film modifié avec succès' : '✅ Film ajouté avec succès';
            showMessage(message, 'success');
            
            // Fermer le modal
            closeModal('addMovieModal');
            
            // Réinitialiser le formulaire
            document.getElementById('addMovieForm').reset();

            // Recharger les films
            await loadMovies();
            
            // Changer vers la section films pour voir le résultat
            switchSection('movies');
        } else {
            const data = await response.json();
            console.error('❌ Erreur serveur:', data);
            showMessage(data.error || 'Erreur lors de la sauvegarde', 'error');
        }
    } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    } finally {
        isSubmitting = false;
        setSubmitButtonLoading(false);
        console.log('🏁 Fin de la soumission');
    }
});

// Sauvegarder les paramètres
function saveSettings() {
    showMessage('Paramètres sauvegardés avec succès', 'success');
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

// Afficher un message
function showMessage(message, type = 'error') {
    // Supprimer les messages existants
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;

    const adminContent = document.querySelector('.admin-content');
    adminContent.insertBefore(messageDiv, adminContent.firstChild);

    // Faire défiler vers le message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Supprimer le message après 5 secondes
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Éditer un utilisateur
async function editUser(userId) {
    try {
        const response = await fetch(`/api/admin/users/${userId}`);
        if (!response.ok) {
            showMessage('Utilisateur non trouvé', 'error');
            return;
        }
        const user = await response.json();

        const newName = prompt('Nouveau nom:', user.name);
        const newEmail = prompt('Nouvel email:', user.email);

        if (newName && newEmail) {
            const updateResponse = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, name: newName, email: newEmail })
            });

            if (updateResponse.ok) {
                showMessage('Utilisateur mis à jour avec succès', 'success');
                loadUsers();
            } else {
                showMessage('Erreur lors de la mise à jour', 'error');
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

// Exporter les données utilisateurs
function exportUserData() {
    showMessage('Fonction d\'export à implémenter', 'error');
}

// Envoyer une newsletter
function sendNewsletter() {
    showMessage('Fonction newsletter à implémenter', 'error');
}

// ⭐ CORRIGÉ : Éditer un film (sans réinitialiser editingMovieId)
async function editMovie(movieId) {
    try {
        console.log('🎬 Ouverture du mode édition pour le film ID:', movieId);
        
        const response = await fetch(`/api/movies/${movieId}`);
        if (!response.ok) {
            showMessage('Film non trouvé', 'error');
            return;
        }
        const movie = await response.json();
        
        console.log('📦 Données du film récupérées:', movie);

        // CRITIQUE : Définir editingMovieId AVANT d'ouvrir le modal
        editingMovieId = movieId;
        isSubmitting = false;
        console.log('✅ editingMovieId défini sur:', editingMovieId);

        // Réinitialiser le formulaire
        document.getElementById('addMovieForm').reset();
        
        // Ouvrir le modal MANUELLEMENT (sans appeler openAddMovieModal)
        document.getElementById('addMovieModal').classList.add('active');

        // Changer le titre et le bouton pour indiquer la MODIFICATION
        document.querySelector('.modal-header h2').textContent = 'Modifier le film';
        const submitBtn = document.querySelector('.modal-actions .btn-primary');
        submitBtn.textContent = 'Modifier le film';
        submitBtn.disabled = false;

        // Remplir le formulaire avec les données existantes
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieYear').value = movie.year;
        document.getElementById('movieDescription').value = movie.description;
        document.getElementById('movieGenre').value = movie.genre;
        document.getElementById('movieDuration').value = movie.duration;
        document.getElementById('moviePoster').value = movie.poster || '';
        document.getElementById('movieRating').value = movie.rating || 0;
        document.getElementById('moviePremium').checked = movie.premium === 1 || movie.premium === true;

        // Gérer les options vidéo selon les données disponibles
        if (movie.embed_code && movie.embed_code.trim()) {
            console.log('📺 Mode: Embed Code');
            switchVideoOption('embed');
            document.getElementById('movieEmbed').value = movie.embed_code;
        } else if (movie.trailer && movie.trailer.includes('youtube.com')) {
            console.log('📺 Mode: YouTube');
            switchVideoOption('youtube');
            document.getElementById('movieYoutube').value = movie.trailer;
        } else {
            console.log('📺 Mode: URL Directe');
            switchVideoOption('url');
            document.getElementById('movieTrailer').value = movie.trailer || '';
            document.getElementById('movieVideo').value = movie.video_url || '';
        }
        
        console.log('✅ Formulaire rempli en mode MODIFICATION, editingMovieId =', editingMovieId);

    } catch (error) {
        console.error('❌ Erreur lors de l\'édition:', error);
        showMessage('Erreur de connexion', 'error');
    }
}

// Supprimer un film
async function deleteMovie(movieId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce film ? Cette action est irréversible.')) return;

    try {
        const response = await fetch(`/api/admin/movies/${movieId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Film supprimé avec succès', 'success');
            loadMovies();
        } else {
            const data = await response.json();
            showMessage(data.error || 'Erreur lors de la suppression', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion', 'error');
    }
}
