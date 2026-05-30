import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) return;

    const user = JSON.parse(storedUser);

    setUserId(user._id);
    setUsername(user.username);
    setEmail(user.email);
    setToken(user.token);
  }, []);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);

    setUserId(userData._id);
    setUsername(userData.username);
    setEmail(userData.email);
    setToken(userData.token);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUserId(null);
    setUsername("");
    setEmail("");
    setToken("");
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        username,
        email,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
