const { Server } = require("socket.io");

const io = new Server(8000, {
  cors: true,
});
let broadcaster;

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
const roomStreamIDToSocketIdMap = new Map()
const socketidTRroomStreamID = new Map()

// io.on("connection", (socket) => {
//   // console.log(`Socket Connected`, socket.id);
//   // call P2P
//   socket.on("room:join", (data) => {
//     const { email, room } = data;
//     emailToSocketIdMap.set(email, socket.id);
//     socketidToEmailMap.set(socket.id, email);
//     io.to(room).emit("user:joined", { email, id: socket.id });
//     socket.join(room);
//     io.to(socket.id).emit("room:join", data);
//   });

//   socket.on("user:call", ({ to, offer }) => {
//     io.to(to).emit("incomming:call", { from: socket.id, offer });
//   });

//   socket.on("call:accepted", ({ to, ans }) => {
//     io.to(to).emit("call:accepted", { from: socket.id, ans });
//   });

//   socket.on("peer:nego:needed", ({ to, offer }) => {
//     console.log("peer:nego:needed", offer);
//     io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
//   });

//   socket.on("peer:nego:done", ({ to, ans }) => {
//     console.log("peer:nego:done", ans);
//     io.to(to).emit("peer:nego:final", { from: socket.id, ans });
//   });

//   //broadcast P2P ===========================================
//   socket.on("broadcaster", (data) => {
//     const {email, room} = data
//     broadcaster = socket.id;
//     roomStreamIDToSocketIdMap.set(room,socket.id)
//     socket.broadcast.emit("broadcaster");
//   });
//   socket.on("watcher", (data) => {
//     const { room} = data
//     const getId = roomStreamIDToSocketIdMap.get(room)
//     // console.log(socket.id,"???????????????")
//     io.to(getId).emit("watcher", {id:socket.id});
//   });
//   socket.on("offer", (id, message) => {
//     io.to(id).emit("offer", socket.id, message);
//   });
//   socket.on("answer", (id, message) => {
//     io.to(id).emit("answer", socket.id, message);
//   });
//   socket.on("candidate", (id, message) => {
//     io.to(id).emit("candidate", socket.id, message);
//   });
//   socket.on("disconnectsockets", () => {
//     io.to(broadcaster).emit("disconnectPeer", socket.id);
//   });

// });


io.sockets.on("connection", (socket) => {
  socket.on("broadcaster", (roomId) => {
    roomStreamIDToSocketIdMap.set(roomId,socket.id)
    broadcaster = socket.id;
    console.log("broadcaster set<<<<<<<<<<", roomId,socket.id);
    socket.emit("broadcaster", broadcaster);
  });
  socket.on("watcher", (broadcasterId) => {
    const getId = roomStreamIDToSocketIdMap.get(broadcasterId)
    socket.to(getId).emit("watcher", socket.id);
    // console.log("watcher set", socket.id);
    console.log("broadcasterId",getId, broadcasterId);
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
    console.log("closed socket")
  })

  socket.on("new-broadcaster", (broadcaster) => {
    socket.broadcast.emit("active-broadcaster", broadcaster);
    console.log("active-broadcaster emitted",broadcaster);
  });
  
  socket.on("watcher-disconnect", () => {
    // console.log("watcher disconnected")
    socket.emit("disconnectPeer", socket.id)
  })

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
