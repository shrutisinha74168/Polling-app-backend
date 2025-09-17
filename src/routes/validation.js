const { z } = require("zod");

// User create validation
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Poll create validation
const pollSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string().min(1)).min(2, "At least 2 options required"),
  creatorId: z.number(), 
});

// Vote validation
const voteSchema = z.object({
  userId: z.number(),   
  optionId: z.number(), 
});

module.exports = { userSchema, pollSchema, voteSchema };
