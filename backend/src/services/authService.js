// Rute pentru autentificarea utilizatorilor (login)

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// Autentificare utilizator pe bază de email și parolă
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Verifică dacă datele sunt trimise
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    // Caută utilizatorul după email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    // Verifică parola
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    // Generează token JWT cu datele utilizatorului
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "2h" }
    );

    // Returnează token-ul și datele de bază ale utilizatorului
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
});

module.exports = router;
