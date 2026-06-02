import { Send, LogOut, Copy, Check } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [copied, setcopied] = useState(false);
  const { username, email, userId } = useAuth();
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);

    setcopied(true);

    setTimeout(() => {
      setcopied(false);
    }, 1000);
  };
  const GetRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      setRoom(result);
    } catch (error) {
      console.error(error);
    }
  };
  const GetMembers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomCode}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      setMembers(result);
    } catch (error) {
      console.error(error);
    }
  };
  const GetMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/messages/${roomCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      setMessages(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    GetRoom();
    GetMembers();
    GetMessages();
  }, []);

  const HandleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomCode,
          content: message,
        }),
      });

      const result = await response.json();

      console.log(result);

      setMessage("");

      GetMessages();
    } catch (error) {
      console.error(error);
    }
  };
  const HandleLeaveRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/rooms/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomCode,
        }),
      });

      const result = await response.json();

      console.log(result);

      if (response.ok) {
        navigate("/");
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
      <div className="min-h-screen bg-black/40 backdrop-blur-[2px] p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-3xl overflow-hidden backdrop-blur-md bg-white/10 border-2  border-white/15 p-5 ">
          <div>
            <h1 className="text-3xl font-bold">Room Chat</h1>

            <p className="text-white/60">Room Code: {roomCode}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyRoomCode}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 py-2 transition hover:bg-white/20"
            >
              {copied ? (
                <Check strokeWidth={2.5} />
              ) : (
                <div className="flex gap-1 justify-center items-center">
                  {" "}
                  <Copy size={18} /> copy
                </div>
              )}
            </button>

            <button
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-red-300 transition hover:bg-red-500/30"
              onClick={HandleLeaveRoom}
            >
              <LogOut size={18} />
              Leave
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="grid h-[75vh] grid-cols-[1fr_280px] gap-6">
          {/* Messages */}
          <div className="flex flex-col rounded-3xl overflow-hidden backdrop-blur-md bg-white/10 border-2  border-white/15 transition ">
            {/* Messages List */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex  ${
                    msg.sender._id === userId ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[70%]">
                    <p className={`text-xs text-white/60 ${msg.sender._id === userId ? "text-right " : ""}`}>
                      {msg.sender.username}
                    </p>
                    <div
                      className={`w-full rounded-md px-2 py-1  ${
                        msg.sender._id === userId
                          ? "bg-violet-600"
                          : "bg-white/10"
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t-2 border-white/15 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      HandleSendMessage();
                    }
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
                />

                <button
                  className="cursor-pointer rounded-xl bg-violet-600 px-5 transition hover:bg-violet-500"
                  onClick={HandleSendMessage}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="rounded-3xl overflow-hidden backdrop-blur-md bg-white/10 border-2  border-white/15 transition p-5">
            <h2 className="mb-5 text-xl font-semibold">Members</h2>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                >
                  <div className="h-3 w-3 rounded-full bg-green-400" />

                  <span>{member.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
