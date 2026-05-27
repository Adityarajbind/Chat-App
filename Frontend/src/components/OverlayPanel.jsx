const OverlayPanel = ({ isSignUp, setIsSignUp }) => {
  return (
    <div
      className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100] ${
        isSignUp ? "-translate-x-full" : ""
      }`}
    >
      <div
        className={`bg-gradient-to-r from-[#5011E5] to-[#904AF9] bg-no-repeat bg-cover bg-left text-white relative left-[-100%] h-full w-[200%] transition-transform duration-700 ease-in-out  ${
          isSignUp ? "translate-x-1/2" : ""
        }`}
      >
        {/* LEFT PANEL */}
        <div
          className={`absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 transition-transform duration-700 ease-in-out ${
            isSignUp
              ? "translate-x-0"
              : "translate-x-[-20%]"
          }`}
        >
          <h1 className="font-bold text-4xl playwrite">
            Welcome Back!
          </h1>

          <p className="text-[16px] font-light leading-5 tracking-[0.5px] my-5">
            To keep connected with us please login with your
            personal info
          </p>

          <button
            onClick={() => setIsSignUp(false)}
            className="rounded-[20px] outline-none border border-white bg-transparent text-white text-xs font-bold py-3 px-[45px] cursor-pointer tracking-[1px] uppercase"
          >
            Sign In
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div
          className={`absolute right-0 flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 transition-transform duration-700 ease-in-out ${
            isSignUp
              ? "translate-x-[20%]"
              : "translate-x-0"
          }`}
        >
          <h1 className="font-bold text-4xl playwrite">
            Hello, Friend!
          </h1>

          <p className="text-[16px] font-light leading-5 tracking-[0.5px] my-5">
            Enter your personal details and start journey
            with us
          </p>

          <button
            onClick={() => setIsSignUp(true)}
            className="rounded-[20px] border border-white bg-transparent text-white text-xs font-bold py-3 px-[45px] cursor-pointer tracking-[1px] uppercase"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverlayPanel;