import React from "react";
import { useNavigate } from "react-router-dom";


const BackButton = () => {
    const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="px-3 py-1 rounded cursor-pointer bg-green-600 text-white hover:bg-green-700 transition-all duration-200"
      >
        Back
      </button>
    </div>
  );
};

export default BackButton;
