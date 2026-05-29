import { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import OverlayPanel from "../components/OverlayPanel";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
const navigate = useNavigate();
  // LOGIN
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // REGISTER
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  async function HandleLogin(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      localStorage.setItem("token", result.token);

      localStorage.setItem("user", JSON.stringify(result));

      console.log(result);
      setLoginEmail("");
      setLoginPassword("");

      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  }

  async function HandleRegister(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username: registerUsername,
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      localStorage.setItem("token", result.token);

      localStorage.setItem("user", JSON.stringify(result));

      console.log(result);
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterUsername("");

      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <>
      <div
        className=" flex justify-center items-center flex-col h-screen m-0 opacity-85 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: 'url("/background.png")' }}
      ></div>
      <div
        className={`overflow-hidden shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] backdrop-blur-md bg-white/5 border-4 rounded-xl border-white/15 opacity-100 w-3xl max-w-full min-h-120 absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          isSignUp ? "right-panel-active" : ""
        }`}
      >
        {/* REGISTER */}
        <RegisterForm
          isSignUp={isSignUp}
          username={registerUsername}
          email={registerEmail}
          password={registerPassword}
          setUsername={setRegisterUsername}
          setEmail={setRegisterEmail}
          setPassword={setRegisterPassword}
          HandleRegister={HandleRegister}
        />

        {/* LOGIN */}
        <LoginForm
          isSignUp={isSignUp}
          email={loginEmail}
          password={loginPassword}
          setEmail={setLoginEmail}
          setPassword={setLoginPassword}
          HandleLogin={HandleLogin}
        />

        {/* OVERLAY */}
        <OverlayPanel isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
      </div>
    </>
  );
};

export default Auth;
