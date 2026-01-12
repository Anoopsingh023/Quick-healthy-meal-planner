import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Dashboard from "./components/Dashboard";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import {
  Home,
  RecipeDetail,
  ShoppingList,
  SavedRecipe,
  SearchResults,
  ProfilePage
} from "./components/pages/index";
import DbSearch from "./components/pages/DbSearch";
import UserRecipeManager from "./components/user/UserRecipeManager";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      { path: "", element: <Home /> },
      { path: ":recipeId", element: <RecipeDetail /> },
      { path: "shopping-bag", element: <ShoppingList /> },
      { path: "search", element: <SearchResults /> },
      { path: "db-search", element: <DbSearch /> },
      { path: "saved-recipe", element: <SavedRecipe /> },
      { path: "user-profile", element: <ProfilePage /> },
      { path: "user-Recipe", element: <UserRecipeManager /> },
    ],
  },
]);

function App() {
  return (
    <>
      <div>
        <RouterProvider router={appRouter} />
      </div>
    </>
  );
}

export default App;
