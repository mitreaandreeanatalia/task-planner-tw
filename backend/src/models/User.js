// Model Sequelize pentru utilizatorii aplicației

const sequelize = require("../sequelize");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  // Numele utilizatorului
  name: { type: DataTypes.STRING, allowNull: false },

  // Email unic, folosit la autentificare
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },

  // Parola stocată sub formă de hash
  passwordHash: { type: DataTypes.STRING, allowNull: false },

  // Rolul utilizatorului: ADMIN, MANAGER sau EXECUTOR
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIn: [["ADMIN", "MANAGER", "EXECUTOR"]] },
  },

  // ID-ul managerului (doar pentru EXECUTOR)
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { isInt: true },
  },
});

module.exports = User;
