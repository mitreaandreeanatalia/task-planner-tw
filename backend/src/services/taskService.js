// Rute pentru gestionarea task-urilor și istoricul acestora

const express = require("express");

const Task = require("../models/Task");
const User = require("../models/User");
const { auth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Formatează un task pentru a fi trimis către frontend
function toDto(t) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    createdById: t.createdById,
    assignedToId: t.assignedToId,
    completedAt: t.completedAt,
    closedAt: t.closedAt,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

// MANAGER: creează un task nou (status OPEN)
router.post("/tasks", auth, requireRole(["MANAGER"]), async (req, res) => {
  const { title, description } = req.body || {};
  if (!title || !description) {
    return res.status(400).json({ message: "title and description are required" });
  }

  const task = await Task.create({
    title,
    description,
    status: "OPEN",
    createdById: req.user.id,
    assignedToId: null,
    completedAt: null,
    closedAt: null,
  });

  return res.status(201).json(toDto(task));
});

// MANAGER: vede task-urile create de el
router.get("/tasks", auth, requireRole(["MANAGER"]), async (req, res) => {
  const tasks = await Task.findAll({
    where: { createdById: req.user.id },
    order: [["updatedAt", "DESC"]],
  });

  return res.json(tasks.map(toDto));
});

// MANAGER: alocă un task unui executor (status PENDING)
router.post("/tasks/:id/assign", auth, requireRole(["MANAGER"]), async (req, res) => {
  const id = Number(req.params.id);
  const { assignedToId } = req.body || {};

  if (!assignedToId) return res.status(400).json({ message: "assignedToId is required" });

  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ message: "task not found" });

  // Managerul poate aloca doar task-urile create de el
  if (task.createdById !== req.user.id) return res.status(403).json({ message: "forbidden" });

  if (task.status !== "OPEN") {
    return res.status(400).json({ message: "task must be OPEN to assign" });
  }

  const execUser = await User.findByPk(assignedToId);
  if (!execUser || execUser.role !== "EXECUTOR") {
    return res.status(400).json({ message: "assigned user must be EXECUTOR" });
  }

  task.assignedToId = assignedToId;
  task.status = "PENDING";
  await task.save();

  return res.json(toDto(task));
});

// EXECUTOR: vede task-urile alocate lui
router.get("/tasks/my", auth, requireRole(["EXECUTOR"]), async (req, res) => {
  const tasks = await Task.findAll({
    where: { assignedToId: req.user.id },
    order: [["updatedAt", "DESC"]],
  });

  return res.json(tasks.map(toDto));
});

// EXECUTOR: marchează task-ul ca realizat (COMPLETED)
router.post("/tasks/:id/complete", auth, requireRole(["EXECUTOR"]), async (req, res) => {
  const id = Number(req.params.id);

  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ message: "task not found" });

  if (task.assignedToId !== req.user.id) return res.status(403).json({ message: "forbidden" });

  if (task.status !== "PENDING") {
    return res.status(400).json({ message: "task must be PENDING to complete" });
  }

  task.status = "COMPLETED";
  task.completedAt = new Date();
  await task.save();

  return res.json(toDto(task));
});

// MANAGER: închide task-ul după ce a fost finalizat (CLOSED)
router.post("/tasks/:id/close", auth, requireRole(["MANAGER"]), async (req, res) => {
  const id = Number(req.params.id);

  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ message: "task not found" });

  if (task.createdById !== req.user.id) return res.status(403).json({ message: "forbidden" });

  if (task.status !== "COMPLETED") {
    return res.status(400).json({ message: "task must be COMPLETED to close" });
  }

  task.status = "CLOSED";
  task.closedAt = new Date();
  await task.save();

  return res.json(toDto(task));
});

// Istoric task-uri pentru utilizatorul curent (în funcție de rol)
router.get("/tasks/history", auth, async (req, res) => {
  let where = null;

  if (req.user.role === "EXECUTOR") where = { assignedToId: req.user.id };
  else if (req.user.role === "MANAGER") where = { createdById: req.user.id };
  else if (req.user.role === "ADMIN") where = {};
  else return res.status(403).json({ message: "forbidden" });

  const tasks = await Task.findAll({
    where,
    order: [["updatedAt", "DESC"]],
  });

  return res.json(tasks.map(toDto));
});

// MANAGER: vede istoricul task-urilor unui executor
router.get("/tasks/history/executor/:executorId", auth, requireRole(["MANAGER"]), async (req, res) => {
  const executorId = Number(req.params.executorId);

  const execUser = await User.findByPk(executorId);
  if (!execUser || execUser.role !== "EXECUTOR") {
    return res.status(400).json({ message: "user must be EXECUTOR" });
  }

  const tasks = await Task.findAll({
    where: { assignedToId: executorId, createdById: req.user.id },
    order: [["updatedAt", "DESC"]],
  });

  return res.json(tasks.map(toDto));
});

module.exports = router;
