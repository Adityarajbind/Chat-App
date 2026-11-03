import { useEffect, useState } from "react";
import { Clock3, LogOut, LogIn, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import JoinRoomModal from "../components/JoinRoomModal";
import CreateRoomModal from "../components/CreateRoomModal";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/useToast";
import { BACKEND_URL } from "../api/config";

const Home = () => {
  const navigate = useNavigate();
  const { username, token, logout } = useAuth();
  const { showToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [recentRooms, setRecentRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchRecentRooms = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = await response.json();

        if (!response.ok) {
          throw new Error(user.message || "Could not load your recent rooms.");
        }

        const roomsByCode = new Map();
        [...(Array.isArray(user.recentrooms) ? user.recentrooms : [])]
          .reverse()
          .forEach((room) => {
            if (room?.roomCode && !roomsByCode.has(room.roomCode)) {
              roomsByCode.set(room.roomCode, room);
            }
          });
        setRecentRooms([...roomsByCode.values()]);
      } catch (error) {
        showToast(error.message || "Could not load your recent rooms.", "error");
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRecentRooms();
  }, [showToast, token]);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      showToast("Enter a name for your room first.", "error");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomName: roomName.trim() }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not create the room.");
      }

      showToast("Room created. Invite your friends with the room code!", "success");
      setShowCreateModal(false);
      navigate(`/room/${result.roomCode}`);
    } catch (error) {
      showToast(error.message || "Could not create the room.", "error");
    }
  };

  const handleJoinRoom = async (code = roomCode) => {
    const finalRoomCode = code.trim().toUpperCase();
    if (!finalRoomCode) {
      showToast("Enter a room code to join.", "error");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomCode: finalRoomCode }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not join that room.");
      }

      showToast(`Joined ${result.roomName || "the room"}!`, "success");
      setShowJoinModal(false);
      navigate(`/room/${result.roomCode}`);
    } catch (error) {
      showToast(error.message || "Could not join that room.", "error");
    }
  };


  const handleLogout = () => {
    logout();
    showToast("You have been logged out.", "info");
    navigate("/auth");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white opacity-95"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        roomName={roomName}
        setRoomName={setRoomName}
        onCreate={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        roomCode={roomCode}
        setRoomCode={setRoomCode}
        onJoin={handleJoinRoom}
      />

      <div className="min-h-screen">
        <Header username={username} />
        <main className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-12 pt-8">
          <h1 className="playwrite mb-4 text-center text-5xl">Welcome Back</h1>
          <p className="mb-12 text-center text-white/70">
            Create a room or join an existing one.
          </p>

          <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
            <button
              type="button"
              className="group cursor-pointer overflow-hidden rounded-3xl border-2 border-white/15 bg-white/10 p-8 text-left backdrop-blur-md transition hover:scale-[1.02] hover:bg-white/15"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={40} className="mb-4 text-violet-400" />
              <h2 className="mb-2 text-2xl font-semibold">Create Room</h2>
              <p className="text-white/60">
                Generate a new room and invite others with a room code.
              </p>
            </button>

            <button
              type="button"
              className="group cursor-pointer overflow-hidden rounded-3xl border-2 border-white/15 bg-white/10 p-8 text-left backdrop-blur-md transition hover:scale-[1.02] hover:bg-white/15"
              onClick={() => setShowJoinModal(true)}
            >
              <LogIn size={40} className="mb-4 text-violet-400" />
              <h2 className="mb-2 text-2xl font-semibold">Join Room</h2>
              <p className="text-white/60">
                Enter a room code and start chatting instantly.
              </p>
            </button>
          </div>

          <section className="mt-16 w-full max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Rooms</h2>
              {!isLoadingRooms && recentRooms.length > 0 && (
                <span className="text-sm text-white/50">
                  {recentRooms.length} {recentRooms.length === 1 ? "room" : "rooms"}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {isLoadingRooms ? (
                <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-white/60 backdrop-blur-md">
                  Loading your recent rooms...
                </div>
              ) : recentRooms.length > 0 ? (
                recentRooms.map((room) => (
                  <button
                    type="button"
                    key={room._id || room.roomCode}
                    onClick={() => handleJoinRoom(room.roomCode)}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-md transition hover:border-violet-300/40 hover:bg-white/15"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {room.roomName || "Untitled room"}
                      </span>
                      <span className="mt-1 block text-sm text-white/60">
                        Room code: {room.roomCode}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-4 text-sm text-white/60">
                      <span className="hidden items-center gap-1.5 sm:flex">
                        <Users size={15} />
                        {room.members?.length ?? 0}
                      </span>
                      {room.lastActivity && (
                        <span className="hidden items-center gap-1.5 md:flex">
                          <Clock3 size={15} />
                          {new Date(room.lastActivity).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-violet-200">Join</span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-md">
                  <p className="font-medium">No recent rooms yet</p>
                  <p className="mt-1 text-sm text-white/60">
                    Create a room or join one to see it here.
                  </p>
                </div>
              )}
            </div>
          </section>

          <button
            type="button"
            className="mt-12 flex cursor-pointer items-center gap-2 rounded-xl bg-red-500/20 px-6 py-3 text-red-300 transition hover:bg-red-500/30"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </main>
      </div>
    </div>
  );
};

export default Home;
