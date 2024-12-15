const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middlewares/auth');

// Création d'une liste
router.post('/', authenticateToken, async (req, res) => {
  const { nom, description } = req.body;

  // Validation de base : vérifier que le nom est présent
  if (!nom) {
    return res.status(400).json({ message: 'Le nom de la liste est requis.' });
  }

  try {
    // Vérification si une liste avec le même nom existe déjà pour le même utilisateur
    const [existingList] = await db.promise().query(
      'SELECT * FROM listes WHERE nom = ? AND proprietaire_id = ?',
      [nom, req.user.id]
    );

    if (existingList.length > 0) {
      return res.status(400).json({ message: 'Une liste avec ce nom existe déjà.' });
    }

    // Insertion de la nouvelle liste si le nom est unique
    const [result] = await db.promise().query(
      'INSERT INTO listes (nom, description, proprietaire_id, cree_le) VALUES (?, ?, ?, NOW())',
      [nom, description || '', req.user.id]
    );

    // Retour de la réponse après l'insertion réussie
    res.status(201).json({ message: 'Liste créée avec succès.', listeId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


// Récupération des listes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [listes] = await db.promise().query(
      'SELECT * FROM listes WHERE proprietaire_id = ?',
      [req.user.id]
    );

    res.status(200).json(listes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Mise à jour d'une liste
router.put('/:id', authenticateToken, async (req, res) => {
  const { nom, description } = req.body;

  try {
    const [result] = await db.promise().query(
      'UPDATE listes SET nom = ?, description = ? WHERE liste_id = ? AND proprietaire_id = ?',
      [nom, description, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Liste introuvable ou vous n\'êtes pas autorisé à la modifier.' });
    }

    res.status(200).json({ message: 'Liste mise à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Suppression d'une liste
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'DELETE FROM listes WHERE liste_id = ? AND proprietaire_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Liste introuvable ou vous n\'êtes pas autorisé à la supprimer.' });
    }

    res.status(200).json({ message: 'Liste supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
