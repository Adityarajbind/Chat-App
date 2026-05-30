import React from "react";
import { User } from "lucide-react";

const Header = ({username}) => {
  return (
    <nav className="flex items-center justify-between px-8 py-6">
      <h1 className="playwrite text-3xl font-bold">Chatify</h1>

      <button className="flex items-center cursor-pointer gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md transition hover:bg-white/20">
        <User size={18} />
        {username}
      </button>
    </nav>
  );
};

export default Header;
