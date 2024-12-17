const mysql = require('mysql2');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Créer la connexion à la base de données
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Connecter à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err.message);
  } else {
    console.log('Connecté à la base de données MySQL.');
  }
});

// Exporter la connexion pour l'utiliser dans d'autres fichiers
module.exports = db;
