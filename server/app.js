import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const port = 5000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const secretKey = "fgdhfdsvhjv";

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "fgdhfdsvhjv" }, secretKey);

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({ message: "Login Success" });
});

// io.use((socket, next) => {
//   cookieParser()(socket.request, socket.request.res, (err) => {
//     if (err) {
//       return next(err);
//     }

//     const token = socket.request.cookies.token;

//     if (!token) {
//       return next(new Error("Auth Error"));
//     }

//     const decoded = jwt.verify(token, secretKey);

//     next();
//   });
// });

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("message", (data) => {
    console.log(data);
    // io.emit("received-message", data.message) // Send message to all users including us
    // socket.broadcast.emit("received-message", data.message) // Send message to all users except us
    io.to(data.room).emit("received-message", data.message); // Send message to those users who are in same room
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
