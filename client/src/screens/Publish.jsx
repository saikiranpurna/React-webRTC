import React, { useState, useCallback, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Publish = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [myStream, setMyStream] = useState(null);
  const [showPublish, setShowPublish] = useState(false);
  const [showView, setShowView] = useState(false);
  const socket = useSocket();
  //   console.log(socket,"???????????????//")

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("broadcaster", { email, room });
    },
    [email, room, socket]
  );

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    setShowPublish(true);
  };
  const handleStopRecording = () => {
    console.log("stop recording");
  };
  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);
  const handleWatcherRoom = useCallback(
    async (data) => {
        console.log("??????????????/",data)
      const { id } = data;
      peer.peer[id] = peer.peer;
      id && setShowView(true);
      peer.peer.onicecandidate = (event) => {
          if (event.candidate) {
              socket.emit("candidate", id, event.candidate);
            }
        };
        const offer = await peer.getOffer();
        sendStreams()
      socket.emit("offer", id, offer);
      
    },
    [socket, showView, sendStreams]
  );

  const handleCandidate = useCallback(async (id, candidate) => {
    await peer.peer[id].addIceCandidate(new RTCIceCandidate(candidate));
  }, []);
  const handleAnswer = useCallback(async (id, description) => {
    await peer.peer[id].setRemoteDescription(description);
  }, []);
  const handleDisconnetPeer = useCallback(async (id) => {
    await peer.peer[id].close();
    delete peer.peer[id];
  }, []);
  useEffect(() => {
    socket.on("watcher", handleWatcherRoom);
    socket.on("candidate", handleCandidate);
    socket.on("answer", handleAnswer);
    // socket.on("disconnectPeer", handleDisconnetPeer);

    return () => {
      socket.off("watcher", handleWatcherRoom);
      socket.off("candidate", handleCandidate);
      socket.off("answer", handleAnswer);
    //   socket.off("disconnectPeer", handleDisconnetPeer);
    };
  }, [
    socket,
    handleWatcherRoom,
    handleCandidate,
    handleAnswer,
    // handleDisconnetPeer,
  ]);

  return (
    <div>
      <h1>Live BroadCast</h1>
      <form>
        <label htmlFor="email">Email ID</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room ID</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        {myStream && (
          <>
            <h1>My Stream</h1>
            <ReactPlayer
              playing
              muted
              height="500px"
              width="500px"
              url={myStream}
              controls={true}
            />
          </>
        )}
      </form>
      {!myStream ? (
        <button onClick={() => handleStartRecording()}>Start Recording</button>
      ) : (
        <button onClick={() => handleStopRecording()}>Stop Recording</button>
      )}

      {showPublish && <button onClick={handleSubmitForm}>Publish</button>}
      <br />
      {showView && (
        <a href={`/view/${room}`} target="_blank" rel="noreferrer">
          Click To View
        </a>
      )}
    </div>
  );
};

export default Publish;
