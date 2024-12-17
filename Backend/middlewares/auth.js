const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé, token manquant.' });
  }

  // Enlever "Bearer " du token, si le token est passé sous cette forme
  const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide.' });
    }

    // Stocker les informations de l'utilisateur dans req.user
    req.user = user; // Assure-toi que 'user' contient 'id'

    next();
  });
};

module.exports = authenticateToken;
