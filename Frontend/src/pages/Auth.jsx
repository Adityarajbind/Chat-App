import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/useToast";
import { BACKEND_URL } from "../api/config";

import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import OverlayPanel from "../components/OverlayPanel";

const Auth = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [MobileisSignUp, setMobileisSignUp] = useState(false)
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
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
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

      login(result);
      setLoginEmail("");
      setLoginPassword("");

      showToast("Welcome back!", "success");
      navigate("/");
    } catch (error) {
      showToast(error.message || "Unable to sign in. Please try again.", "error");
    }
  }

  async function HandleRegister(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
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
      login(result);
      console.log(result);
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterUsername("");

      showToast("Your account is ready. Welcome!", "success");
      navigate("/");
    } catch (error) {
      showToast(error.message || "Unable to create your account.", "error");
    }
  }

  return (
    <>
      <div
        className=" flex justify-center items-center flex-col h-screen m-0 opacity-85 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: 'url("/background.png")' }}
      ></div>
      <div
        className={`overflow-hidden shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] backdrop-blur-md bg-white/5 border-4 rounded-xl border-white/15 opacity-100 w-3xl max-[900px]:w-2xl max-[700px]:w-[320px] max-w-full min-h-120 max-[900px]:min-h-100 absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          isSignUp ? "right-panel-active" : ""
        }`}
      >
        {/* REGISTER */}
        <RegisterForm
          isSignUp={isSignUp}
          setMobileisSignUp = {setMobileisSignUp}
          MobileisSignUp = {MobileisSignUp}
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
          setMobileisSignUp = {setMobileisSignUp}
          MobileisSignUp = {MobileisSignUp}
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
