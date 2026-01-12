// Model Sequelize pentru task-uri și ciclul lor de viață

const sequelize = require("../sequelize");
const { DataTypes } = require("sequelize");

const Task = sequelize.define("task", {
  // Titlul task-ului
  title: { type: DataTypes.STRING, allowNull: false },

  // Descrierea task-ului
  description: { type: DataTypes.STRING, allowNull: false },

  // Status: OPEN → PENDING → COMPLETED → CLOSED
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "OPEN",
    validate: { isIn: [["OPEN", "PENDING", "COMPLETED", "CLOSED"]] },
  },

  // ID-ul managerului care a creat task-ul
  createdById: { type: DataTypes.INTEGER, allowNull: false },

  // ID-ul executorului asignat
  assignedToId: { type: DataTypes.INTEGER, allowNull: true },

  // Data finalizării de către executor
  completedAt: { type: DataTypes.DATE, allowNull: true },

  // Data închiderii de către manager
  closedAt: { type: DataTypes.DATE, allowNull: true },
});

module.exports = Task;
