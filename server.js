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
  },
  maxHttpBufferSize: 1e8 // Increase max buffer size to 100MB for image uploads
});

io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  // Handle chat signals
  socket.on("signal", (data) => {
    console.log(`Signal received from ${socket.id}:`, data.type);
    socket.broadcast.emit("signal", data);
  });

  socket.on("draw", (data) => {
    // rebroadcast to everyone except the sender
    socket.broadcast.emit("draw", data);
  });

  socket.on("clear", () => {
    // rebroadcast clear event to all other clients
    socket.broadcast.emit("clear");
  });

  socket.on("image", (imageData) => {
    // rebroadcast image to all other clients
    console.log("📷 User sent image:", socket.id);
    socket.broadcast.emit("image", imageData);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
