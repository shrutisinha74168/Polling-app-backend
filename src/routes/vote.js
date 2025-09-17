const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { voteSchema } = require("./validation"); 

const prisma = new PrismaClient();
const router = express.Router();

// Get all votes
router.get("/", async (req, res) => {
  try {
    const votes = await prisma.vote.findMany({
      include: { user: true, option: true }, 
    });
    res.json(votes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch votes" });
  }
});

router.post("/", async (req, res) => {
  try {
    const parsed = voteSchema.parse(req.body);

    const vote = await prisma.vote.create({
      data: {
        userId: parsed.userId,
        optionId: parsed.optionId,
      },
    });

    const option = await prisma.pollOption.findUnique({
      where: { id: parsed.optionId },
      select: { pollId: true },
    });

    if (option && global.broadcastPollUpdate) {
      await global.broadcastPollUpdate(option.pollId);
    }

    res.json(vote);
  } catch (err) {
    res.status(400).json({ error: err.errors || err.message });
  }
});

module.exports = router;
