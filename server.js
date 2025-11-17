import express from "express";
import http from "http";
import { Server } from "socket.io";

// Use the port Render provides, or default to 3000 for local dev
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Serve your docs folder (index.html, style.css, main.js) if you want Render to serve the frontend too
app.use(express.static("docs"));

// Socket.io server with CORS for your GH Pages frontend
const io = new Server(server, {
  cors: {
    origin: ["https://lilyrose1013.github.io", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  // Handle chat signals
  socket.on("signal", (data) => {
    socket.broadcast.emit("signal", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
