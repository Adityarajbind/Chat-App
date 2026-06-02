import { Plus, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinRoomModal from "../components/JoinRoomModal";
import CreateRoomModal from "../components/CreateRoomModal";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { username, email, userId } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);

  const [roomName, setRoomName] = useState("");

  const [roomCode, setRoomCode] = useState("");

const HandleCreateRoom = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/rooms/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomName,
        }),
      }
    );

    const result = await response.json();

    console.log(result);

    if (response.ok) {
      navigate(`/room/${result.roomCode}`);
    }
  } catch (error) {
    console.error(error);
  }
};

const HandleJoinRoom = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/rooms/join",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomCode,
        }),
      }
    );

    const result = await response.json();

    console.log(result);

    if (response.ok) {
      navigate(`/room/${result.roomCode}`);
    }
  } catch (error) {
    console.error(error);
  }
};
  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage: "url('/background.png')",
      }}
    >
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomName={roomName}
        setRoomName={setRoomName}
        onCreate={HandleCreateRoom}
      />

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        roomCode={roomCode}
        setRoomCode={setRoomCode}
        onJoin={HandleJoinRoom}
      />
      {/* Overlay */}
      <div className="min-h-screen bg-black/40 backdrop-blur-[2px]">
        <Header username={username} />
        {/* Main Content */}
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pt-8">
          <h1 className="playwrite mb-4 text-center text-5xl">Welcome Back</h1>

          <p className="mb-12 text-center text-white/70">
            Create a room or join an existing one.
          </p>

          {/* Action Cards */}
          <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
            {/* Create Room */}
            <div
              className="group cursor-pointer rounded-3xl overflow-hidden backdrop-blur-md bg-white/10 border-2  border-white/15 p-8  transition hover:scale-[1.02] hover:bg-white/15"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={40} className="mb-4 text-violet-400" />

              <h2 className="mb-2 text-2xl font-semibold">Create Room</h2>

              <p className="text-white/60">
                Generate a new room and invite others with a room code.
              </p>
            </div>

            {/* Join Room */}
            <div
              className="group cursor-pointer rounded-3xl overflow-hidden backdrop-blur-md bg-white/10 border-2  border-white/15 p-8  transition hover:scale-[1.02] hover:bg-white/15"
              onClick={() => setShowJoinModal(true)}
            >
              <LogIn size={40} className="mb-4 text-violet-400" />

              <h2 className="mb-2 text-2xl font-semibold">Join Room</h2>

              <p className="text-white/60">
                Enter a room code and start chatting instantly.
              </p>
            </div>
          </div>

          {/* Recent Rooms */}
          <div className="mt-16 w-full max-w-4xl">
            <h2 className="mb-6 text-2xl font-semibold">Recent Rooms</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div>
                  <h3 className="font-medium">General Chat</h3>
                  <p className="text-sm text-white/60">Room Code: A7K92B</p>
                </div>

                <span className="text-sm text-green-400">8 Online</span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <div>
                  <h3 className="font-medium">Gaming Room</h3>
                  <p className="text-sm text-white/60">Room Code: X4M8PQ</p>
                </div>

                <span className="text-sm text-green-400">3 Online</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button className="mt-12 cursor-pointer flex items-center gap-2 rounded-xl bg-red-500/20 px-6 py-3 text-red-300 transition hover:bg-red-500/30">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
