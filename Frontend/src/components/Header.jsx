import React from "react";
import { User } from "lucide-react";

const Header = ({username}) => {
  return (
    <nav className="flex items-center justify-between px-8 py-6">
      <h1 className="playwrite text-3xl font-bold">Chati-Chat</h1>

      <button className="flex items-center cursor-pointer gap-2 rounded-xl backdrop-blur-md bg-white/10 border-2  border-white/15 px-4 py-2  transition hover:scale-[1.02] hover:bg-white/15">
        <User size={18} />
        {username}
      </button>
    </nav>
  );
};

export default Header;
