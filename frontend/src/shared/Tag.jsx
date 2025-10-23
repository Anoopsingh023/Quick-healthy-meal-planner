import React from "react";
import { Timer } from "lucide-react";
import calories from "../assets/Calories.png";

const Tag = ({ metadata }) => {
  return (
    <div>
      {metadata!="Any"?<p className=" p-1 px-2 h-8 bg-[#b7b2b2] rounded-full">
        {metadata}
      </p>:null}
    </div>
  );
};

const TimeTag = ({ metadata }) => {
  return (
    <div>
      <p className=" py-1 px-2 h-8 bg-[#b7b2b2] rounded-full flex flex-row">
        <Timer size={20} />{metadata} min
      </p>
    </div>
  );
};

const PriceTag = ({ metadata }) => {
  return (
    <div>
      <p className=" p-1 px-2 h-8  bg-[#b7b2b2] rounded-full flex flex-row">
        Rs. {metadata}
      </p>
    </div>
  );
};
const CalorieTag = ({ metadata }) => {
  return (
    <div>
      <p className=" p-1  h-8  bg-[#b7b2b2] rounded-full flex flex-row">
        <img className="h-5 w-5" src={calories} alt="" />
        {Math.trunc(metadata)} kcal
      </p>
    </div>
  );
};

export { Tag, TimeTag, PriceTag, CalorieTag };
