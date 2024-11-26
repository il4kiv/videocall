const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Initialize Express app
const app = express();

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// WebRTC signaling logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle room joining
  socket.on("join", ({ room }) => {
    console.log(`User ${socket.id} joined room ${room}`);
    socket.join(room);
  });

  // Handle WebRTC offer
  socket.on("offer", ({ room, offer }) => {
    console.log(`Received offer for room ${room}`);
    socket.to(room).emit("offer", offer);
  });

  // Handle WebRTC answer
  socket.on("answer", ({ room, answer }) => {
    console.log(`Received answer for room ${room}`);
    socket.to(room).emit("answer", answer);
  });

  // Handle ICE candidates
  socket.on("candidate", ({ room, candidate }) => {
    console.log(`Received ICE candidate for room ${room}`);
    socket.to(room).emit("candidate", candidate);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Use the environment-provided port or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
