import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { useParams } from "react-router-dom";
// import { io } from "socket.io-client";

const Viewer = () => {
  const socket = useSocket();
  // const URL = "http://localhost:8000"
  // const socket = useMemo(() => io(URL), []);

  const {viewerId} = useParams()
  const [remoteStream, setRemoteStream] = useState();
  let peerConnection = peer;
  useEffect(() => {
    peerConnection.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      // console.log("GOT TRACKS!!", ev.streams);
      setRemoteStream(remoteStream[0]);
    });
    init();
  }, []);
    const init = () => {
      window.onunload = window.onbeforeunload = () => {
        socket.close();
        peerConnection.peer.close();
      };
    };
  const handleConnection = useCallback(() => {
    socket.emit("watcher",{room:viewerId});
  }, []);
  // const handleBrocaster = useCallback(() => {
  //   socket.emit("watcher",{room:viewerId});
  // }, []);
  const handleIcCnadidate = useCallback((id, candidate) => {
    peerConnection.peer
      .addIceCandidate(new RTCIceCandidate(candidate))
      .catch((e) => console.error(e));
  }, []);

  const handleOffer = useCallback(
    async (id, description) => {
      const ans = await peerConnection.getAnswer(description);
      socket.emit("answer", id, ans);
      peerConnection.peer.ontrack = (event) => {
        // console.log("event.streams>>>>>>>>>handleOffer",event.streams)
        setRemoteStream(event.streams[0]);
      };
      peerConnection.peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", id, event.candidate);
        }
      };
    },
    [socket, remoteStream]
  );
  useEffect(() => {
    socket.on("connect", handleConnection);
    // socket.on("broadcaster", handleBrocaster);
    socket.on("candidate", handleIcCnadidate);
    socket.on("offer", handleOffer);
    return () => {
      socket.off("connect", handleConnection);
      // socket.off("broadcaster", handleBrocaster);
      socket.off("candidate", handleIcCnadidate);
    };
  }, [
    socket,
    handleConnection,
    // handleBrocaster,
    handleIcCnadidate,
    handleOffer,
  ]);
  // console.log(remoteStream, "???????");
  return (
    <div>
      <h1>Live Page</h1>
      {remoteStream && (
        <>
          <h1>Viewer Stream</h1>
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
