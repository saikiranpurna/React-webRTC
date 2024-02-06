import React, { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};
// const URL = "https://example-socket-service.onrender.com"
// const URL = "http://localhost:8000"
const URL = "http://34.100.173.165:8000/"

export const SocketProvider = (props) => {
  const socket = useMemo(() => io(URL), []);

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
