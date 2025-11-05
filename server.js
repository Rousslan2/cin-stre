const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

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

// Base de données PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
    console.log('Connecté à la base de données PostgreSQL');
    initDatabase().catch(console.error);
});

pool.on('error', (err) => {
    console.error('Erreur de connexion à la base de données:', err);
});

// Initialisation de la base de données
async function initDatabase() {
    try {
        // Créer la table users
        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            subscription_type TEXT DEFAULT 'free',
            subscription_end DATE,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('✓ Table users créée/vérifiée');

        // Créer la table movies
        await pool.query(`CREATE TABLE IF NOT EXISTS movies (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            year INTEGER,
            duration TEXT,
            genre TEXT,
            rating REAL,
            poster TEXT,
            trailer TEXT,
            video_url TEXT,
            premium BOOLEAN DEFAULT false,
            embed_code TEXT
        )`);
        console.log('✓ Table movies créée/vérifiée');

        // Créer la table watchlist
        await pool.query(`CREATE TABLE IF NOT EXISTS watchlist (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, movie_id)
        )`);
        console.log('✓ Table watchlist créée/vérifiée');

        // Vérifier si des films existent déjà
        const result = await pool.query('SELECT COUNT(*) as count FROM movies');
        const count = parseInt(result.rows[0].count);

        if (count === 0) {
            console.log('Ajout des films d\'exemple...');

            // Créer un utilisateur admin par défaut
            const hashedAdminPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
                ['admin@cinestream.com', hashedAdminPassword, 'Administrateur', 'admin']
            );
            console.log('✓ Administrateur créé (admin@cinestream.com / admin123)');

            // Ajouter des films d'exemple (tous premium pour tester les restrictions)
            const movies = [
                ['Inception', 'Un voleur spécialisé dans l\'extraction de secrets enfouis dans le subconscient', 2010, '2h 28min', 'Sci-Fi, Thriller', 8.8, 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', 'https://www.youtube.com/watch?v=YoHD9XEInc0', 'sample_video.mp4', true],
                ['The Dark Knight', 'Batman doit accepter l\'une des plus grandes épreuves psychologiques et physiques', 2008, '2h 32min', 'Action, Crime, Drama', 9.0, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'https://www.youtube.com/watch?v=EXeTwQWrcwY', 'sample_video.mp4', true],
                ['Interstellar', 'Une équipe d\'explorateurs voyage à travers un trou de ver dans l\'espace', 2014, '2h 49min', 'Sci-Fi, Drama', 8.6, 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://www.youtube.com/watch?v=zSWdZVtXT7E', 'sample_video.mp4', true],
                ['Pulp Fiction', 'Les vies de deux tueurs de la mafia, d\'un boxeur et d\'un gangster s\'entremêlent', 1994, '2h 34min', 'Crime, Drama', 8.9, 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', 'https://www.youtube.com/watch?v=s7EdQ4FqbhY', 'sample_video.mp4', true],
                ['The Matrix', 'Un hacker découvre que la réalité qu\'il connaît n\'est qu\'une simulation', 1999, '2h 16min', 'Sci-Fi, Action', 8.7, 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', 'https://www.youtube.com/watch?v=vKQi3bBA1y8', 'sample_video.mp4', true],
                ['Fight Club', 'Un employé de bureau insomniac et un vendeur de savon forment un club de combat souterrain', 1999, '2h 19min', 'Drama', 8.8, 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'https://www.youtube.com/watch?v=SUXWAEX2jlg', 'sample_video.mp4', true]
            ];

            for (const movie of movies) {
                await pool.query(
                    'INSERT INTO movies (title, description, year, duration, genre, rating, poster, trailer, video_url, premium) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                    movie
                );
            }

            console.log('✓ 6 films ajoutés à la base de données');
        } else {
            console.log(`✓ ${count} film(s) déjà présent(s) dans la base`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
}

// Routes API

// Inscription
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
            [email, hashedPassword, name]
        );

        res.json({ message: 'Inscription réussie', userId: result.rows[0].id });
    } catch (err) {
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        console.error('Erreur lors de l\'inscription:', err);
        return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

// Connexion
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
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
    } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Déconnexion
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Déconnexion réussie' });
});

// Vérifier la session
app.get('/api/check-auth', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ authenticated: false });
    }

    try {
        const result = await pool.query(
            'SELECT id, email, name, subscription_type, role FROM users WHERE id = $1',
            [req.session.userId]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ authenticated: false });
        }
        res.json({ authenticated: true, user });
    } catch (err) {
        console.error('Erreur lors de la vérification de la session:', err);
        return res.status(500).json({ authenticated: false });
    }
});

// Récupérer tous les films
app.get('/api/movies', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des films:', err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des films' });
    }
});

// Récupérer un film par ID
app.get('/api/movies/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
        const movie = result.rows[0];

        if (!movie) {
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
            const userResult = await pool.query(
                'SELECT subscription_type FROM users WHERE id = $1',
                [req.session.userId]
            );
            const user = userResult.rows[0];

            if (!user || user.subscription_type === 'free') {
                return res.status(403).json({
                    error: 'Abonnement premium requis',
                    requiresSubscription: true
                });
            }
        }
        res.json(movie);
    } catch (err) {
        console.error('Erreur lors de la récupération du film:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Mettre à jour l'abonnement
app.post('/api/subscribe', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { plan } = req.body;
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    try {
        await pool.query(
            'UPDATE users SET subscription_type = $1, subscription_end = $2 WHERE id = $3',
            [plan, subscriptionEnd.toISOString(), req.session.userId]
        );
        res.json({
            message: 'Abonnement mis à jour avec succès',
            plan,
            redirect: '/movies.html'
        });
    } catch (err) {
        console.error('Erreur lors de la mise à jour de l\'abonnement:', err);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'abonnement' });
    }
});

// Mettre à jour le profil
app.post('/api/update-profile', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, req.session.userId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Mettre à jour le profil
        await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3',
            [name, email, req.session.userId]
        );

        // Récupérer les données mises à jour
        const result = await pool.query(
            'SELECT id, email, name, subscription_type, role FROM users WHERE id = $1',
            [req.session.userId]
        );

        res.json({ message: 'Profil mis à jour avec succès', user: result.rows[0] });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du profil:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API Admin - Vérifier si l'utilisateur est admin
async function requireAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const result = await pool.query(
            'SELECT role FROM users WHERE id = $1',
            [req.session.userId]
        );
        const user = result.rows[0];

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé - Droits administrateur requis' });
        }
        next();
    } catch (err) {
        console.error('Erreur lors de la vérification admin:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}

// API Admin - Récupérer tous les utilisateurs
app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, name, subscription_type, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
});

// API Admin - Modifier le rôle d'un utilisateur
app.post('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Rôle invalide' });
    }

    try {
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
        res.json({ message: 'Rôle mis à jour avec succès' });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du rôle:', err);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle' });
    }
});

// API Admin - Supprimer un utilisateur
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const userId = req.params.id;

    // Empêcher la suppression de son propre compte
    if (parseInt(userId) === req.session.userId) {
        return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', err);
        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    }
});

// API Admin - Ajouter un film
app.post('/api/admin/movies', requireAdmin, async (req, res) => {
    const { title, description, year, duration, genre, rating, poster, trailer, video_url, embed_code, premium } = req.body;

    if (!title || !description || !year || !genre) {
        return res.status(400).json({ error: 'Titre, description, année et genre sont requis' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO movies (title, description, year, duration, genre, rating, poster, trailer, video_url, embed_code, premium)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [title, description, year, duration || '', genre, rating || 0, poster || '', trailer || '', video_url || '', embed_code || '', premium]
        );
        res.json({ message: 'Film ajouté avec succès', movieId: result.rows[0].id });
    } catch (err) {
        console.error('Erreur lors de l\'ajout du film:', err);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout du film' });
    }
});

// API Admin - Modifier un film
app.put('/api/admin/movies/:id', requireAdmin, async (req, res) => {
    const movieId = req.params.id;
    const { title, description, year, duration, genre, rating, poster, trailer, video_url, embed_code, premium } = req.body;

    if (!title || !description || !year || !genre) {
        return res.status(400).json({ error: 'Titre, description, année et genre sont requis' });
    }

    try {
        await pool.query(
            `UPDATE movies SET title = $1, description = $2, year = $3, duration = $4, genre = $5,
             rating = $6, poster = $7, trailer = $8, video_url = $9, embed_code = $10, premium = $11 WHERE id = $12`,
            [title, description, year, duration || '', genre, rating || 0, poster || '', trailer || '', video_url || '', embed_code || '', premium, movieId]
        );
        res.json({ message: 'Film modifié avec succès' });
    } catch (err) {
        console.error('Erreur lors de la modification du film:', err);
        return res.status(500).json({ error: 'Erreur lors de la modification du film' });
    }
});

// API Admin - Supprimer un film
app.delete('/api/admin/movies/:id', requireAdmin, async (req, res) => {
    const movieId = req.params.id;

    try {
        await pool.query('DELETE FROM movies WHERE id = $1', [movieId]);
        res.json({ message: 'Film supprimé avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression du film:', err);
        return res.status(500).json({ error: 'Erreur lors de la suppression du film' });
    }
});

// API Admin - Modifier un utilisateur
app.put('/api/admin/users', requireAdmin, async (req, res) => {
    const { userId, name, email } = req.body;

    if (!userId || !name || !email) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    try {
        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, userId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Mettre à jour l'utilisateur
        await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3',
            [name, email, userId]);
        res.json({ message: 'Utilisateur mis à jour avec succès' });
    } catch (err) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API Admin - Récupérer un utilisateur spécifique
app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query(
            'SELECT id, email, name, subscription_type, role, created_at FROM users WHERE id = $1',
            [userId]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
});

// API Admin - Statistiques des abonnements
app.get('/api/admin/subscription-stats', requireAdmin, async (req, res) => {
    const stats = {};

    try {
        // Compter par type d'abonnement
        const result = await pool.query('SELECT subscription_type, COUNT(*) as count FROM users GROUP BY subscription_type');
        const rows = result.rows;

        rows.forEach(row => {
            stats[row.subscription_type] = parseInt(row.count);
        });

        // Assurer que tous les types sont présents
        stats.free = stats.free || 0;
        stats.basic = stats.basic || 0;
        stats.standard = stats.standard || 0;
        stats.premium = stats.premium || 0;

        res.json(stats);
    } catch (err) {
        console.error('Erreur stats abonnements:', err);
        return res.status(500).json({ error: 'Erreur stats abonnements' });
    }
});

// API Admin - Récupérer les statistiques
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    const stats = {};

    try {
        // Compter les utilisateurs
        const usersResult = await pool.query('SELECT COUNT(*) as total FROM users');
        stats.totalUsers = parseInt(usersResult.rows[0].total);

        // Compter les abonnements
        const subsResult = await pool.query("SELECT COUNT(*) as total FROM users WHERE subscription_type != 'free'");
        stats.totalSubscribers = parseInt(subsResult.rows[0].total);

        // Compter les films
        const moviesResult = await pool.query('SELECT COUNT(*) as total FROM movies');
        stats.totalMovies = parseInt(moviesResult.rows[0].total);

        // Compter les films premium
        const premiumResult = await pool.query('SELECT COUNT(*) as total FROM movies WHERE premium = true');
        stats.totalPremiumMovies = parseInt(premiumResult.rows[0].total);

        res.json(stats);
    } catch (err) {
        console.error('Erreur stats:', err);
        return res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
    }
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
        const userResult = await pool.query(
            'SELECT password FROM users WHERE id = $1',
            [req.session.userId]
        );
        const user = userResult.rows[0];

        if (!user) {
            return res.status(500).json({ error: 'Utilisateur non trouvé' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, req.session.userId]
        );
        res.json({ message: 'Mot de passe changé avec succès' });
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
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