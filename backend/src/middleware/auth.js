// Middleware pentru autentificare și verificarea rolurilor utilizatorilor

const jwt = require("jsonwebtoken");

// Verifică existența și validitatea token-ului JWT
// Atașează utilizatorul autentificat în req.user
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "missing token" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "invalid token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // id, role, email
    next();
  } catch (e) {
    return res.status(401).json({ message: "token invalid or expired" });
  }
}

// Verifică dacă utilizatorul are unul dintre rolurile permise
function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "forbidden" });
    }
    next();
  };
}

module.exports = { auth, requireRole };
