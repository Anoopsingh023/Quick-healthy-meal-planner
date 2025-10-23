import React from "react";

const Ingredients = ({_id, name, quantity }) => {
  return (
    <div key={_id} className="flex flex-row gap-4 justify-between ">
      <p>{name}</p>
      <span>{quantity}</span>
    </div>
  );
};

export default Ingredients;
