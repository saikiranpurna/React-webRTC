import { Routes, Route } from "react-router-dom";
import "./App.css";
import LobbyScreen from "./screens/Lobby";
import RoomPage from "./screens/Room";
import Publish from "./screens/Publish";
import Viewer from "./screens/Viewer";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* <Route path="/" element={<LobbyScreen />} /> */}
        <Route path="/" element={<Publish />} />
        <Route path="/view/:viewerId" element={<Viewer />} />
        {/* <Route path="/room/:roomId" element={<RoomPage />} /> */}
      </Routes>
    </div>
  );
}

export default App;
