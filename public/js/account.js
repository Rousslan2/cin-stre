// Gestionnaire de sections
let currentSection = 'profile';

// Vérifier l'authentification au chargement
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/check-auth');
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = 'login.html';
            return;
        }

        // Mettre à jour l'interface utilisateur
        updateUserInterface(data.user);

        // Charger les données du profil
        loadUserProfile(data.user);

        // Charger les données d'abonnement
        loadSubscriptionData(data.user);

        // Initialiser les gestionnaires d'événements
        initializeEventListeners();

    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        window.location.href = 'login.html';
    }
});

// Mettre à jour l'interface utilisateur
function updateUserInterface(user) {
    // Mettre à jour la navigation
    const navButtons = document.querySelector('.nav-buttons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminMenuBtn = document.getElementById('adminMenuBtn');
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserEmail = document.getElementById('sidebarUserEmail');

    if (navButtons && userMenu && userName) {
        navButtons.style.display = 'none';
        userMenu.style.display = 'block';
        userName.textContent = user.name;
        
        // Afficher le bouton admin uniquement pour les administrateurs
        if (adminMenuBtn && user.role === 'admin') {
            adminMenuBtn.style.display = 'block';
        }
    }

    if (sidebarUserName) sidebarUserName.textContent = user.name;
    if (sidebarUserEmail) sidebarUserEmail.textContent = user.email;
}

// Charger les données du profil
function loadUserProfile(user) {
    document.getElementById('name').value = user.name;
    document.getElementById('email').value = user.email;
}

// Charger les données d'abonnement
function loadSubscriptionData(user) {
    const subscriptionStatus = document.getElementById('subscriptionStatus');

    if (subscriptionStatus) {
        const planName = getPlanDisplayName(user.subscription_type);
        const statusClass = user.subscription_type === 'free' ? 'free' : 'premium';

        subscriptionStatus.innerHTML = `
            <h3>Plan actuel: ${planName}</h3>
            <p>Type d'abonnement: ${user.subscription_type === 'free' ? 'Gratuit' : 'Premium'}</p>
            ${user.subscription_end ? `<p>Expire le: ${new Date(user.subscription_end).toLocaleDateString('fr-FR')}</p>` : ''}
            <span class="status-badge ${statusClass}">${user.subscription_type === 'free' ? 'Gratuit' : 'Premium'}</span>
        `;
    }
}

// Obtenir le nom d'affichage du plan
function getPlanDisplayName(planType) {
    const plans = {
        'free': 'Gratuit',
        'basic': 'Basique',
        'standard': 'Standard',
        'premium': 'Premium'
    };
    return plans[planType] || 'Gratuit';
}

// Initialiser les gestionnaires d'événements
function initializeEventListeners() {
    // Navigation dans le compte
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('.nav-link').getAttribute('data-section');
            switchSection(section);
        });
    });

    // Formulaire de profil
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Formulaire de mot de passe
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    // Formulaire de préférences
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', handlePreferencesUpdate);
    }
}

// Changer de section
function switchSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Désactiver tous les liens de navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Activer la section et le lien sélectionnés
    document.getElementById(`${sectionName}-section`).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    currentSection = sectionName;
}

// Gérer la mise à jour du profil
async function handleProfileUpdate(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Désactiver le bouton et afficher le chargement
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

    try {
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value
        };

        const response = await fetch('/api/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Profil mis à jour avec succès !', 'success');
            // Mettre à jour l'interface
            updateUserInterface(data.user);
        } else {
            showMessage(data.error || 'Erreur lors de la mise à jour', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    } finally {
        // Réactiver le bouton
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Gérer le changement de mot de passe
async function handlePasswordChange(e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showMessage('Le mot de passe doit contenir au moins 8 caractères', 'error');
        return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changement...';

    try {
        const formData = {
            currentPassword: document.getElementById('currentPassword').value,
            newPassword: newPassword
        };

        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Mot de passe changé avec succès !', 'success');
            form.reset();
        } else {
            showMessage(data.error || 'Erreur lors du changement', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Gérer la mise à jour des préférences
async function handlePreferencesUpdate(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

    try {
        const formData = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            marketingEmails: document.getElementById('marketingEmails').checked,
            language: document.getElementById('language').value
        };

        const response = await fetch('/api/update-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Préférences enregistrées avec succès !', 'success');
        } else {
            showMessage(data.error || 'Erreur lors de la sauvegarde', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur de connexion au serveur', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Annuler l'abonnement
function cancelSubscription() {
    if (confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez l\'accès aux films premium.')) {
        // Ici, vous pouvez implémenter la logique d'annulation
        showMessage('Fonctionnalité d\'annulation à implémenter', 'error');
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

// Afficher un message
function showMessage(message, type = 'error') {
    // Supprimer les messages existants
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;

    const currentSectionEl = document.getElementById(`${currentSection}-section`);
    currentSectionEl.insertBefore(messageDiv, currentSectionEl.firstChild);

    // Faire défiler vers le message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Supprimer le message après 5 secondes
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}