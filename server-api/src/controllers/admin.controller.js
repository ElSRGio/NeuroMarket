const User = require("../models/user.model");
const Analysis = require("../models/analysis.model");
const { sequelize } = require("../config/database");
const { generatePDF } = require("../services/pdf.service");
const bcrypt = require("bcryptjs");

const VALID_ROLES = ["user", "admin"];
const VALID_PLANS = ["basic", "pro", "enterprise"];

async function ensureDeletedUsersLogTable() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS deleted_users_log (
      id BIGSERIAL PRIMARY KEY,
      original_user_id UUID NOT NULL,
      email VARCHAR(150),
      name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(50),
      plan_type VARCHAR(50),
      snapshot JSONB NOT NULL,
      deleted_by UUID,
      deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function getAllUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash"] },
      order: [["created_at", "DESC"]],
    });

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

    if (!VALID_PLANS.includes(plan_type)) {
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

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const {
      name,
      last_name,
      age,
      email,
      preferred_niches,
      average_investment,
      profile_image_url,
      role,
      plan_type,
    } = req.body;

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }
    if (plan_type !== undefined && !VALID_PLANS.includes(plan_type)) {
      return res.status(400).json({ error: "Plan inválido" });
    }
    if (age !== undefined && age !== null && age !== "" && !Number.isInteger(Number(age))) {
      return res.status(400).json({ error: "Edad inválida" });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(409).json({ error: "Ese email ya está registrado" });
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (last_name !== undefined) user.last_name = last_name || null;
    if (age !== undefined) user.age = age === "" || age === null ? null : Number(age);
    if (preferred_niches !== undefined) user.preferred_niches = preferred_niches || null;
    if (average_investment !== undefined) {
      user.average_investment = average_investment === "" || average_investment === null
        ? null
        : Number(average_investment);
    }
    if (profile_image_url !== undefined) user.profile_image_url = profile_image_url || null;
    if (role !== undefined) user.role = role;
    if (plan_type !== undefined) user.plan_type = plan_type;

    await user.save();
    const safeUser = user.toJSON();
    delete safeUser.password_hash;
    return res.json({ message: "Usuario actualizado", user: safeUser });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      return res.status(400).json({ error: "No puedes eliminar tu propia cuenta de administrador" });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    await ensureDeletedUsersLogTable();

    await sequelize.transaction(async (t) => {
      const snapshot = user.toJSON();
      await sequelize.query(
        `
        INSERT INTO deleted_users_log
          (original_user_id, email, name, last_name, role, plan_type, snapshot, deleted_by)
        VALUES
          (:original_user_id, :email, :name, :last_name, :role, :plan_type, :snapshot, :deleted_by)
        `,
        {
          replacements: {
            original_user_id: user.id,
            email: user.email,
            name: user.name,
            last_name: user.last_name,
            role: user.role,
            plan_type: user.plan_type,
            snapshot: JSON.stringify(snapshot),
            deleted_by: req.user?.id || null,
          },
          transaction: t,
        }
      );

      await user.destroy({ transaction: t });
    });

    return res.json({ message: "Usuario eliminado y registrado en bitácora" });
  } catch (err) {
    next(err);
  }
}

async function getDeletedUsersLog(req, res, next) {
  try {
    await ensureDeletedUsersLogTable();
    const [rows] = await sequelize.query(`
      SELECT id, original_user_id, email, name, last_name, role, plan_type, deleted_by, deleted_at
      FROM deleted_users_log
      ORDER BY deleted_at DESC
      LIMIT 200;
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getAllReports(req, res, next) {
  try {
    const reports = await Analysis.findAll({
      where: { deleted_at: null },
      order: [["created_at", "DESC"]],
      limit: 300,
    });

    const userIds = [...new Set(reports.map((r) => r.user_id))];
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ["id", "name", "last_name", "email"],
    });
    const usersMap = Object.fromEntries(users.map((u) => [u.id, u.toJSON()]));

    const normalized = reports.map((r) => {
      const a = r.toJSON();
      const owner = usersMap[a.user_id] || null;
      return {
        id: a.id,
        user_id: a.user_id,
        user_name: owner ? `${owner.name || ""} ${owner.last_name || ""}`.trim() : "Usuario eliminado",
        user_email: owner?.email || "—",
        business_name: a.business_name,
        sector: a.sector,
        municipio: a.municipio,
        estado: a.estado,
        inversion_inicial: a.inversion_inicial,
        viability_score: a.viability_score,
        status: a.status,
        created_at: a.created_at,
        selected_options: a.params || {},
      };
    });

    res.json(normalized);
  } catch (err) {
    next(err);
  }
}

async function getReportById(req, res, next) {
  try {
    const analysis = await Analysis.findByPk(req.params.id);
    if (!analysis) return res.status(404).json({ error: "Reporte no encontrado" });

    const owner = await User.findByPk(analysis.user_id, {
      attributes: ["id", "name", "last_name", "email"],
    });

    const payload = analysis.toJSON();
    payload.owner = owner ? owner.toJSON() : null;
    res.json(payload);
  } catch (err) {
    next(err);
  }
}

async function downloadReportPdfAsAdmin(req, res, next) {
  try {
    const analysis = await Analysis.findByPk(req.params.id);
    if (!analysis) return res.status(404).json({ error: "Reporte no encontrado" });

    const pdfBuffer = await generatePDF(analysis.toJSON());
    const safeName = (analysis.business_name || "reporte")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="xaiza_admin_${safeName}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

async function getUsageSummary(req, res, next) {
  try {
    const [totalsRows] = await sequelize.query(`
      SELECT
        COUNT(*)::int AS total_reports,
        COALESCE(AVG(inversion_inicial), 0)::numeric(15,2) AS avg_inversion,
        COALESCE(AVG(viability_score), 0)::numeric(10,2) AS avg_viability
      FROM analyses
      WHERE deleted_at IS NULL;
    `);

    const [topMunicipios] = await sequelize.query(`
      SELECT municipio, COUNT(*)::int AS total
      FROM analyses
      WHERE deleted_at IS NULL
      GROUP BY municipio
      ORDER BY total DESC
      LIMIT 10;
    `);

    const [topSectores] = await sequelize.query(`
      SELECT sector, COUNT(*)::int AS total
      FROM analyses
      WHERE deleted_at IS NULL
      GROUP BY sector
      ORDER BY total DESC
      LIMIT 10;
    `);

    const [topEstados] = await sequelize.query(`
      SELECT estado, COUNT(*)::int AS total
      FROM analyses
      WHERE deleted_at IS NULL
      GROUP BY estado
      ORDER BY total DESC
      LIMIT 10;
    `);

    const [monthlyUsage] = await sequelize.query(`
      SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
             COUNT(*)::int AS total
      FROM analyses
      WHERE deleted_at IS NULL
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) DESC
      LIMIT 12;
    `);

    const [planDistribution] = await sequelize.query(`
      SELECT plan_type, COUNT(*)::int AS total
      FROM users
      GROUP BY plan_type
      ORDER BY total DESC;
    `);

    res.json({
      totals: totalsRows[0] || { total_reports: 0, avg_inversion: 0, avg_viability: 0 },
      top_municipios: topMunicipios,
      top_sectores: topSectores,
      top_estados: topEstados,
      monthly_usage: monthlyUsage.reverse(),
      plan_distribution: planDistribution,
    });
  } catch (err) {
    next(err);
  }
}

function generateTempPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { new_password } = req.body || {};

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const tempPassword = (new_password && String(new_password).trim()) || generateTempPassword();
    if (tempPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña temporal debe tener al menos 6 caracteres" });
    }

    user.password_hash = await bcrypt.hash(tempPassword, 12);
    await user.save();

    return res.json({
      message: "Contraseña restablecida correctamente",
      temp_password: tempPassword,
      user_id: user.id,
      user_email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  updateUserPlan,
  updateUser,
  deleteUser,
  getDeletedUsersLog,
  getAllReports,
  getReportById,
  downloadReportPdfAsAdmin,
  getUsageSummary,
  resetUserPassword,
};
