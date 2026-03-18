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
