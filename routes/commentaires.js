const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middlewares/auth');

// Ajouter un commentaire à une tâche
router.post('/:tacheId', authenticateToken, async (req, res) => {
    const { tacheId } = req.params;
    const { commentaire } = req.body;

    if (!commentaire) {
        return res.status(400).json({ message: 'Le contenu du commentaire est requis.' });
    }

    try {
        // Vérifier si la tâche existe
        const [tache] = await db.promise().query('SELECT * FROM taches WHERE tache_id = ?', [tacheId]);
        if (tache.length === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée.' });
        }

        // Ajouter le commentaire
        await db.promise().query(
            'INSERT INTO commentaires (tache_id, utilisateur_id, commentaire) VALUES (?, ?, ?)',
            [tacheId, req.user.id, commentaire]
        );

        res.status(201).json({ message: 'Commentaire ajouté avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Récupérer les commentaires d'une tâche
router.get('/:tacheId', authenticateToken, async (req, res) => {
    const { tacheId } = req.params;

    try {
        const [commentaires] = await db.promise().query(
            'SELECT c.commentaire_id, c.commentaire, c.cree_le, u.username FROM commentaires c JOIN utilisateurs u ON c.utilisateur_id = u.utilisateur_id WHERE c.tache_id = ? ORDER BY c.cree_le',
            [tacheId]
        );

        res.status(200).json(commentaires);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Supprimer un commentaire
router.delete('/:tacheId/:commentaireId', authenticateToken, async (req, res) => {
    const { tacheId, commentaireId } = req.params;
    const utilisateurId = req.user.id;

    try {
        // Vérifier si la tâche existe
        const [tache] = await db.promise().query('SELECT * FROM taches WHERE tache_id = ?', [tacheId]);
        if (tache.length === 0) {
            return res.status(404).json({ message: 'Tâche non trouvée.' });
        }

        // Vérifier si le commentaire existe
        const [commentaire] = await db.promise().query('SELECT * FROM commentaires WHERE commentaire_id = ?', [commentaireId]);
        if (commentaire.length === 0) {
            return res.status(404).json({ message: 'Commentaire non trouvé.' });
        }

        // Vérifier si l'utilisateur est l'auteur du commentaire ou le propriétaire de la tâche
        if (commentaire[0].utilisateur_id !== utilisateurId) {
            // Vérifier si l'utilisateur est propriétaire de la tâche
            const [tacheProprietaire] = await db.promise().query(
                'SELECT l.proprietaire_id FROM taches t JOIN listes l ON t.liste_id = l.liste_id WHERE t.tache_id = ?',
                [tacheId]
            );

            if (tacheProprietaire.length === 0 || tacheProprietaire[0].proprietaire_id !== utilisateurId) {
                return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer ce commentaire.' });
            }
        }

        // Supprimer le commentaire
        await db.promise().query('DELETE FROM commentaires WHERE commentaire_id = ?', [commentaireId]);

        res.status(200).json({ message: 'Commentaire supprimé avec succès.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});



module.exports = router;
