import React from "react";

const Ingredients = ({img,name, quantity, _id }) => {
  const ingImage = `https://img.spoonacular.com/ingredients_100x100/${img}`
  return (
    <div key={_id} className="flex flex-col justify-center items-start  hover:scale-102 duration-300 shadow-md bg-white p-4 rounded-xl">
      <div className="flex-shrink-0 ">
        <input
          type="checkbox"
          // checked={!!item.isPurchased}
          // onChange={() => onTogglePurchased(item)}
          // aria-label={`Mark ${item.name} as purchased`}
          className="w-5 h-5  cursor-pointer"
        />
      </div>
      <div className="flex flex-col w-full justify-center items-center">
      <img className="w-20 h-20" src={ingImage} alt="image" />
      <span>{quantity}</span>
      <p>{name}</p>
      </div>
    </div>
  );
};

export default Ingredients;
