import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";


const Streamer = () => {
  const [broadcaster, setBroadcaster] = useState("");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [peerConnections, setPeerConnections] = useState({});
  const [numberOfViewers, setNumberOfViewers] = useState(0);
  const [broadcastLaunched, setBroadcastLaunched] = useState(false);
  const [localStream,setLocalStream] = useState(  )
  const [showView,setShowView] = useState(false)
  const [constraints, setConstraints] = useState({
    audio: true,
    video: true,
  });

  const config = {
    iceServers: [
      {
        urls: [
          "stun:34.100.254.187:3478",
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ],
      },
      {
        urls: "turn:34.100.254.187:3478?transport=tcp",
        username: "turnuser",
        credential: "turn456",
      },
    ],
  };

  const socket = useSocket();

  const videoRef = useRef();


  useEffect(() => {
    socket.on("broadcaster", (id) => {
      setBroadcaster(id);
    });
  }, [socket]);

  useEffect(() => {
    console.log("?????????????????")
    socket.on("watcher", (id) => {
      const peerConnection = new RTCPeerConnection(config);
      peerConnections[id] = peerConnection;

      setPeerConnections((peerConnections[id] = peerConnection));
      let stream = videoRef.current.srcObject;
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", id, event.candidate);
        }
      };

      peerConnection
        .createOffer()
        .then((sdp) => peerConnection.setLocalDescription(sdp))
        .then(() => {
          socket.emit("offer", id, peerConnection.localDescription);
        });
      setNumberOfViewers(Object.keys(peerConnections).length);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("answer", (id, description) => {
      peerConnections[id].setRemoteDescription(description);
    });
  }, [socket]);

  useEffect(() => {
    socket.on("candidate", (id, candidate) => {
      peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
    });
  }, [socket]);

  useEffect(() => {
    socket.on("disconnectPeer", (id) => {
      peerConnections[id].close();
      delete peerConnections[id];
      setNumberOfViewers(Object.keys(peerConnections).length);
    });
  }, [socket]);

  useEffect(() => {
    window.onunload = window.onbeforeunload = () => {
      disconnectBroadcaster();
      socket.close();
    };
  }, [window]);

  const handleNewBroadcaster = async() => {

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = mediaStream;
      setLocalStream(mediaStream)
    }
    socket.emit("broadcaster", roomId);
  };

  const launchBroadcast = async () => {
    try {
      setBroadcastLaunched(true);
      let broadcasterData = {
        socket_id: broadcaster,
        username: name
    };
      console.log(broadcasterData,"broadcaster")
      socket.emit("new-broadcaster", broadcasterData);
      setShowView(true)
      return broadcasterData;
    } catch (error) {
      console.log("err:", error);
    }
  };

  const disconnectBroadcaster = async () => {
    try {
      socket.emit("stop-broadcaster");
    } catch (error) {
      console.log("err:", error);
    }
  };
  console.log(localStream,"????????????")
  return (
    <div className="broadcast__main-container">
      <div className="broadcast__sub-container">
        <h1 className="broadcast__header">Streamer</h1>
        <div className="name-input">
          <label htmlFor="name">Name:</label>
          <input
            placeholder="Enter your username"
            className="joinInput"
            type="text"
            id="name"
            onChange={(event) => setName(event.target.value)}
          />
          <br/>
          <label htmlFor="roomid">RoomId:</label>
          <input
            placeholder="Enter your RooId"
            className="joinInput"
            type="text"
            id="roomid"
            onChange={(event) => setRoomId(event.target.value)}
          />
        </div>
        <ReactPlayer
          muted
          ref={videoRef}
          url={localStream}
          playsInline
          playing

        />
        <button
          className="broadcast__button"
          onClick={() => handleNewBroadcaster()}
        >
          Connect
        </button>
        <button
          disabled={broadcastLaunched ? true : false}
          className="broadcast__button"
          onClick={(e) => (!name ? e.preventDefault : launchBroadcast())}
        >
          Start Broadcast
        </button>
        <button
          className="broadcast__button"
          onClick={() => disconnectBroadcaster()}
        >
          End Broadcast
        </button>
        {showView && (
        <a href={`/viewer/${roomId}`} target="_blank" rel="noreferrer">
          Click To View
        </a>
      )}
        <h3>Viewers: {numberOfViewers}</h3>
      </div>
    </div>
  );
};

export default Streamer;
