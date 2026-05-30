const CreateRoomModal = ({
  isOpen,
  onClose,
  roomName,
  setRoomName,
  onCreate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1333]/90 p-8 text-white shadow-2xl backdrop-blur-xl">
        <h2 className="mb-6 text-center text-3xl font-bold">
          Create Room
        </h2>

        <input
          type="text"
          placeholder="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="mb-6 w-full rounded-xl bg-white/10 px-4 py-3 outline-none placeholder:text-white/50"
        />

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/20 py-3"
          >
            Cancel
          </button>

          <button
            onClick={onCreate}
            className="flex-1 rounded-xl bg-violet-600 py-3 hover:bg-violet-500"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;