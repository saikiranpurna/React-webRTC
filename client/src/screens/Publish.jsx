import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Publish = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [myStream, setMyStream] = useState(null);
  const [showPublish, setShowPublish] = useState(false);
  const [showView, setShowView] = useState(false);
  const [peerConnections, setPeerConnections] = useState({});
  const [mute,setMute] = useState('mute')
  const [cam,setCam] = useState("hide cam")
  const socket = useSocket();
  const streamRef = useRef(null);
  //   console.log(socket,"???????????????//")
  //   const peerConnections = {};
  const peerConnection = peer.peer;
  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      setShowView(true);
      socket.emit("broadcaster", { email, room });
    },
    [email, room, socket]
  );

  const handleStartRecording = async () => {
    if(!myStream){

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        streamRef.current = stream;
        sendStreams(peerConnection);
        setMyStream(stream);
        setShowPublish(true);
    }
  };
  const handleStopRecording = () => {
    myStream.getTracks().forEach(track => {
      
      // console.log("stop recording",track);
      track.stop()
    })
  };
  const handleMute = ()=>{
    // console.log(myStream.getAudioTracks()[0],"mutttttttttttttttt")
    if(streamRef.current.getAudioTracks()[0].enabled){
       
      streamRef.current.getAudioTracks()[0].enabled = false
      setMute("un mute")
    }
    else{
      streamRef.current.getAudioTracks()[0].enabled = true
      setMute("mute")

    }
    setMyStream(streamRef.current)
  }
  const handleCam = ()=>{
    if(streamRef.current.getVideoTracks()[0].enabled){
       
      streamRef.current.getVideoTracks()[0].enabled = false
      setCam("show cam")
    }
    else{
      streamRef.current.getVideoTracks()[0].enabled = true
      setMute("hide cam")

    }
    setMyStream(streamRef.current)
  }
  const sendStreams = useCallback(
    async (peerConnection) => {
      console.log(streamRef.current.getTracks(), ".getTracks()");
      for (const track of streamRef.current.getTracks()) {
        await peerConnection.addTrack(track, streamRef.current);
      }
    },
    [streamRef.current]
  );
  const handleWatcherRoom = useCallback(
    async (data) => {
      const { id } = data;
      //   peerConnections[id] = peerConnection;
      setPeerConnections({...peerConnections, [id]: peerConnection });
    //   setTimeout(async () => {
        peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
            socket.emit("candidate", id, event.candidate);
          }
        };
        const offer = await peer.getOffer();
        socket.emit("offer", id, offer);
//   }, [1000]);
    },
    [socket, showView]
  );

  const handleCandidate = useCallback(async (id, candidate) => {
    await peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  }, [peerConnections]);
  const handleAnswer = useCallback(async (id, description) => {
    await peerConnections[id].setRemoteDescription(description);
  }, [peerConnections]);
  const handleDisconnetPeer = useCallback(async (id) => {
    window.onunload = window.onbeforeunload = () => {
        socket.close();
        peerConnection.peer.close();
      };
  }, [peerConnection]);
  useEffect(() => {
    peerConnection.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      streamRef.current = remoteStream;
      // console.log("GOT TRACKS!!", ev);
      setMyStream(remoteStream[0]);
    });
    // peerConnection.addEventListener("icecandidate",(event)=>{
    //   console.log("perrrraddEventListenerrrrrrrrrrrs",event.candidate)

    // })
    return () =>{
      peerConnection.removeEventListener("track", async (ev) => {
        const remoteStream = ev.streams;
        streamRef.current = remoteStream;
        // console.log("GOT TRACKS!!", ev);
        setMyStream(remoteStream[0]);
      });
    }
  }, []);
  useEffect(() => {
    socket.on("watcher", handleWatcherRoom);
    socket.on("candidate", handleCandidate);
    socket.on("answer", handleAnswer);
    socket.on("disconnectPeer", handleDisconnetPeer);

    return () => {
      socket.off("watcher", handleWatcherRoom);
      socket.off("candidate", handleCandidate);
      socket.off("answer", handleAnswer);
      socket.off("disconnectPeer", handleDisconnetPeer);
    };
  }, [
    socket,
    handleWatcherRoom,
    handleCandidate,
    handleAnswer,
    handleDisconnetPeer,
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
      <br/>
      <button onClick={()=>handleMute()}>{mute}</button><br/>
      <button onClick={()=>handleCam()}>{cam}</button><br/>
      
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
