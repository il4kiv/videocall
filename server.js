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

// WebRTC signaling logic and room tracking
const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle room joining
  socket.on("join", ({ room }) => {
    if (!rooms[room]) {
      rooms[room] = [];
    }

    // Limit room to 2 participants
    if (rooms[room].length >= 2) {
      socket.emit("room_full", { message: "The room is full, two participants are already connected." });
      return;
    }

    // Add socket to room and notify others
    rooms[room].push(socket.id);
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
    console.log(`Current participants in room ${room}: ${rooms[room]}`);
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

    // Remove user from rooms
    for (const room in rooms) {
      if (rooms[room].includes(socket.id)) {
        rooms[room] = rooms[room].filter(id => id !== socket.id);
        console.log(`User ${socket.id} left room ${room}. Remaining participants: ${rooms[room]}`);

        // Notify remaining participants that someone has left
        socket.to(room).emit("user_left", { message: "User left the Video Call" });

        // If room is empty, delete the room
        if (rooms[room].length === 0) {
          delete rooms[room];
          console.log(`Room ${room} is now empty and has been deleted.`);
        }
      }
    }
  });
});

// Use the environment-provided port or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
