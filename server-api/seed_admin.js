const { sequelize } = require("./src/config/database");
const User = require("./src/models/user.model");
const bcrypt = require("bcryptjs");

async function seedAdmin() {
  try {
    await sequelize.sync(); // ensure tables are created
    const email = "admin@neuromarket.tmp";
    const password_hash = await bcrypt.hash("admin12345", 12);
    
    const existing = await User.findOne({ where: { email } });
    if (!existing) {
      await User.create({
        name: "Admin Temporal",
        last_name: "Admin",
        email: email,
        password_hash,
        role: "admin",
        plan_type: "enterprise"
      });
      console.log("Admin creado exitosamente.");
    } else {
      console.log("El admin ya existe.");
    }
  } catch (e) {
    console.error("Error creating admin:", e);
  } finally {
    process.exit(0);
  }
}

seedAdmin();