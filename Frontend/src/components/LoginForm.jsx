const LoginForm = ({
  isSignUp,
  setMobileisSignUp,
  MobileisSignUp,
  email,
  password,
  setEmail,
  setPassword,
  HandleLogin,
}) => {
  return (
    <div
      className={`absolute top-0 left-0 h-full w-1/2 max-[700px]:w-full transition-all duration-700 ease-in-out  text-white ${
        isSignUp ? "translate-x-1/4 opacity-0" : "z-20"
      }
      ${
        MobileisSignUp ? "-translate-x-full opacity-0" : " translate-x-0  z-20"
      }`}
    >

      <form
        onSubmit={HandleLogin}
        className=" flex items-center justify-center flex-col px-[50px] max-[700px]:px-[20px] h-full text-center"
      >
        <h1 className="font-bold m-0 text-3xl playwrite mb-4">Sign in</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#eee] text-neutral-800 rounded-sm border-none px-[15px] py-3 my-2 w-full outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#eee] text-neutral-800 rounded-sm border-none px-[15px] py-3 my-2 w-full outline-none"
        />

        <a href="#" className="text-[#9f9f9f] text-sm no-underline my-[15px] max-[700px]:hidden">
          Forgot your password?
        </a>
        <p className="text-[#9f9f9f] text-md no-underline my-[15px] min-[700px]:hidden">
          Dont Have Account ? {" "}
          <button className="text-white cursor-pointer" onClick={() => {
            setMobileisSignUp(true)
            isSignUp(false)
          }}>Register</button>
        </p>

        <button className="rounded-[20px] border border-[#8f4af9] bg-[#8f4af9] text-white text-xs font-bold py-3 px-[45px] tracking-[1px] uppercase active:scale-95 transition outline-none cursor-pointer hover:bg-[#9a5cf8]">
          Sign in
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
