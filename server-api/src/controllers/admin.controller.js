const User = require("../models/user.model");
const Analysis = require("../models/analysis.model"); // Assuming we have an analysis model
const { sequelize } = require("../config/database");

async function getAllUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] }
    });
    
    // Optionally fetch analyses count natively if possible, or just send users
    // If analysis model has user_id, we can manually get counts
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const u = user.toJSON();
      const lastActivity = u.updatedAt || u.updated_at || u.createdAt || u.created_at;
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      u.is_active = !!lastActivity && (Date.now() - new Date(lastActivity).getTime() <= THIRTY_DAYS_MS);
      try {
        const analysesCount = await Analysis.count({ where: { user_id: u.id } });
        u.analysesCount = analysesCount;
      } catch (e) {
        u.analysesCount = 0;
      }
      return u;
    }));

    res.json(usersWithStats);
  } catch (err) {
    next(err);
  }
}

async function updateUserPlan(req, res, next) {
  try {
    const { id } = req.params;
    const { plan_type } = req.body;

    if (!["basic", "pro", "enterprise"].includes(plan_type)) {
      return res.status(400).json({ error: "Plan inválido" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.plan_type = plan_type;
    await user.save();

    res.json({ message: "Plan actualizado correctamente", user });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  updateUserPlan
};
