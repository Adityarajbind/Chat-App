import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, LogOut, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/useToast";
import socket from "../socket";
import { BACKEND_URL } from "../api/config";

const mergeMessages = (currentMessages, incomingMessages) => {
  const mergedMessages = [...currentMessages];

  incomingMessages.forEach((incomingMessage) => {
    const isConfirmedMessage =
      incomingMessage._id &&
      !String(incomingMessage._id).startsWith("temp-");
    const existingIndex = mergedMessages.findIndex(
      (currentMessage) =>
        currentMessage._id === incomingMessage._id ||
        (incomingMessage.clientMessageId &&
          currentMessage.clientMessageId === incomingMessage.clientMessageId),
    );

    if (existingIndex === -1) {
      mergedMessages.push({
        ...incomingMessage,
        ...(incomingMessage.type === "system"
          ? {}
          : { status: incomingMessage.status || "sent" }),
      });
      return;
    }

    mergedMessages[existingIndex] = {
      ...mergedMessages[existingIndex],
      ...incomingMessage,
      ...(incomingMessage.type === "system"
        ? {}
        : {
            status: isConfirmedMessage
              ? "sent"
              : incomingMessage.status || mergedMessages[existingIndex].status,
          }),
    };
  });

  return mergedMessages.sort((first, second) => {
    const timeDifference =
      new Date(first.createdAt || 0).getTime() -
      new Date(second.createdAt || 0).getTime();

    return (
      timeDifference ||
      String(first._id || "").localeCompare(String(second._id || ""))
    );
  });
};

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
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const loadingOlderMessagesRef = useRef(false);
  const pendingScrollHeightRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);

  const addMessages = useCallback((incomingMessages, forceScroll = false) => {
    const container = messagesContainerRef.current;
    const isNearBottom =
      !container ||
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (forceScroll || isNearBottom) {
      shouldScrollToBottomRef.current = true;
    }

    setMessages((currentMessages) =>
      mergeMessages(currentMessages, incomingMessages),
    );
  }, []);

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
            fetch(`${BACKEND_URL}/api/messages/${roomCode}?limit=50`, {
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
        if (!Array.isArray(messagesResult.messages)) {
          throw new Error("Could not load messages.");
        }

        if (isActive) {
          setRoom(roomResult);
          setMembers(membersResult);
          setHasMoreMessages(messagesResult.hasMore);
          addMessages(messagesResult.messages, true);
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
  }, [addMessages, roomCode, showToast, token]);

  useEffect(() => {
    const joinRoom = () => {
      socket.emit("join_room", { roomCode, username });
    };
    const handleReceiveMessage = (newMessage) => {
      if (newMessage.roomCode === roomCode) {
        addMessages([newMessage]);
      }
    };
    const handleRoomError = (data) => {
      showToast(data.message || "Could not join this room.", "error");
    };

    socket.on("connect", joinRoom);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("room_error", handleRoomError);
    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("room_error", handleRoomError);
      if (socket.connected) {
        socket.emit("leave_room", { roomCode, username });
      }
    };
  }, [addMessages, roomCode, showToast, username]);

  useEffect(() => {
    const handleMemberJoined = (data) => {
      getMembers();
      addMessages([
        {
          _id: `system-${crypto.randomUUID()}`,
          type: "system",
          content: data.message,
          createdAt: new Date().toISOString(),
        },
      ]);
    };
    const handleMemberLeft = (data) => {
      getMembers();
      addMessages([
        {
          _id: `system-${crypto.randomUUID()}`,
          type: "system",
          content: data.message,
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    socket.on("member_joined", handleMemberJoined);
    socket.on("member_left", handleMemberLeft);

    return () => {
      socket.off("member_joined", handleMemberJoined);
      socket.off("member_left", handleMemberLeft);
    };
  }, [addMessages, getMembers]);

  const sendMessage = async (content, clientMessageId = crypto.randomUUID()) => {
    const optimisticMessage = {
      _id: `temp-${clientMessageId}`,
      clientMessageId,
      sender: { _id: userId, username },
      content,
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    addMessages([optimisticMessage], true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomCode,
          content,
          clientMessageId,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not send your message.");
      }
      addMessages([result], true);
    } catch (error) {
      setMessages((currentMessages) =>
        mergeMessages(currentMessages, [
          { clientMessageId, status: "failed" },
        ]),
      );
      showToast(error.message || "Could not send your message.", "error");
    }
  };

  const handleSendMessage = () => {
    const content = message.trim();
    if (!content) return;

    setMessage("");
    void sendMessage(content);
  };

  const loadOlderMessages = useCallback(async () => {
    if (
      loadingOlderMessagesRef.current ||
      !hasMoreMessages ||
      !messages.length
    ) {
      return;
    }

    const oldestMessage = messages.find(
      (currentMessage) =>
        currentMessage.type !== "system" &&
        !String(currentMessage._id).startsWith("temp-"),
    );
    if (!oldestMessage) return;

    loadingOlderMessagesRef.current = true;
    setLoadingOlderMessages(true);

    try {
      const searchParams = new URLSearchParams({
        limit: "50",
        beforeCreatedAt: oldestMessage.createdAt,
        beforeId: oldestMessage._id,
      });
      const response = await fetch(
        `${BACKEND_URL}/api/messages/${roomCode}?${searchParams}`,
        {
          headers: { Authorization: "Bearer " + token },
        },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not load older messages.");
      }
      if (!Array.isArray(result.messages)) {
        throw new Error("Could not load older messages.");
      }

      const container = messagesContainerRef.current;
      if (container && result.messages.length) {
        pendingScrollHeightRef.current = container.scrollHeight;
      }
      setHasMoreMessages(result.hasMore);
      setMessages((currentMessages) =>
        mergeMessages(currentMessages, result.messages),
      );
    } catch (error) {
      pendingScrollHeightRef.current = null;
      showToast(error.message || "Could not load older messages.", "error");
    } finally {
      loadingOlderMessagesRef.current = false;
      setLoadingOlderMessages(false);
    }
  }, [hasMoreMessages, messages, roomCode, showToast, token]);

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
    const container = messagesContainerRef.current;
    if (!container) return;

    if (pendingScrollHeightRef.current !== null) {
      container.scrollTop =
        container.scrollHeight - pendingScrollHeightRef.current;
      pendingScrollHeightRef.current = null;
      return;
    }

    if (shouldScrollToBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      shouldScrollToBottomRef.current = false;
    }
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
            <div
              ref={messagesContainerRef}
              onScroll={(event) => {
                if (event.currentTarget.scrollTop < 40) {
                  void loadOlderMessages();
                }
              }}
              className="glass-scrollbar flex-1 space-y-4 overflow-y-auto p-6"
            >
              {loadingOlderMessages && (
                <p className="text-center text-xs text-white/50">
                  Loading older messages...
                </p>
              )}
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
                      {isOwnMessage && (
                        <p
                          className={`mt-1 text-right text-[10px] ${
                            currentMessage.status === "failed"
                              ? "text-red-300"
                              : "text-white/50"
                          }`}
                          aria-live="polite"
                        >
                          {currentMessage.status === "sending"
                            ? "Sending..."
                            : currentMessage.status === "failed"
                              ? "Failed to send"
                              : "Sent"}
                          {currentMessage.status === "failed" && (
                            <>
                              {" · "}
                              <button
                                type="button"
                                className="cursor-pointer underline"
                                onClick={() =>
                                  void sendMessage(
                                    currentMessage.content,
                                    currentMessage.clientMessageId,
                                  )
                                }
                              >
                                Retry
                              </button>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t-2 border-white/15 p-4">
              <form
                className="flex gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="cursor-pointer rounded-xl bg-violet-600 px-5 transition hover:bg-violet-500"
                >
                  <Send size={20} />
                </button>
              </form>
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
