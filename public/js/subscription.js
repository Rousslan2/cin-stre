// Toggle entre tarification mensuelle et annuelle
document.querySelectorAll('.billing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.billing-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const billing = btn.getAttribute('data-billing');
        updatePrices(billing);
    });
});

function updatePrices(billing) {
    document.querySelectorAll('.plan-card').forEach(card => {
        const monthlyPrice = card.querySelector('.price.monthly');
        const yearlyPrice = card.querySelector('.price.yearly');
        
        if (billing === 'yearly') {
            monthlyPrice.style.display = 'none';
            yearlyPrice.style.display = 'inline';
        } else {
            monthlyPrice.style.display = 'inline';
            yearlyPrice.style.display = 'none';
        }
    });
}

// Gestion des FAQ
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        // Fermer tous les autres items
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Toggle l'item actuel
        item.classList.toggle('active');
    });
});

// Fonction de souscription
async function subscribe(plan) {
    try {
        // Vérifier si l'utilisateur est connecté
        const authResponse = await fetch('/api/check-auth');
        const authData = await authResponse.json();
        
        if (!authData.authenticated) {
            // Rediriger vers la page d'inscription avec le plan sélectionné
            window.location.href = `register.html?plan=${plan}`;
            return;
        }
        
        // Soumettre l'abonnement
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Abonnement au plan ${plan} réussi ! Vous pouvez maintenant profiter de tous les avantages.`);
            // Utiliser la redirection du serveur si disponible, sinon aller vers movies.html
            window.location.href = data.redirect || 'movies.html';
        } else {
            alert(data.error || 'Erreur lors de la souscription');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Animation au scroll
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
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
    const navButtons = document.querySelector('.nav-buttons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (navButtons && userMenu && userName) {
        navButtons.style.display = 'none';
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

// Observer les cartes de plans
document.addEventListener('DOMContentLoaded', () => {
    const planCards = document.querySelectorAll('.plan-card');
    planCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

    // Observer les items FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });

    // Vérifier l'authentification
    checkAuth();
});

// Effet de parallaxe subtil sur les cartes
document.querySelectorAll('.plan-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});
