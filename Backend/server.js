import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudnary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/usersRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// 🔥 create HTTP server
const server = http.createServer(app);

// 🔥 socket setup
const io = new Server(server, {
  cors: { origin: "*" }
});

// DB connections
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Hello I am working Dude 😎");
});

// 🔌 socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

// ❗ IMPORTANT: yaha server.listen use karo
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔥 join doctor room
  socket.on("joinDoctor", (doctorId) => {
    socket.join(doctorId);
    console.log(`User joined doctor room: ${doctorId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
app.set("io", io);