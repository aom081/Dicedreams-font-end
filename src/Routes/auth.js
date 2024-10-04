// routers/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password, name, telephone, dateOfBirth, gender } =
    req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
      telephone,
      dateOfBirth,
      gender,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login a user
router.post("/login", async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

module.exports = router;
