// import React, { useEffect, useState } from "react";
// import { Home, List, ShoppingCart, User, Search, Settings } from "lucide-react";

// // Desktop Profile UI for Quick Healthy Meal Planner
// // Single-file React component (React + TailwindCSS)
// // - Contains ProfilePage and reusable subcomponents
// // - Uses simple mock API wrappers (replace with real API calls)

// // -----------------------------
// // Mock API helpers (replace with real endpoints)
// // -----------------------------
// const api = {
//   getMe: async () => {
//     // simulate network
//     await new Promise((r) => setTimeout(r, 250));
//     return {
//       _id: "user_1",
//       userName: "anoopsingh",
//       fullName: "Anoop Singh",
//       email: "anoop@example.com",
//       phoneNo: "9876543210",
//       avatar: "https://via.placeholder.com/128",
//       profile: { dietPreference: "Veg", cookingSkill: "Beginner", allergies: ["Peanuts"] },
//       preferences: { budgetRange: { min: 50, max: 400 }, cuisines: ["Indian", "Italian"] },
//       gamification: { streak: 7, badges: ["Budget Saver", "Zero Waste Cook"] },
//       savedRecipes: [
//         { id: 11, title: "Quick Veg Bowl", image: null },
//         { id: 12, title: "Paneer Tikka", image: null },
//       ],
//     };
//   },
//   updateMe: async (payload) => {
//     await new Promise((r) => setTimeout(r, 250));
//     return { ...payload }; // in real API you'd return the updated user object
//   },
//   uploadAvatar: async (file) => {
//     await new Promise((r) => setTimeout(r, 400));
//     // return a placeholder URL — replace with uploaded file URL from S3 or similar
//     return "https://via.placeholder.com/128?updated=" + Date.now();
//   },
//   changePassword: async ({ oldPassword, newPassword }) => {
//     await new Promise((r) => setTimeout(r, 250));
//     if (oldPassword !== "oldpass") throw new Error("Old password is incorrect");
//     return { message: "Password changed" };
//   },
// };

// // -----------------------------
// // Utilities
// // -----------------------------
// function Badge({ name }) {
//   return (
//     <div className="bg-green-50 border border-green-100 text-green-800 px-3 py-2 rounded-md text-sm">{name}</div>
//   );
// }

// // -----------------------------
// // Subcomponents
// // -----------------------------
// function ProfileHeader({ user, onEdit }) {
//   return (
//     <div className="flex items-center justify-between mb-6">
//       <div className="flex items-center gap-4">
//         <img src={user.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border" />
//         <div>
//           <h2 className="text-2xl font-bold">{user.fullName}</h2>
//           <p className="text-sm text-slate-500">@{user.userName}</p>
//           <p className="text-sm text-slate-600 mt-2">{user.email}</p>
//         </div>
//       </div>

//       <div className="flex items-center gap-3">
//         <div className="text-center px-4 py-2 border rounded-lg">
//           <div className="text-lg font-bold">{user.gamification?.streak ?? 0}</div>
//           <div className="text-xs text-slate-500">day streak</div>
//         </div>
//         <button
//           onClick={onEdit}
//           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
//         >
//           Edit Profile
//         </button>
//       </div>
//     </div>
//   );
// }

// function ProfileSummaryCard({ user, onSave }) {
//   const [editing, setEditing] = useState(false);
//   const [form, setForm] = useState({ fullName: "", phoneNo: "" });
//   useEffect(() => {
//     setForm({ fullName: user.fullName || "", phoneNo: user.phoneNo || "" });
//   }, [user]);

//   async function save() {
//     try {
//       const updates = { fullName: form.fullName, phoneNo: form.phoneNo };
//       const res = await api.updateMe(updates);
//       onSave(res);
//       setEditing(false);
//     } catch (err) {
//       alert(err.message);
//     }
//   }

//   return (
//     <div className="bg-white rounded-lg border p-4 shadow-sm">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="font-semibold">Profile Summary</h3>
//         {!editing ? (
//           <button onClick={() => setEditing(true)} className="text-sm text-slate-600">Edit</button>
//         ) : null}
//       </div>

//       {!editing ? (
//         <div className="space-y-2 text-sm text-slate-700">
//           <div><strong>Name:</strong> {user.fullName}</div>
//           <div><strong>Username:</strong> @{user.userName}</div>
//           <div><strong>Email:</strong> {user.email}</div>
//           <div><strong>Phone:</strong> {user.phoneNo || "—"}</div>
//         </div>
//       ) : (
//         <div className="space-y-3">
//           <input className="w-full border rounded px-3 py-2" name="fullName" value={form.fullName} onChange={(e)=>setForm({...form, fullName: e.target.value})} />
//           <input className="w-full border rounded px-3 py-2" name="phoneNo" value={form.phoneNo} onChange={(e)=>setForm({...form, phoneNo: e.target.value})} />
//           <div className="flex gap-2">
//             <button onClick={save} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
//             <button onClick={()=>setEditing(false)} className="px-3 py-2 border rounded">Cancel</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function PreferencesCard({ preferences, profile, onSave }) {
//   const [form, setForm] = useState({
//     dietPreference: profile.dietPreference || "Any",
//     cookingSkill: profile.cookingSkill || "Beginner",
//     budgetMin: preferences.budgetRange?.min ?? 0,
//     budgetMax: preferences.budgetRange?.max ?? 200,
//     cuisines: preferences.cuisines || [],
//   });

//   useEffect(()=>{ setForm({
//     dietPreference: profile.dietPreference || "Any",
//     cookingSkill: profile.cookingSkill || "Beginner",
//     budgetMin: preferences.budgetRange?.min ?? 0,
//     budgetMax: preferences.budgetRange?.max ?? 200,
//     cuisines: preferences.cuisines || [],
//   }); }, [preferences, profile]);

//   function toggleCuisine(c) {
//     setForm((s) => ({ ...s, cuisines: s.cuisines.includes(c) ? s.cuisines.filter(x=>x!==c) : [...s.cuisines, c] }));
//   }

//   async function save() {
//     const payload = {
//       profile: { dietPreference: form.dietPreference, cookingSkill: form.cookingSkill },
//       preferences: { budgetRange: { min: Number(form.budgetMin), max: Number(form.budgetMax) }, cuisines: form.cuisines },
//     };
//     try {
//       const res = await api.updateMe(payload);
//       onSave(res);
//       alert('Preferences saved');
//     } catch (err) { alert(err.message); }
//   }

//   const sampleCuisines = ["Indian","Italian","Chinese","Mexican","Thai"];

//   return (
//     <div className="bg-white rounded-lg border p-4 shadow-sm">
//       <h3 className="font-semibold mb-3">Preferences</h3>
//       <div className="grid grid-cols-2 gap-3">
//         <div>
//           <label className="block text-xs text-slate-600">Diet Preference</label>
//           <select value={form.dietPreference} onChange={(e)=>setForm({...form, dietPreference: e.target.value})} className="mt-1 w-full border rounded px-2 py-2">
//             <option>Any</option>
//             <option>Veg</option>
//             <option>Vegan</option>
//             <option>Non-Veg</option>
//             <option>Keto</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-xs text-slate-600">Cooking Skill</label>
//           <select value={form.cookingSkill} onChange={(e)=>setForm({...form, cookingSkill: e.target.value})} className="mt-1 w-full border rounded px-2 py-2">
//             <option>Beginner</option>
//             <option>Intermediate</option>
//             <option>Expert</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-xs text-slate-600">Budget Min (₹)</label>
//           <input type="number" value={form.budgetMin} onChange={(e)=>setForm({...form, budgetMin: e.target.value})} className="mt-1 w-full border rounded px-2 py-2" />
//         </div>
//         <div>
//           <label className="block text-xs text-slate-600">Budget Max (₹)</label>
//           <input type="number" value={form.budgetMax} onChange={(e)=>setForm({...form, budgetMax: e.target.value})} className="mt-1 w-full border rounded px-2 py-2" />
//         </div>

//         <div className="col-span-2">
//           <label className="block text-xs text-slate-600 mb-2">Cuisines</label>
//           <div className="flex flex-wrap gap-2">
//             {sampleCuisines.map((c) => (
//               <button key={c} onClick={()=>toggleCuisine(c)} className={`px-3 py-1 rounded-full border ${form.cuisines.includes(c) ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
//                 {c}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="mt-4 flex gap-2 justify-end">
//         <button onClick={save} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
//       </div>
//     </div>
//   );
// }

// function AllergiesCard({ allergies = [], onSave }) {
//   const [items, setItems] = useState(allergies || []);
//   const [newItem, setNewItem] = useState("");

//   useEffect(()=>setItems(allergies || []), [allergies]);

//   function remove(a){ setItems(items.filter(x=>x!==a)); }
//   function add(){ if(!newItem) return; setItems([...items, newItem]); setNewItem(''); }

//   async function save(){
//     try{
//       const res = await api.updateMe({ profile: { allergies: items } });
//       onSave(res);
//       alert('Allergies updated');
//     }catch(e){alert(e.message)}
//   }

//   return (
//     <div className="bg-white rounded-lg border p-4 shadow-sm">
//       <h3 className="font-semibold mb-3">Allergies</h3>
//       <div className="flex flex-wrap gap-2 mb-3">
//         {items.map((a) => (
//           <div key={a} className="px-3 py-1 bg-red-50 border rounded-full flex items-center gap-2">
//             <span className="text-sm">{a}</span>
//             <button onClick={()=>remove(a)} className="text-xs text-red-600">x</button>
//           </div>
//         ))}
//       </div>
//       <div className="flex gap-2">
//         <input value={newItem} onChange={(e)=>setNewItem(e.target.value)} className="border rounded px-3 py-2 flex-1" placeholder="Add allergy (e.g. Gluten)" />
//         <button onClick={add} className="px-3 py-2 border rounded">Add</button>
//       </div>
//       <div className="mt-4 flex justify-end">
//         <button onClick={save} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
//       </div>
//     </div>
//   );
// }

// function BadgesCard({ badges = [] }) {
//   return (
//     <div className="bg-white rounded-lg border p-4 shadow-sm">
//       <h3 className="font-semibold mb-3">Badges</h3>
//       <div className="flex flex-wrap gap-2">
//         {badges.length ? badges.map((b) => <Badge key={b} name={b} />) : <div className="text-sm text-slate-500">No badges earned yet</div>}
//       </div>
//     </div>
//   );
// }



// function AvatarUpload({ avatarUrl, onUploaded }) {
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(avatarUrl);

//   useEffect(()=>{ setPreview(avatarUrl); }, [avatarUrl]);

//   async function upload(){ if(!file) return alert('Choose a file');
//     try{
//       const url = await api.uploadAvatar(file);
//       onUploaded(url);
//       alert('Avatar uploaded');
//     }catch(e){alert(e.message)}
//   }

//   return (
//     <div className="bg-white rounded-lg border p-4 shadow-sm">
//       <h3 className="font-semibold mb-3">Avatar</h3>
//       <div className="flex items-center gap-4">
//         <img src={preview} alt="avatar" className="w-20 h-20 rounded-full object-cover border" />
//         <div className="flex flex-col gap-2">
//           <input type="file" accept="image/*" onChange={(e)=>{ setFile(e.target.files?.[0] || null); if(e.target.files?.[0]) setPreview(URL.createObjectURL(e.target.files[0])); }} />
//           <div className="flex gap-2">
//             <button onClick={upload} className="px-3 py-2 bg-green-600 text-white rounded">Upload</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ChangePasswordCard() {
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");

//   async function change() {
//     try {
//       await api.changePassword({ oldPassword, newPassword });
//       alert('Password changed');
//       setOldPassword(''); setNewPassword('');
//     } catch (e) { alert(e.message); }
//   }

//   return (
//     <div className="bg-white rounded-lg border p-4 shadow-sm">
//       <h3 className="font-semibold mb-3">Change Password</h3>
//       <input type="password" placeholder="Current password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
//       <input type="password" placeholder="New password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-2" />
//       <div className="flex justify-end">
//         <button onClick={change} className="px-3 py-2 bg-green-600 text-white rounded">Change</button>
//       </div>
//     </div>
//   );
// }

// // -----------------------------
// // Main Profile Page
// // -----------------------------
// export default function ProfilePage() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       const data = await api.getMe();
//       if (mounted) { setUser(data); setLoading(false); }
//     })();
//     return () => { mounted = false; };
//   }, []);

//   if (loading) return <div className="p-8">Loading...</div>;

//   return (
//     <div className="h-screen bg-gray-50 flex text-slate-800">
//       {/* Sidebar */}
//       <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6">
//         <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-bold">Q</div>
//         <nav className="flex flex-col gap-4 items-center">
//           <button title="Home" className="p-2 rounded-md hover:bg-gray-100"><Home size={18} /></button>
//           <button title="Recipes" className="p-2 rounded-md hover:bg-gray-100"><List size={18} /></button>
//           <button title="Shopping" className="p-2 rounded-md hover:bg-gray-100"><ShoppingCart size={18} /></button>
//           <button title="Profile" className="p-2 rounded-md hover:bg-gray-100"><User size={18} /></button>
//         </nav>
//         <div className="flex-1" />
//         <button title="Settings" className="p-2 rounded-md hover:bg-gray-100"><Settings size={18} /></button>
//       </aside>

//       {/* Content */}
//       <main className="flex-1 p-8 overflow-auto">
//         <ProfileHeader user={user} onEdit={() => { /* we rely on inline edit actions in cards */ }} />

//         <div className="grid grid-cols-12 gap-6">
//           <section className="col-span-7 space-y-4">
//             <ProfileSummaryCard user={user} onSave={(u)=>setUser(prev=>({...prev,...u}))} />
//             <PreferencesCard preferences={user.preferences} profile={user.profile} onSave={(u)=>setUser(prev=>({...prev,...u}))} />
//             <AllergiesCard allergies={user.profile?.allergies || []} onSave={(u)=>setUser(prev=>({...prev,...u}))} />
//             <ChangePasswordCard />
//           </section>

//           <aside className="col-span-5 space-y-4">
//             <AvatarUpload avatarUrl={user.avatar} onUploaded={(url)=>{ api.updateMe({ avatar: url }); setUser(prev=>({...prev, avatar: url})); }} />
//             <BadgesCard badges={user.gamification?.badges || []} />
//             <SavedRecipesGrid items={user.savedRecipes || []} />
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// }

function SavedRecipesGrid({ items = [] }) {
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <h3 className="font-semibold mb-3">Saved Recipes</h3>
      <div className="flex flex-row gap-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="p-3 border rounded flex items-center gap-3"
          >
            <img src={r.image} className="w-20 h-20" alt="image" />
            {/* <div className="w-12 h-12 bg-gray-100 rounded" /> */}
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-slate-500">View</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import ProfileHeader from "./ProfileHeader";
import axios from "axios";
import { base_url } from "../../utils/constant";
import PreferencesCard from "./PreferencesCard";
import AllergiesCard from "./AllergiesCard";
import BadgesCard from "../../shared/BadgesCard";
import useRecipe from "../../hooks/useRecipe";
import SliderCard from "../../shared/SliderCard";
import useShoppingList from "../../hooks/useShoppingList";
import Ingredients from "../../shared/Ingredients";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState();
   const { savedRecipes,getSavedRecipes } = useRecipe();
   const { shoppingList,getShoppingList } = useShoppingList();

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
    getSavedRecipes()
getShoppingList()
  }, []);

  return (
    <div className="flex flex-row gap-5">
      {/* <ProfileHeader/> */}
      <div className="flex-[4] flex flex-col gap-5">
        <ProfileHeader
          user={user}
          onEdit={() => {
            /* we rely on inline edit actions in cards */
          }}
        />
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
