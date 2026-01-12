// Rute pentru gestionarea utilizatorilor (create și listare)

const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// ADMIN / MANAGER: listă utilizatori
router.get("/users", auth, requireRole(["ADMIN", "MANAGER"]), async (req, res) => {
  const users = await User.findAll({
    attributes: ["id", "name", "email", "role", "managerId"],
  });
  res.json(users);
});

// ADMIN: creează MANAGER sau EXECUTOR
router.post("/users", auth, requireRole(["ADMIN"]), async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    // Verifică câmpurile obligatorii
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "missing fields" });
    }

    // Admin poate crea doar MANAGER sau EXECUTOR
    if (!["MANAGER", "EXECUTOR"].includes(role)) {
      return res
        .status(400)
        .json({ message: "only MANAGER or EXECUTOR can be created" });
    }

    let finalManagerId = null;

    // EXECUTOR trebuie să aibă manager
    if (role === "EXECUTOR") {
      if (!managerId) {
        return res
          .status(400)
          .json({ message: "EXECUTOR must have a managerId" });
      }

      const mgr = await User.findByPk(Number(managerId));
      if (!mgr || mgr.role !== "MANAGER") {
        return res
          .status(400)
          .json({ message: "managerId must reference a MANAGER user" });
      }

      finalManagerId = mgr.id;
    }

    // MANAGER nu are manager
    if (role === "MANAGER") {
      finalManagerId = null;
    }

    // Verifică email duplicat
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "email already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      role,
      managerId: finalManagerId,
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "server error" });
  }
});

module.exports = router;
