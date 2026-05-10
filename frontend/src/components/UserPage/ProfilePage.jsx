// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import { base_url } from "../../utils/constant";
// import useRecipe from "../../hooks/useRecipe";
// import useShoppingList from "../../hooks/useShoppingList";
// import { BadgesCard, SliderCard, Ingredients, CalorieTag, TimeTag } from "../../shared";
// import { ProfileHeader, AllergiesCard, PreferencesCard } from "../user";

// const ProfilePage = () => {
//   const [user, setUser] = useState();
//   const { savedRecipes, getSavedRecipes } = useRecipe();
//   const { shoppingList, getShoppingList } = useShoppingList();

//   const getUser = async () => {
//     try {
//       const res = await axios.get(`${base_url}/users/me`, {
//         withCredentials: true
//       });
//       console.log("user data", res.data.data);
//       const userData = res.data.data || [];
//       setUser(userData);
//     } catch (error) {
//       console.error("Error in user data", error);
//     }
//   };

//   useEffect(() => {
//     getUser();
//     // getSavedRecipes();
//     // getShoppingList();
//   }, []);

//   return (
//     <div className="flex flex-col gap-5">
//       <div className="flex flex-row gap-5">
//         <div className="flex-[5]">
//           <ProfileHeader user={user} />
//           <div className="w-3xl">
//             <AllergiesCard
//               allergies={user?.profile?.allergies || []}
//               onSave={(u) => setUser((prev) => ({ ...prev, ...u }))}
//             />
//           </div>
//         </div>
//         <div className="flex-[3] flex flex-col gap-5">
//           <PreferencesCard
//             preferences={user?.preferences}
//             profile={user?.profile}
//             onSave={(u) => setUser((prev) => ({ ...prev, ...u }))}
//           />
//           <BadgesCard badges={user?.gamification?.badges || []} />
//         </div>
//       </div>

//       {/* <div className="flex flex-col gap-4">
//         <h3 className="text-2xl md:text-2xl font-medium">Saved Recipes</h3>
//         <div className="flex flex-row gap-4">
//           {savedRecipes?.data.slice(0, 4).map((recipe) => (
//             <div
//               onClick={handleRecipe}
//               key={recipe._id}
//               className="group relative rounded-2xl overflow-hidden cursor-pointer
//                     bg-white/5 backdrop-blur-lg border border-white/10
//                     shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
//             >

//               <div className="relative h-52 overflow-hidden">
//                 <img
//                   src={recipe.image}
//                   className="w-full h-full object-cover  transition-transform duration-500 group-hover:scale-110"
//                 />

//                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onToggleSave(recipe?._id);
//                   }}
//                   className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/30 transition"
//                 >
//                   {recipe?.isSaved ? "❤️" : "🤍"}
//                 </button>

//               </div>

//               <div className="p-4 flex flex-col gap-4">
//                 <div className=" ">
//                   <h3 className=" font-semibold text-lg line-clamp-1">
//                     {recipe.title}
//                   </h3>
//                 </div>
//                 <div className="flex flex-row justify-between">
//                   <div className="flex gap-2">
//                     <CalorieTag metadata={recipe?.metadata.calories} />
//                     <TimeTag metadata={recipe?.metadata.cookingTime} />
//                   </div>

//                   <span className="text-md text-green-600 opacity-0 group-hover:opacity-100 transition">
//                     View →
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div> */}

//       {/* <div className=" w-full">
//         <div className="flex flex-col gap-4 w-full  ">
//           <h2 className="text-2xl md:text-3xl font-medium ">Shopping List</h2>
//           <div className="grid grid-cols-6  gap-4 ">
//             {shoppingList?.data.items.slice(0, 6).map((item) => (
//               <div key={item._id} className=" m-0.5 rounded-sm">
//                 <Ingredients {...item} />
//               </div>
//             ))}
//           </div>
//           {shoppingList?.data.items.length > 4 && (
//             <Link
//               to="/dashboard/shopping-bag"
//               state={{ items: shoppingList?.data.items }}
//               className="self-start px-3 py-1 rounded bg-[#042d52] text-white hover:opacity-90"
//             >
//               More ({shoppingList?.data.items.length - 4} more)
//             </Link>
//           )}
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default ProfilePage;

import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { base_url } from "../../utils/constant";
import PreferencesTab from "./PreferencesTab";
import SecurityTab from "./SecurityTab";
import AllergiesTab from "./AllergiesTab";
import OverviewTab from "./OverviewTab";
import "./ProfilePage.css";
import Avatar from "./Avatar";

/* ─── helpers ─── */
const api = (method, url, data) =>
  axios({ method, url: `${base_url}${url}`, data, withCredentials: true });

const TABS = ["Overview", "Preferences", "Security", "Allergies"];

/* ─── toast ─── */


/* ─── main ─── */
export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Overview");

  useEffect(() => {
    api("get", "/users/me")
      .then((r) => setUser(r.data.data))
      .catch(() => alert("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function patchUser(partial) {
    setUser((u) => ({ ...u, ...partial }));
  }

  if (loading)
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );

  const g = user?.gamification || {};

  return (
    <>
      <div className="profile-root">
        {/* Hero */}
        <div className="profile-hero">
          <div className="hero-inner">
            <Avatar user={user} onUpdate={patchUser} />
            <div className="hero-meta">
              <h1 className="hero-name">{user?.fullName || "Chef"}</h1>
              <p className="hero-handle">@{user?.userName}</p>
              <div className="hero-pills">
                {user?.profile?.dietPreference &&
                  user.profile.dietPreference !== "Any" && (
                    <span className="hero-pill hero-pill--green">
                      {user.profile.dietPreference}
                    </span>
                  )}
                {user?.profile?.cookingSkill && (
                  <span className="hero-pill hero-pill--blue">
                    {user.profile.cookingSkill}
                  </span>
                )}
                {g.streak > 0 && (
                  <span className="hero-pill hero-pill--amber">
                    🔥 {g.streak}d streak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="profile-card">
          {/* Tab bar */}
          <div className="tab-bar" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`tab-btn ${tab === t ? "tab-btn--active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          {tab === "Overview" && (
            <OverviewTab user={user} onUpdate={patchUser} />
          )}
          {tab === "Preferences" && (
            <PreferencesTab user={user} onUpdate={patchUser} />
          )}
          {tab === "Security" && <SecurityTab user={user} />}
          {tab === "Allergies" && (
            <AllergiesTab user={user} onUpdate={patchUser} />
          )}
        </div>
      </div>
    </>
  );
}
