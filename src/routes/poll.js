const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { pollSchema } = require("./validation"); 

const prisma = new PrismaClient();
const router = express.Router();

// Get all polls with options + votes count
router.get("/", async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: {
          include: { votes: true },
        },
      },
    });

    // votes count calculate karke bhejna
    const pollsWithCounts = polls.map((poll) => ({
      ...poll,
      options: poll.options.map((opt) => ({
        ...opt,
        votesCount: opt.votes.length,
      })),
    }));

    res.json(pollsWithCounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

// Get a specific poll by ID with votes count
router.get("/:id", async (req, res) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: req.params.id },
      include: {
        options: {
          include: { votes: true },
        },
      },
    });

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const pollWithCounts = {
      ...poll,
      options: poll.options.map((opt) => ({
        ...opt,
        votesCount: opt.votes.length,
      })),
    };

    res.json(pollWithCounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch poll" });
  }
});

// Create poll with validation
router.post("/", async (req, res) => {
  try {
    const parsed = pollSchema.parse(req.body);

    const poll = await prisma.poll.create({
      data: {
        question: parsed.question,
        creatorId: parsed.creatorId,
        options: {
          create: parsed.options.map((opt) => ({ text: opt })),
        },
      },
      include: { options: true },
    });

    res.status(201).json(poll);
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

module.exports = router;
