const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Serve static files from the "public" directory
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("offer", ({ room, offer }) => {
    socket.to(room).emit("offer", offer);
  });

  socket.on("answer", ({ room, answer }) => {
    socket.to(room).emit("answer", answer);
  });

  socket.on("candidate", ({ room, candidate }) => {
    socket.to(room).emit("candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start server on dynamic Glitch port or 3000
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
