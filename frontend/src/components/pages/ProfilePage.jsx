import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../utils/constant";
import useRecipe from "../../hooks/useRecipe";
import useShoppingList from "../../hooks/useShoppingList";
import { BadgesCard, SliderCard, Ingredients } from "../../shared";
import { ProfileHeader, AllergiesCard, PreferencesCard } from "../user";

const ProfilePage = () => {
  const [user, setUser] = useState();
  const { savedRecipes, getSavedRecipes } = useRecipe();
  const { shoppingList, getShoppingList } = useShoppingList();

  const getUser = async () => {
    try {
      const res = await axios.get(`${base_url}/users/me`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      console.log("user data", res.data.data);
      const userData = res.data.data || [];
      setUser(userData);
    } catch (error) {
      console.error("Error in user data", error);
    }
  };

  useEffect(() => {
    getUser();
    getSavedRecipes();
    getShoppingList();
  }, []);

  return (
    <div className="flex flex-row gap-5">
      <div className="flex-[4] flex flex-col gap-5">
        <ProfileHeader user={user} />
        <AllergiesCard
          allergies={user?.profile?.allergies || []}
          onSave={(u) => setUser((prev) => ({ ...prev, ...u }))}
        />
        <div className="flex flex-col gap-4 w-2xl">
          <h3 className="text-2xl md:text-2xl font-medium">Saved Recipes</h3>
          <SliderCard cards={savedRecipes?.data || []} />
        </div>
      </div>
      <div className="flex-[3] flex flex-col gap-5">
        <PreferencesCard
          preferences={user?.preferences}
          profile={user?.profile}
          onSave={(u) => setUser((prev) => ({ ...prev, ...u }))}
        />
        <BadgesCard badges={user?.gamification?.badges || []} />
        <div className="flex flex-col gap-4 w-md  ">
          <h2 className="text-2xl md:text-3xl font-medium ">Shopping List</h2>
          <div className="flex flex-col ">
            {shoppingList?.data.items.slice(0, 4).map((item) => (
              <div key={item._id} className="border px-4 py-1 m-0.5 rounded-sm">
                <Ingredients {...item} />
              </div>
            ))}
          </div>
          {shoppingList?.data.items.length > 4 && (
            <Link
              to="/dashboard/shopping-bag"
              state={{ items: shoppingList?.data.items }}
              className="self-start px-3 py-1 rounded bg-[#042d52] text-white hover:opacity-90"
            >
              More ({shoppingList?.data.items.length - 4} more)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
