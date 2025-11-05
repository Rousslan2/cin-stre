const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use(session({
    secret: 'streaming-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 heures
}));

// Base de données SQLite
const db = new sqlite3.Database('./streaming.db', (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connecté à la base de données SQLite');
        initDatabase().catch(console.error);
    }
});

// Initialisation de la base de données
async function initDatabase() {
    // Créer la table users
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        subscription_type TEXT DEFAULT 'free',
        subscription_end DATE,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, async (err) => {
        if (err) {
            console.error('Erreur création table users:', err);
        } else {
            console.log('✓ Table users créée/vérifiée');
        }
    });

    // Créer la table movies
    db.run(`CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        year INTEGER,
        duration TEXT,
        genre TEXT,
        rating REAL,
        poster TEXT,
        trailer TEXT,
        video_url TEXT,
        premium BOOLEAN DEFAULT 0,
        embed_code TEXT
    )`, (err) => {
        if (err) {
            console.error('Erreur création table movies:', err);
        } else {
            console.log('✓ Table movies créée/vérifiée');
        }
    });

    // Créer la table watchlist
    db.run(`CREATE TABLE IF NOT EXISTS watchlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        movie_id INTEGER NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
        UNIQUE(user_id, movie_id)
    )`, (err) => {
        if (err) {
            console.error('Erreur création table movies:', err);
        } else {
            console.log('✓ Table movies créée/vérifiée');
            
            // Vérifier si des films existent déjà
            db.get(`SELECT COUNT(*) as count FROM movies`, [], (err, row) => {
                if (err) {
                    console.error('Erreur vérification films:', err);
                    return;
                }
                
                if (row.count === 0) {
                    console.log('Ajout des films d\'exemple...');
                    
                    // Créer un utilisateur admin par défaut
                    bcrypt.hash('admin123', 10, (err, hashedAdminPassword) => {
                        if (err) {
                            console.error('Erreur hash admin password:', err);
                            return;
                        }

                        db.run(`INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)`,
                            ['admin@cinestream.com', hashedAdminPassword, 'Administrateur', 'admin'],
                            (err) => {
                                if (err) {
                                    console.error('Erreur création admin:', err);
                                } else {
                                    console.log('✓ Administrateur créé (admin@cinestream.com / admin123)');
                                }
                            }
                        );
                    });

                    // Ajouter des films d'exemple (tous premium pour tester les restrictions)
                    const movies = [
                        ['Inception', 'Un voleur spécialisé dans l\'extraction de secrets enfouis dans le subconscient', 2010, '2h 28min', 'Sci-Fi, Thriller', 8.8, 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 'https://www.youtube.com/watch?v=YoHD9XEInc0', 'sample_video.mp4', 1],
                        ['The Dark Knight', 'Batman doit accepter l\'une des plus grandes épreuves psychologiques et physiques', 2008, '2h 32min', 'Action, Crime, Drama', 9.0, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'https://www.youtube.com/watch?v=EXeTwQWrcwY', 'sample_video.mp4', 1],
                        ['Interstellar', 'Une équipe d\'explorateurs voyage à travers un trou de ver dans l\'espace', 2014, '2h 49min', 'Sci-Fi, Drama', 8.6, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://www.youtube.com/watch?v=zSWdZVtXT7E', 'sample_video.mp4', 1],
                        ['Pulp Fiction', 'Les vies de deux tueurs de la mafia, d\'un boxeur et d\'un gangster s\'entremêlent', 1994, '2h 34min', 'Crime, Drama', 8.9, 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'https://www.youtube.com/watch?v=s7EdQ4FqbhY', 'sample_video.mp4', 1],
                        ['The Matrix', 'Un hacker découvre que la réalité qu\'il connaît n\'est qu\'une simulation', 1999, '2h 16min', 'Sci-Fi, Action', 8.7, 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 'https://www.youtube.com/watch?v=vKQi3bBA1y8', 'sample_video.mp4', 1],
                        ['Fight Club', 'Un employé de bureau insomniac et un vendeur de savon forment un club de combat souterrain', 1999, '2h 19min', 'Drama', 8.8, 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'https://www.youtube.com/watch?v=SUXWAEX2jlg', 'sample_video.mp4', 1]
                    ];

                    const stmt = db.prepare(`INSERT INTO movies (title, description, year, duration, genre, rating, poster, trailer, video_url, premium) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                    
                    movies.forEach((movie, index) => {
                        stmt.run(movie, (err) => {
                            if (err) {
                                console.error(`Erreur ajout film ${movie[0]}:`, err);
                            }
                        });
                    });
                    
                    stmt.finalize(() => {
                        console.log('✓ 6 films ajoutés à la base de données');
                    });
                } else {
                    console.log(`✓ ${row.count} film(s) déjà présent(s) dans la base`);
                }
            });
        }
    });
}

// Routes API

// Inscription
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`INSERT INTO users (email, password, name) VALUES (?, ?, ?)`,
        [email, hashedPassword, name],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
                }
                return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
            }
            res.json({ message: 'Inscription réussie', userId: this.lastID });
        }
    );
});

// Connexion
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        req.session.userId = user.id;
        res.json({ 
            message: 'Connexion réussie',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                subscription_type: user.subscription_type
            }
        });
    });
});

// Déconnexion
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Déconnexion réussie' });
});

// Vérifier la session
app.get('/api/check-auth', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ authenticated: false });
    }

    db.get(`SELECT id, email, name, subscription_type, role FROM users WHERE id = ?`,
        [req.session.userId],
        (err, user) => {
            if (err || !user) {
                return res.status(401).json({ authenticated: false });
            }
            res.json({ authenticated: true, user });
        }
    );
});

// Récupérer tous les films
app.get('/api/movies', (req, res) => {
    db.all(`SELECT * FROM movies`, [], (err, movies) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des films' });
        }
        res.json(movies);
    });
});

// Récupérer un film par ID
app.get('/api/movies/:id', (req, res) => {
    db.get(`SELECT * FROM movies WHERE id = ?`, [req.params.id], (err, movie) => {
        if (err || !movie) {
            return res.status(404).json({ error: 'Film non trouvé' });
        }

        // Vérifier l'accès au film premium
        if (movie.premium) {
            if (!req.session.userId) {
                return res.status(403).json({
                    error: 'Authentification requise',
                    requiresAuth: true
                });
            }

            // Vérifier l'abonnement
            db.get(`SELECT subscription_type FROM users WHERE id = ?`, [req.session.userId], (err, user) => {
                if (err || !user || user.subscription_type === 'free') {
                    return res.status(403).json({
                        error: 'Abonnement premium requis',
                        requiresSubscription: true
                    });
                }
                res.json(movie);
            });
        } else {
            res.json(movie);
        }
    });
});

// Mettre à jour l'abonnement
app.post('/api/subscribe', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { plan } = req.body;
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    db.run(`UPDATE users SET subscription_type = ?, subscription_end = ? WHERE id = ?`,
        [plan, subscriptionEnd.toISOString(), req.session.userId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'abonnement' });
            }
            // Rediriger vers la page des films après l'abonnement réussi
            res.json({
                message: 'Abonnement mis à jour avec succès',
                plan,
                redirect: '/movies.html'
            });
        }
    );
});

// Mettre à jour le profil
app.post('/api/update-profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    db.get(`SELECT id FROM users WHERE email = ? AND id != ?`, [email, req.session.userId], (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email' });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Mettre à jour le profil
        db.run(`UPDATE users SET name = ?, email = ? WHERE id = ?`,
            [name, email, req.session.userId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
                }

                // Récupérer les données mises à jour
                db.get(`SELECT id, email, name, subscription_type, role FROM users WHERE id = ?`,
                    [req.session.userId],
                    (err, user) => {
                        if (err) {
                            return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
                        }
                        res.json({ message: 'Profil mis à jour avec succès', user });
                    }
                );
            }
        );
    });
});

// API Admin - Vérifier si l'utilisateur est admin
function requireAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    db.get(`SELECT role FROM users WHERE id = ?`, [req.session.userId], (err, user) => {
        if (err || !user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé - Droits administrateur requis' });
        }
        next();
    });
}

// API Admin - Récupérer tous les utilisateurs
app.get('/api/admin/users', requireAdmin, (req, res) => {
    db.all(`SELECT id, email, name, subscription_type, role, created_at FROM users ORDER BY created_at DESC`, [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
        }
        res.json(users);
    });
});

// API Admin - Modifier le rôle d'un utilisateur
app.post('/api/admin/users/:id/role', requireAdmin, (req, res) => {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Rôle invalide' });
    }

    db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, userId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
        }
        res.json({ message: 'Rôle mis à jour avec succès' });
    });
});

// API Admin - Supprimer un utilisateur
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;

    // Empêcher la suppression de son propre compte
    if (parseInt(userId) === req.session.userId) {
        return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    db.run(`DELETE FROM users WHERE id = ?`, [userId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
        }
        res.json({ message: 'Utilisateur supprimé avec succès' });
    });
});

// API Admin - Ajouter un film
app.post('/api/admin/movies', requireAdmin, (req, res) => {
    const { title, description, year, duration, genre, rating, poster, trailer, video_url, embed_code, premium } = req.body;

    if (!title || !description || !year || !genre) {
        return res.status(400).json({ error: 'Titre, description, année et genre sont requis' });
    }

    db.run(`INSERT INTO movies (title, description, year, duration, genre, rating, poster, trailer, video_url, embed_code, premium)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, year, duration || '', genre, rating || 0, poster || '', trailer || '', video_url || '', embed_code || '', premium ? 1 : 0],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de l\'ajout du film' });
            }
            res.json({ message: 'Film ajouté avec succès', movieId: this.lastID });
        }
    );
});

// API Admin - Modifier un film
app.put('/api/admin/movies/:id', requireAdmin, (req, res) => {
    const movieId = req.params.id;
    const { title, description, year, duration, genre, rating, poster, trailer, video_url, embed_code, premium } = req.body;

    if (!title || !description || !year || !genre) {
        return res.status(400).json({ error: 'Titre, description, année et genre sont requis' });
    }

    db.run(`UPDATE movies SET title = ?, description = ?, year = ?, duration = ?, genre = ?,
            rating = ?, poster = ?, trailer = ?, video_url = ?, embed_code = ?, premium = ? WHERE id = ?`,
        [title, description, year, duration || '', genre, rating || 0, poster || '', trailer || '', video_url || '', embed_code || '', premium ? 1 : 0, movieId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur lors de la modification du film' });
            }
            res.json({ message: 'Film modifié avec succès' });
        }
    );
});

// API Admin - Supprimer un film
app.delete('/api/admin/movies/:id', requireAdmin, (req, res) => {
    const movieId = req.params.id;

    db.run(`DELETE FROM movies WHERE id = ?`, [movieId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la suppression du film' });
        }
        res.json({ message: 'Film supprimé avec succès' });
    });
});

// API Admin - Modifier un utilisateur
app.put('/api/admin/users', requireAdmin, (req, res) => {
    const { userId, name, email } = req.body;

    if (!userId || !name || !email) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    db.get(`SELECT id FROM users WHERE email = ? AND id != ?`, [email, userId], (err, existingUser) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email' });
        }

        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Mettre à jour l'utilisateur
        db.run(`UPDATE users SET name = ?, email = ? WHERE id = ?`,
            [name, email, userId],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
                }
                res.json({ message: 'Utilisateur mis à jour avec succès' });
            }
        );
    });
});

// API Admin - Récupérer un utilisateur spécifique
app.get('/api/admin/users/:id', requireAdmin, (req, res) => {
    const userId = req.params.id;

    db.get(`SELECT id, email, name, subscription_type, role, created_at FROM users WHERE id = ?`,
        [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user);
    });
});

// API Admin - Statistiques des abonnements
app.get('/api/admin/subscription-stats', requireAdmin, (req, res) => {
    const stats = {};

    // Compter par type d'abonnement
    db.all(`SELECT subscription_type, COUNT(*) as count FROM users GROUP BY subscription_type`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur stats abonnements' });
        }

        rows.forEach(row => {
            stats[row.subscription_type] = row.count;
        });

        // Assurer que tous les types sont présents
        stats.free = stats.free || 0;
        stats.basic = stats.basic || 0;
        stats.standard = stats.standard || 0;
        stats.premium = stats.premium || 0;

        res.json(stats);
    });
});

// API Admin - Récupérer les statistiques
app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const stats = {};

    // Compter les utilisateurs
    db.get(`SELECT COUNT(*) as total FROM users`, [], (err, row) => {
        if (err) return res.status(500).json({ error: 'Erreur stats utilisateurs' });
        stats.totalUsers = row.total;

        // Compter les abonnements
        db.get(`SELECT COUNT(*) as total FROM users WHERE subscription_type != 'free'`, [], (err, row) => {
            if (err) return res.status(500).json({ error: 'Erreur stats abonnements' });
            stats.totalSubscribers = row.total;

            // Compter les films
            db.get(`SELECT COUNT(*) as total FROM movies`, [], (err, row) => {
                if (err) return res.status(500).json({ error: 'Erreur stats films' });
                stats.totalMovies = row.total;

                // Compter les films premium
                db.get(`SELECT COUNT(*) as total FROM movies WHERE premium = 1`, [], (err, row) => {
                    if (err) return res.status(500).json({ error: 'Erreur stats films premium' });
                    stats.totalPremiumMovies = row.total;

                    res.json(stats);
                });
            });
        });
    });
});

// Changer le mot de passe
app.post('/api/change-password', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
    }

    try {
        // Vérifier le mot de passe actuel
        db.get(`SELECT password FROM users WHERE id = ?`, [req.session.userId], async (err, user) => {
            if (err || !user) {
                return res.status(500).json({ error: 'Utilisateur non trouvé' });
            }

            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
            }

            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Mettre à jour le mot de passe
            db.run(`UPDATE users SET password = ? WHERE id = ?`,
                [hashedPassword, req.session.userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
                    }
                    res.json({ message: 'Mot de passe changé avec succès' });
                }
            );
        });
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Mettre à jour les préférences (simulation - peut être étendu avec une vraie table)
app.post('/api/update-preferences', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { emailNotifications, marketingEmails, language } = req.body;

    // Ici, vous pourriez sauvegarder ces préférences dans une table dédiée
    // Pour l'instant, on simule une sauvegarde réussie
    res.json({
        message: 'Préférences mises à jour avec succès',
        preferences: { emailNotifications, marketingEmails, language }
    });
});

// Import de multer et fs (déjà en haut mais on déplace ici pour clarté)
const multer = require('multer');
const fs = require('fs');

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom unique pour le fichier
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max
    },
    fileFilter: (req, file, cb) => {
        // Vérifier que c'est un fichier vidéo (plus permissif)
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/x-msvideo', 'video/quicktime'];
        const validExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mkv'];

        const isValidType = validTypes.includes(file.mimetype) ||
                           validExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));

        if (isValidType) {
            cb(null, true);
        } else {
            cb(new Error('Format vidéo non supporté. Utilisez MP4, WebM, OGG, AVI ou MKV.'));
        }
    }
});

// Route d'upload de fichier (avec middleware admin)
app.post('/api/admin/upload-video', requireAdmin, upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Retourner l'URL du fichier uploadé
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
        message: 'Fichier uploadé avec succès',
        fileUrl: fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size
    });
});

// Middleware pour gérer les erreurs Multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Fichier trop volumineux (max 500MB)' });
        }
        return res.status(400).json({ error: `Erreur upload: ${error.message}` });
    }
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
});

// Middleware pour gérer les headers CORS pour les iframes
app.use((req, res, next) => {
    res.header('X-Frame-Options', 'ALLOWALL');
    res.header('Content-Security-Policy', "frame-ancestors *;");
    next();
});

// Routes pour servir les pages HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎬 Serveur de streaming démarré sur http://localhost:${PORT}`);
});