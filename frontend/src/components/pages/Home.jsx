import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import useShoppingList from "../../hooks/useShoppingList";
import {
  SliderCard,
  Search,
  Ingredients,
  BadgesCard,
  Tag,
} from "../../shared";
import RecomendCard from "../../shared/RecomendCard";
import Cusiene from "../../shared/Cusiene";
import Footer from "./Footer";
import logo from "../../assets/logo.jpg";
import download from "../../assets/recipe/download.jpg";
import axios from "axios";
import { base_url } from "../../utils/constant";
import { useSavedStore } from "../../store/useSavedStore"; // adjust path

// ── Constants ──────────────────────────────────────────────────────────────────
const HERO_TAGS     = ["veg", "Egg", "Potato", "Tomato"];
const RECOMMEND_KEY = "recommendedRecipe";
const TWO_HOURS     = 2 * 60 * 60 * 1000;
const ONE_DAY       = 24 * 60 * 60 * 1000;

// ── Helpers ────────────────────────────────────────────────────────────────────
function getCachedRecommend() {
  try {
    const raw = localStorage.getItem(RECOMMEND_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.time < TWO_HOURS) return parsed.data;
    localStorage.removeItem(RECOMMEND_KEY);
    return null;
  } catch {
    localStorage.removeItem(RECOMMEND_KEY);
    return null;
  }
}

function purgeStaleAiCache() {
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith("aiRecipes-")) return;
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (Date.now() - parsed.time > ONE_DAY) localStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
    }
  });
}

// ── Home ───────────────────────────────────────────────────────────────────────
const Home = () => {
  const { shoppingList, getShoppingList } = useShoppingList();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recommend,  setRecommend]  = useState(null);

  // ── Global saved store ────────────────────────────────────────────────────
  const { checkSaved, toggle: toggleSave } = useSavedStore();

  // ── Fetch recommended recipe (cache-first) ───────────────────────────────
  const fetchRecommend = async () => {
    try {
      const res = await axios.get(`${base_url}/recipes/recommend`, {
        withCredentials: true,
      });
      const data = res.data;
      setRecommend(data);
      localStorage.setItem(RECOMMEND_KEY, JSON.stringify({ data, time: Date.now() }));
    } catch (err) {
      console.error("Recommend fetch error", err);
    }
  };

  // ── On mount ─────────────────────────────────────────────────────────────
  useEffect(() => {

    getShoppingList();
    purgeStaleAiCache();

    const cached = getCachedRecommend();
    if (cached) {
      setRecommend(cached);
    } else {
      fetchRecommend();
    }
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleToggleRecommendSave = useCallback(
    (recipeId) => toggleSave(recipeId),
    [toggleSave],
  );

  // ── Derived ───────────────────────────────────────────────────────────────
  const shoppingItems  = shoppingList?.data?.items ?? [];
  const visibleItems   = shoppingItems.slice(0, 4);
  const extraItemCount = shoppingItems.length - 4;

  const recommendRecipe   = recommend?.data;
  const recommendIsSaved  = recommendRecipe ? checkSaved(recommendRecipe._id) : false;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ── Hero ── */}
      <div className="flex flex-row justify-between gap-6">
        <div className="flex-[3] flex flex-col">
          <h1 className="font-bold text-4xl md:text-6xl lg:text-7xl leading-tight">
            <span id="heading">Cook Smart,</span>
            <br /> Eat Healthy.
          </h1>

          <Search />

          <div className="flex flex-wrap gap-3 mt-4">
            {HERO_TAGS.map((tag) => (
              <Tag key={tag} metadata={tag} />
            ))}
          </div>
        </div>

        <div className="flex-[2]">
          <RecomendCard
            recipe={recommendRecipe}
            isSaved={recommendIsSaved}
            onToggleSave={handleToggleRecommendSave}
          />
        </div>
      </div>

      {/* ── Browse ── */}
      <div className="flex flex-col gap-4 w-full">
        <h2 className="text-2xl md:text-3xl font-medium">Browse Recipes</h2>
        <SliderCard />
      </div>

      {/* ── Shopping list + badges (logged-in only) ── */}
      {isLoggedIn && (
        <div className="flex flex-row gap-5 mt-5">
          <div className="flex-[3] flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center">
              <h2 className="text-2xl md:text-3xl font-medium">Shopping List</h2>
              {extraItemCount > 0 && (
                <Link
                  to="/dashboard/shopping-bag"
                  state={{ items: shoppingItems }}
                  className="px-3 py-1 rounded bg-[#042d52] text-white hover:opacity-90"
                >
                  More ({extraItemCount} more)
                </Link>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4 w-full">
              {visibleItems.map((item) => (
                <Ingredients key={item._id} {...item} />
              ))}
            </div>
          </div>
          <div className="flex-[2]">
            <BadgesCard />
          </div>
        </div>
      )}

      {/* ── App promo banner ── */}
      <div className="bg-black p-15 text-white flex flex-row justify-between gap-4 -mx-11">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4 items-center">
            <Link to="/dashboard" className="flex items-center">
              <img src={logo} alt="logo" className="rounded-xl object-cover h-10 w-10" />
            </Link>
            <h2 className="font-bold text-2xl text-[#0b7b2a]">Cooklio</h2>
          </div>
          <h5 className="text-5xl font-medium">Get the Cooklio App Now!</h5>
          <p className="text-[#9c9c9c] font-medium">
            Cooking is at once child's play and adult joy.
          </p>
        </div>
        <img className="h-70 w-2xl -m-15 pr-15" src={download} alt="app" />
      </div>

      {/* ── Cuisine section ── */}
      <Cusiene />

      {/* ── Footer ── */}
      <div className="bg-[#eaeaea] p-5 -mx-11">
        <Footer />
      </div>
    </div>
  );
};

export default Home;