import React from "react";

const Ingredients = ({name, quantity, _id }) => {
  return (
    <div key={_id} className="flex flex-row gap-4 justify-between ">
      <p>{name}</p>
      <span>{quantity}</span>
    </div>
  );
};

export default Ingredients;
