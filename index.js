// index.js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const http = require("http");
const { Server } = require("socket.io");

// Import routes
const userRoutes = require("./src/routes/user");
const pollRoutes = require("./src/routes/poll");
const voteRoutes = require("./src/routes/vote");

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // For testing, allow all origins
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/polls", pollRoutes);
app.use("/votes", voteRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Broadcast helper for polls
async function broadcastPollUpdate(pollId) {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: { votes: true },
        },
      },
    });

    if (poll) {
      io.emit(`poll-${pollId}-update`, poll);
    }
  } catch (err) {
    console.error("Error broadcasting poll update:", err);
  }
}

global.broadcastPollUpdate = broadcastPollUpdate;

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
