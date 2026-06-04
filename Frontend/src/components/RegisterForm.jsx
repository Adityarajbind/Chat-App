const RegisterForm = ({
  isSignUp,
  setMobileisSignUp,
  MobileisSignUp,
  username,
  email,
  password,
  setUsername,
  setEmail,
  setPassword,
  HandleRegister,
}) => {
  return (
    <div
      className={`absolute top-0 left-0 opacity-0 h-full w-1/2 max-[700px]:w-full z-1 transition-all duration-700 ease-in-out text-white ${
        isSignUp ? "translate-x-full opacity-100 z-5 animate-[show_0.6s] " : ""
      }
      ${
        MobileisSignUp
          ? "translate-x-0 opacity-100 z-5 "
          : "max-[700px]:translate-x-full"
      }
      `}
    >
      <form
        onSubmit={HandleRegister}
        className="flex items-center justify-center flex-col px-12.5  max-[700px]:px-[20px]  h-full text-center"
      >
        <h1 className="font-bold m-0 text-3xl playwrite mb-4">
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-[#eee] text-neutral-800 rounded-sm border-none px-3.75 py-3 my-2 w-full outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#eee] text-neutral-800 rounded-sm border-none px-3.75 py-3 my-2 w-full outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#eee] text-neutral-800 rounded-sm border-none px-3.75 py-3 my-2 w-full outline-none"
        />
        <p className="text-[#9f9f9f] text-md no-underline my-[2px]  min-[700px]:hidden">
          Have an Account ?{" "}
          <button
            className="text-white cursor-pointer"
            onClick={() => {
              setMobileisSignUp(false);
              isSignUp(false);
            }}
          >
            Login
          </button>
        </p>
        <button className="rounded-[20px] border border-[#591fe8] bg-[#591fe8] text-white text-xs font-bold py-3 px-11.25 tracking-[1px] active:scale-95 transition outline-none cursor-pointer hover:bg-[#9a5cf8] mt-2 uppercase">
          Sign up
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
