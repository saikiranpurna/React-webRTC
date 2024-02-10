const express = require("express");
const app = express();

var cors = require("cors");
app.use(cors());

const port = Number(process.env.PORT) || 4004;
const roomStreamIDToSocketIdMap = new Map();

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, { origins: "*:*", cors: true });

var bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/health", (request, response) => {
  return response.json({ info: "health OK" });
});

io.sockets.on("error", (e) => console.log(e));

io.sockets.on("connection", (socket) => {
  socket.on("broadcaster", (roomId) => {
    roomStreamIDToSocketIdMap.set(roomId, socket.id);
    broadcaster = socket.id;
    // console.log("broadcaster set<<<<<<<<<<", roomId, socket.id);
    socket.emit("broadcaster", broadcaster);
  });
  socket.on("watcher", (broadcasterId) => {
    const getId = roomStreamIDToSocketIdMap.get(broadcasterId);
    socket.to(getId).emit("watcher", socket.id);
    // console.log("watcher set", socket.id);
    // console.log("broadcasterId", getId, broadcasterId);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
    // console.log("offer sent", message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
    // console.log("answer sent");
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
    // console.log("candidate", message);
  });

  socket.on("close", () => {
    console.log("closed socket");
  });

  socket.on("new-broadcaster", (broadcaster) => {
    socket.broadcast.emit("active-broadcaster", broadcaster);
    // console.log("active-broadcaster emitted", broadcaster);
  });

  socket.on("watcher-disconnect", () => {
    // console.log("watcher disconnected")
    socket.emit("disconnectPeer", socket.id);
  });

  socket.on("new message", (data) => {
    // console.log(data.room);
    socket.broadcast.to(data.room).emit("receive message", data);
  });
  socket.on("room", (data) => {
    // console.log("room join");
    // console.log(data);
    socket.join(data.room);
  });

  socket.on("leave room", (data) => {
    // console.log("leaving room");
    // console.log(data);
    socket.leave(data.room);
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;
