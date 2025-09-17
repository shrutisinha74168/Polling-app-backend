const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { userSchema } = require("./validation");
const bcrypt = require("bcrypt");

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (without passwordHash)
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create user with validation
router.post("/", async (req, res) => {
  try {
    // validate input
    const parsed = userSchema.parse(req.body);

    // hash password
    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: hashedPassword,
      },
      select: { id: true, name: true, email: true }, 
    });

    res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
  
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(400).json({
      error: err.errors || err.message,
    });
  }
});

module.exports = router;
