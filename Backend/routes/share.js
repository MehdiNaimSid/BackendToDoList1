const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middlewares/auth');

// Partager une liste
router.post('/', authenticateToken, async (req, res) => {
    const { listeId, utilisateurId, permission } = req.body;

    if (!listeId || !utilisateurId || !permission) {
        return res.status(400).json({ message: 'Liste ID, utilisateur ID et permission sont requis.' });
    }

    if (!['view', 'edit'].includes(permission)) {
        return res.status(400).json({ message: 'Permission invalide. Utilisez "view" ou "edit".' });
    }

    try {
        // Vérifier si l'utilisateur est le propriétaire de la liste
        const [listes] = await db.promise().query(
            'SELECT * FROM listes WHERE liste_id = ? AND proprietaire_id = ?',
            [listeId, req.user.id]
        );

        if (listes.length === 0) {
            return res.status(403).json({ message: 'Vous ne pouvez pas partager une liste qui ne vous appartient pas.' });
        }

        // Ajouter le partage
        const [result] = await db.promise().query(
            'INSERT INTO partages (liste_id, utilisateur_id, permission) VALUES (?, ?, ?)',
            [listeId, utilisateurId, permission]
        );

        res.status(201).json({ message: 'Liste partagée avec succès.', partageId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Récupérer les listes partagées avec l'utilisateur connecté
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [partages] = await db.promise().query(
            `SELECT l.*, p.permission FROM listes l
            JOIN partages p ON l.liste_id = p.liste_id
            WHERE p.utilisateur_id = ?`,
            [req.user.id]
        );

        res.status(200).json(partages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Révoquer un partage
router.delete('/:id', authenticateToken, async (req, res) => {
    const partageId = req.params.id;

    try {
        // Vérifier si l'utilisateur est propriétaire de la liste
        const [partage] = await db.promise().query(
            `SELECT p.* FROM partages p
            JOIN listes l ON p.liste_id = l.liste_id
            WHERE p.partage_id = ? AND l.proprietaire_id = ?`,
            [partageId, req.user.id]
        );

        if (partage.length === 0) {
            return res.status(403).json({ message: 'Vous ne pouvez pas révoquer un partage que vous n\'avez pas créé.' });
        }

        // Supprimer le partage
        await db.promise().query('DELETE FROM partages WHERE partage_id = ?', [partageId]);

        res.status(200).json({ message: 'Partage révoqué avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;
