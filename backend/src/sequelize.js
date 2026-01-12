// Configurare Sequelize și inițializare bază de date

const { Sequelize } = require("sequelize");

// Conexiune la baza de date SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./src/sqlite/dev.db",
  logging: false,
});

// Inițializează DB-ul și inserează datele de start
async function initDb() {
  await sequelize.sync({ alter: true });
  console.log("DB synced");

  const User = require("./models/User");
  const bcrypt = require("bcrypt");

  // Seed inițial (doar dacă nu există utilizatori)
  const c = await User.count();
  if (c === 0) {
    const admin = await User.create({
      name: "Admin",
      email: "admin@tw.com",
      passwordHash: await bcrypt.hash("admin1234", 10),
      role: "ADMIN",
      managerId: null,
    });

    const manager = await User.create({
      name: "Manager",
      email: "manager@tw.com",
      passwordHash: await bcrypt.hash("manager1234", 10),
      role: "MANAGER",
      managerId: null,
    });

    await User.create({
      name: "Executor",
      email: "executor@tw.com",
      passwordHash: await bcrypt.hash("executor1234", 10),
      role: "EXECUTOR",
      managerId: manager.id,
    });

    console.log("Seed inserted");
  }
}

// Rulează inițializarea bazei de date
initDb().catch(console.error);

module.exports = sequelize;
