// App.jsx
import React from "react";
// import { Home, Recipes, ShoppingList, SavedRecipes, Profile } from "./pages";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import { FaHome, FaBook, FaShoppingCart, FaStar, FaUser } from "react-icons/fa";

const App = () => {
  const [activePage, setActivePage] = React.useState("home");

  const renderContent = () => {
    switch (activePage) {
      case "home":
        return <Home />;
      case "recipes":
        return <Recipes />;
      // case "shopping":
      //   return <ShoppingList />;
      // case "saved":
      //   return <SavedRecipes />;
      // case "profile":
      //   return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex h-screen fontFamily">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="text-2xl font-bold p-6">MealPlanner</div>
        <nav className="flex-1">
          <ul>
            <li
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-700 ${
                activePage === "home" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActivePage("home")}
            >
              <FaHome className="mr-3" /> Home
            </li>
            <li
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-700 ${
                activePage === "recipes" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActivePage("recipes")}
            >
              <FaBook className="mr-3" /> Recipes
            </li>
            <li
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-700 ${
                activePage === "shopping" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActivePage("shopping")}
            >
              <FaShoppingCart className="mr-3" /> Shopping List
            </li>
            <li
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-700 ${
                activePage === "saved" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActivePage("saved")}
            >
              <FaStar className="mr-3" /> Saved Recipes
            </li>
            <li
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-700 ${
                activePage === "profile" ? "bg-gray-700" : ""
              }`}
              onClick={() => setActivePage("profile")}
            >
              <FaUser className="mr-3" /> Profile
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-[#d6d6d6] p-6 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold capitalize">{activePage}</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search recipes..."
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <img
              src="/avatar.png"
              alt="avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
            />
          </div>
        </header>

        {/* Content */}
        <div>{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
