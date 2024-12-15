const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../db'); // Assume que la connexion MySQL est exportée depuis un fichier db.js

// Inscription
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Le nom d\'utilisateur est obligatoire.'),
    body('email').isEmail().withMessage('Email invalide.'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('numero_telephone').isMobilePhone().withMessage('Numéro de téléphone invalide.'),
    body('date_naissance').isDate().withMessage('Date de naissance invalide.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, numero_telephone, date_naissance } = req.body;

    try {
      // Vérifier si l'email est déjà utilisé
      const [existingUser] = await db.promise().query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer le nouvel utilisateur dans la base de données
      await db.promise().query(
        'INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe_hache, numero_telephone, date_naissance) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, numero_telephone, date_naissance]
      );

      res.status(201).json({ message: 'Utilisateur créé avec succès !' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);


// Connexion
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide.'),
    body('password').notEmpty().withMessage('Le mot de passe est obligatoire.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Vérifier si l'utilisateur existe
      const [user] = await db.promise().query('SELECT * FROM utilisateurs WHERE email = ?', [email]);
      if (user.length === 0) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(password, user[0].mot_de_passe_hache);
      if (!validPassword) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
      }

      // Générer un token JWT
      const token = jwt.sign({ id: user[0].utilisateur_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ token, message: 'Connexion réussie !' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
);

module.exports = router;

