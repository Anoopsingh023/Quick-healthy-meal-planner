import React from "react";
import { Timer } from "lucide-react";
import calories from "../assets/Calories.png";


const baseClasses =
  "inline-flex items-center gap-2 px-3 h-8 text-sm font-medium bg-[#e4e1e1] text-gray-800 rounded-full shadow-sm";


export const Tag = ({ metadata }) => {
  if (!metadata || metadata === "Any") return null;

  return <span className={baseClasses}>{metadata}</span>;
};


export const TimeTag = ({ metadata }) => {
  if (!metadata) return null;

  return (
    <span className={baseClasses}>
      <Timer size={16} strokeWidth={2} />
      {metadata} min
    </span>
  );
};


export const PriceTag = ({ metadata }) => {
  if (!metadata && metadata !== 0) return null;

  return <span className={baseClasses}>₹ {metadata}</span>;
};


export const CalorieTag = ({ metadata }) => {
  if (!metadata && metadata !== 0) return null;

  return (
    <span className={baseClasses}>
      <img src={calories} alt="" className="h-4 w-4" />
      {Math.trunc(metadata)} kcal
    </span>
  );
};
