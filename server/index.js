const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});
let broadcaster;

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
const roomStreamIDToSocketIdMap = new Map()
const socketidTRroomStreamID = new Map()

io.on("connection", (socket) => {
  // console.log(`Socket Connected`, socket.id);

  socket.on("room:join", (data) => {
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  //broadcast
  socket.on("broadcaster", (data) => {
    const {email, room} = data
    broadcaster = socket.id;
    roomStreamIDToSocketIdMap.set(room,socket.id)
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", (data) => {
    const { room} = data
    const getId = roomStreamIDToSocketIdMap.get(room)
    io.to(getId).emit("watcher", {id:socket.id});
  });
  socket.on("offer", (id, message) => {
    io.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    io.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    io.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    io.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
