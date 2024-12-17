const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middlewares/auth');

// Ajouter une tâche
router.post('/', authenticateToken, async (req, res) => {
  const { listeId, titre, description, statut, priorite, date_echeance } = req.body;
  const utilisateurId = req.user.id;

  if (!listeId || !titre || !statut || !priorite) {
    return res.status(400).json({ message: 'Liste ID, titre, statut et priorité sont requis.' });
  }

  try {
    // Vérification des permissions
    const [result] = await db.promise().query(
      `SELECT l.proprietaire_id 
       FROM listes l 
       LEFT JOIN partages p ON l.liste_id = p.liste_id 
       WHERE l.liste_id = ? AND (l.proprietaire_id = ? OR p.utilisateur_id = ?)`,
      [listeId, utilisateurId, utilisateurId]
    );

    if (result.length === 0) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à ajouter une tâche à cette liste.' });
    }

    // Ajouter la tâche
    const [insertResult] = await db.promise().query(
      'INSERT INTO taches (liste_id, titre, description, statut, priorite, date_echeance, cree_le) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [listeId, titre, description || '', statut, priorite, date_echeance || null]
    );

    res.status(201).json({
      message: 'Tâche créée avec succès.',
      tacheId: insertResult.insertId,
      titre,
      description: description || '',
      statut,
      priorite,
      date_echeance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer les tâches d'une liste
router.get('/:listeId', authenticateToken, async (req, res) => {
  const utilisateurId = req.user.id; // ID de l'utilisateur authentifié

  try {
    // Vérification des permissions
    const [result] = await db.promise().query(
      `SELECT l.proprietaire_id 
       FROM listes l 
       LEFT JOIN partages p ON l.liste_id = p.liste_id 
       WHERE l.liste_id = ? AND (l.proprietaire_id = ? OR p.utilisateur_id = ?)` ,
      [req.params.listeId, utilisateurId, utilisateurId]
    );

    if (result.length === 0) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à accéder à cette liste.' });
    }

    // Si l'utilisateur est autorisé, récupérer les tâches
    const [tasks] = await db.promise().query(
      'SELECT * FROM taches WHERE liste_id = ?',
      [req.params.listeId]
    );

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


// Mettre à jour une tâche
router.put('/:id', authenticateToken, async (req, res) => {
  const { titre, description, statut, priorite, date_echeance } = req.body; // Remplacer 'nom' par 'titre'
  const utilisateurId = req.user.id;
  const tacheId = req.params.id;

  try {
    // Vérification des permissions
    const [result] = await db.promise().query(
      `SELECT t.liste_id, l.proprietaire_id 
       FROM taches t 
       JOIN listes l ON t.liste_id = l.liste_id
       LEFT JOIN partages p ON l.liste_id = p.liste_id 
       WHERE t.tache_id = ? AND (l.proprietaire_id = ? OR p.utilisateur_id = ?)`,
      [tacheId, utilisateurId, utilisateurId]
    );

    if (result.length === 0) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cette tâche.' });
    }

    // Mettre à jour la tâche
    const [updateResult] = await db.promise().query(
      'UPDATE taches SET titre = ?, description = ?, statut = ?, priorite = ?, date_echeance = ? WHERE tache_id = ?',
      [titre, description, statut, priorite, date_echeance || null, tacheId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Tâche introuvable.' });
    }

    res.status(200).json({ message: 'Tâche mise à jour avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


// Supprimer une tâche
router.delete('/:id', authenticateToken, async (req, res) => {
  const utilisateurId = req.user.id; // ID de l'utilisateur authentifié
  const tacheId = req.params.id;

  try {
    // Vérifier si l'utilisateur est le propriétaire de la liste ou a accès à la liste via les partages
    const [result] = await db.promise().query(
      `SELECT t.liste_id, l.proprietaire_id 
       FROM taches t 
       JOIN listes l ON t.liste_id = l.liste_id
       LEFT JOIN partages p ON l.liste_id = p.liste_id 
       WHERE t.tache_id = ? AND (l.proprietaire_id = ? OR p.utilisateur_id = ?)`,
      [tacheId, utilisateurId, utilisateurId]
    );

    if (result.length === 0) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette tâche.' });
    }

    // Supprimer la tâche
    const [deleteResult] = await db.promise().query(
      'DELETE FROM taches WHERE tache_id = ?',
      [tacheId]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Tâche introuvable.' });
    }

    res.status(200).json({ message: 'Tâche supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});
module.exports = router;