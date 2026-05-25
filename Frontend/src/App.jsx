import React from "react";
const data = {
  "email": "test@gmail.com",
  "password": "123456"
};
const App = () => {
const postData = async (dataToPost) => {
  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    console.log(result);
  } catch (error) {
    console.log(error.message);
  }
};

  return (
    <div>
      <button onClick={postData} className=" m-1 px-2 border rounded-md bg-red-200 border-red-600">test</button>
    </div>
  );
};

export default App;
