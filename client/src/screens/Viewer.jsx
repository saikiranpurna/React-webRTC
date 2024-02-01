import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const Viewer = () => {
  const socket = useSocket();
  const [remoteStream, setRemoteStream] = useState();

  const handleBroacaster = useCallback(() => {
    socket.emit("watcher");
  }, []);
  const handleCandidate = useCallback(async (id, candidate) => {
    await peer.peer
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch((e) => console.error(e));
  }, []);
  
  const handleOffer = useCallback(async (id, description) => {
    const ans = await peer.getAnswer(description)
    socket.emit("answer", id, ans);
    peer.peer.ontrack = (event) => {
      setRemoteStream(event.streams[0])
    };
    peer.peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  }, [remoteStream]);
  useEffect(() => {
    socket.on("broadcaster", handleBroacaster);
    socket.on("candidate", handleCandidate);
    socket.on("offer", handleOffer);
    return () => {
      socket.off("broadcaster", handleBroacaster);
      socket.off("candidate", handleCandidate);
      socket.off("offer", handleOffer);
    };
  }, [socket, handleBroacaster, handleCandidate, handleOffer]);

  return (
    <div>
      <h1>Viewer Page</h1>
      <h4>
        {remoteStream ? "Live" : "Live Feed is stopped or not at started"}
      </h4>
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="500px"
            width="500px"
            url={remoteStream}
            controls={true}
          />
        </>
      )}
    </div>
  );
};

export default Viewer;
