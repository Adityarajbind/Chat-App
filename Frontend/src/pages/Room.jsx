import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, LogOut, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/useToast";
import socket from "../socket";
import { BACKEND_URL } from "../api/config";

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { username, userId, token } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const messagesEndRef = useRef(null);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      showToast("Room code copied to clipboard.", "success");

      window.setTimeout(() => setCopied(false), 1000);
    } catch {
      showToast("Could not copy the room code.", "error");
    }
  };

  const getMembers = useCallback(async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/rooms/${roomCode}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load room members.");
      }

      setMembers(result);
    } catch (error) {
      showToast(error.message || "Could not load room members.", "error");
    }
  }, [roomCode, showToast, token]);

  useEffect(() => {
    let isActive = true;

    const loadRoomData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [roomResponse, membersResponse, messagesResponse] =
          await Promise.all([
            fetch(`${BACKEND_URL}/api/rooms/${roomCode}`, { headers }),
            fetch(`${BACKEND_URL}/api/rooms/${roomCode}/members`, {
              headers,
            }),
            fetch(`${BACKEND_URL}/api/messages/${roomCode}`, {
              headers,
            }),
          ]);
        const [roomResult, membersResult, messagesResult] = await Promise.all([
          roomResponse.json(),
          membersResponse.json(),
          messagesResponse.json(),
        ]);

        if (!roomResponse.ok) {
          throw new Error(roomResult.message || "Could not load this room.");
        }
        if (!membersResponse.ok) {
          throw new Error(membersResult.message || "Could not load room members.");
        }
        if (!messagesResponse.ok) {
          throw new Error(messagesResult.message || "Could not load messages.");
        }

        if (isActive) {
          setRoom(roomResult);
          setMembers(membersResult);
          setMessages(messagesResult);
        }
      } catch (error) {
        if (isActive) {
          showToast(error.message || "Could not load this room.", "error");
        }
      }
    };

    if (token) {
      loadRoomData();
    }

    return () => {
      isActive = false;
    };
  }, [roomCode, showToast, token]);

  useEffect(() => {
    socket.emit("join_room", {
      roomCode,
      username,
    });
  }, [roomCode, username]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      setMessages((currentMessages) => [...currentMessages, newMessage]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    const handleMemberJoined = (data) => {
      getMembers();
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          _id: Date.now(),
          type: "system",
          content: data.message,
        },
      ]);
    };
    const handleMemberLeft = (data) => {
      getMembers();
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          _id: Date.now(),
          type: "system",
          content: data.message,
        },
      ]);
    };

    socket.on("member_joined", handleMemberJoined);
    socket.on("member_left", handleMemberLeft);

    return () => {
      socket.off("member_joined", handleMemberJoined);
      socket.off("member_left", handleMemberLeft);
    };
  }, [getMembers]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomCode,
          content: message.trim(),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not send your message.");
      }

      setMessage("");
    } catch (error) {
      showToast(error.message || "Could not send your message.", "error");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomCode }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not leave the room.");
      }

      socket.emit("leave_room", {
        roomCode,
        username,
      });
      showToast("You left the room.", "info");
      navigate("/");
    } catch (error) {
      showToast(error.message || "Could not leave the room.", "error");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="min-h-screen p-6">
        <header className="mb-6 flex items-center justify-between gap-4 overflow-hidden rounded-3xl border-2 border-white/15 bg-white/10 p-5 backdrop-blur-sm">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-bold">
              {room?.roomName || "Room Chat"}
            </h1>
            <p className="text-white/60">Room Code: {roomCode}</p>
          </div>

          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={copyRoomCode}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 py-2 transition hover:bg-white/20"
            >
              {copied ? (
                <Check strokeWidth={2.5} />
              ) : (
                <>
                  <Copy size={18} />
                  Copy
                </>
              )}
            </button>

            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-red-300 transition hover:bg-red-500/30"
              onClick={handleLeaveRoom}
            >
              <LogOut size={18} />
              Leave
            </button>
          </div>
        </header>

        <main className="grid h-[75vh] grid-cols-[1fr_280px] gap-6 max-[800px]:grid-cols-1 max-[800px]:grid-rows-[1fr_auto]">
          <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border-2 border-white/15 bg-white/10 backdrop-blur-md">
            <div className="glass-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
              {messages.map((currentMessage) => {
                if (currentMessage.type === "system") {
                  return (
                    <div
                      key={currentMessage._id}
                      className="my-2 text-center text-sm text-white/50"
                    >
                      {currentMessage.content}
                    </div>
                  );
                }

                const isOwnMessage = currentMessage.sender?._id === userId;

                return (
                  <div
                    key={currentMessage._id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[70%]">
                      <p
                        className={`text-xs text-white/60 ${isOwnMessage ? "text-right" : ""}`}
                      >
                        {currentMessage.sender?.username}
                      </p>
                      <div
                        className={`w-full rounded-md px-2 py-1 ${
                          isOwnMessage ? "bg-violet-600" : "bg-white/10"
                        }`}
                      >
                        <p>{currentMessage.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t-2 border-white/15 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  aria-label="Send message"
                  className="cursor-pointer rounded-xl bg-violet-600 px-5 transition hover:bg-violet-500"
                  onClick={handleSendMessage}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </section>

          <aside className="overflow-hidden rounded-3xl border-2 border-white/15 bg-white/10 p-5 backdrop-blur-md max-[800px]:max-h-40 max-[800px]:overflow-y-auto">
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
          </aside>
        </main>
      </div>
    </div>
  );
};

export default Room;
