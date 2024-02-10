import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";

const StreamersView = () => {
  let { broadcasterId } = useParams();
  const [stream,setStream] = useState()
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

  let peerConnection;
  const videoRef = useRef();

  useEffect(() => {
    socket.on("offer", (id, description) => {
      peerConnection = new RTCPeerConnection(config);
      peerConnection
        .setRemoteDescription(description)
        .then(() => peerConnection.createAnswer())
        .then((sdp) => peerConnection.setLocalDescription(sdp))
        .then(() => {
          socket.emit("answer", id, peerConnection.localDescription);
        });
      peerConnection.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
        setStream(event.streams[0])
      };
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", id, event.candidate);
        }
      };
    });
  }, [socket]);

  useEffect(() => {
    socket.on("candidate", (id, candidate) => {
      if(candidate){
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) => console.error(e));
      }
    });
  }, [socket]);

  useEffect(() => {
    socket.on("disconnectPeer", () => {
      peerConnection.close();
    });
  }, [socket]);

  useEffect(() => {
    window.onunload = window.onbeforeunload = () => {
      socket.emit("watcher-disconnect");
      peerConnection.close();
      socket.close();
    };
  }, [window, socket]);

  const handleWatcher = () => {
    socket.emit("watcher", broadcasterId);
  };

  return (
    <div className="watch__main-container">
      <div className="watch__sub-container">
        <h1 className="watch__header">Watch page</h1>
        <ReactPlayer className="video"
          ref={videoRef}
          url={stream}
          playing
          playsinline
          controls
          muted
          />
      </div>
      <button className="watch__button" onClick={() => handleWatcher()}>
        Connect
      </button>
    </div>
  );
};


export default StreamersView