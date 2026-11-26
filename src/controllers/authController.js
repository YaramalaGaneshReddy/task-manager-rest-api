const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function register(database) {
  return async function registerUser(req, res) {
    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const existingUser = database
      .prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE")
      .get(email);

    if (existingUser) {
      return res.status(409).json({ message: "Email address is already registered" });
    }

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const createdAt = new Date().toISOString();
    const result = database.prepare(`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `).run(name, email, passwordHash, createdAt);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: Number(result.lastInsertRowid),
        name,
        email,
      },
    });
  };
}

function login(database) {
  return async function loginUser(req, res) {
    const email = req.body.email.trim().toLowerCase();
    const user = database.prepare(`
      SELECT id, name, email, password_hash
      FROM users
      WHERE email = ? COLLATE NOCASE
    `).get(email);

    const passwordMatches = user
      ? await bcrypt.compare(req.body.password, user.password_hash)
      : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  };
}

module.exports = { register, login };
