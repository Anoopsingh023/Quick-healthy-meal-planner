import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Home from "./components/pages/Home";
import RecipeDetail from "./components/pages/RecipeDetail";
import ShoppingList from "./components/pages/ShoppingList";
import SearchResults from "./components/pages/SearchResults";
import SavedRecipe from "./components/pages/SavedRecipe";
import ProfilePage from "./components/user/ProfilePage";

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
      { path: "saved-recipe", element: <SavedRecipe /> },
      { path: "user-profile", element: <ProfilePage /> },
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