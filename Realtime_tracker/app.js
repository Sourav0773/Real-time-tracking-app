const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  // Handle incoming location data
  socket.on("send-location", (coords) => {
    const userId = socket.id;
    io.emit("receive-location", { id: userId, ...coords });
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    io.emit("user-disconnected", socket.id);
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
