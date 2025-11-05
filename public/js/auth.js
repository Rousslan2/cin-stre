// Fonction pour afficher les messages
function showMessage(message, type = 'error') {
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    const form = document.querySelector('.auth-form');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Retirer le message après 5 secondes
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Gestion de l'inscription
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };
        
        // Validation
        if (formData.password !== formData.confirmPassword) {
            showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        if (formData.password.length < 8) {
            showMessage('Le mot de passe doit contenir au moins 8 caractères', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Inscription réussie ! Redirection...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(data.error || 'Erreur lors de l\'inscription', 'error');
            }
        } catch (error) {
            showMessage('Erreur de connexion au serveur', 'error');
            console.error('Erreur:', error);
        }
    });
}

// Gestion de la connexion
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showMessage('Connexion réussie ! Redirection...', 'success');
                setTimeout(() => {
                    // Rediriger vers la page d'accueil pour mettre à jour l'interface
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage(data.error || 'Email ou mot de passe incorrect', 'error');
            }
        } catch (error) {
            showMessage('Erreur de connexion au serveur', 'error');
            console.error('Erreur:', error);
        }
    });
}

// Boutons de connexion sociale (simulation)
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = btn.classList.contains('google') ? 'Google' : 'Facebook';
        showMessage(`Connexion avec ${provider} en cours de développement`, 'error');
    });
});

// Animation des inputs
document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// Validation en temps réel du mot de passe
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
        if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Les mots de passe ne correspondent pas');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    });
}
