import axios from "axios";
import { useEffect, useState } from "react";
import { base_url } from "../../utils/constant";

function PreferencesCard({ preferences, profile, onSave }) {
  const [form, setForm] = useState({
    dietPreference: profile?.dietPreference || "Any",
    cookingSkill: profile?.cookingSkill || "Beginner",
    budgetMin: preferences?.budgetRange?.min ?? 0,
    budgetMax: preferences?.budgetRange?.max ?? 200,
    cuisines: preferences?.cuisines || [],
  });

  useEffect(() => {
    setForm({
      dietPreference: profile?.dietPreference || "Any",
      cookingSkill: profile?.cookingSkill || "Beginner",
      budgetMin: preferences?.budgetRange?.min ?? 0,
      budgetMax: preferences?.budgetRange?.max ?? 200,
      cuisines: preferences?.cuisines || [],
    });
  }, [preferences, profile]);

  function toggleCuisine(c) {
    setForm((s) => ({
      ...s,
      cuisines: s.cuisines.includes(c)
        ? s.cuisines.filter((x) => x !== c)
        : [...s.cuisines, c],
    }));
  }

  async function save() {
    const payload = {
      profile: {
        dietPreference: form.dietPreference,
        cookingSkill: form.cookingSkill,
      },
      preferences: {
        budgetRange: {
          min: Number(form.budgetMin),
          max: Number(form.budgetMax),
        },
        cuisines: form.cuisines,
      },
    };
    try {
      const res = await axios.put(`${base_url}/users/me/profile`,payload,{
        withCredentials: true
      });

      // onSave(res);
      console.log("Preference save",res.data)
      alert("Preferences saved");
    } catch (err) {
      alert(err.message);
    }
  }

  const sampleCuisines = ["Indian", "Italian", "Chinese", "Mexican", "Thai"];

  return (
    <div className="bg-[#cacaca] rounded-lg  p-4 shadow-md">
      <h3 className="font-semibold mb-3">Preferences</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-600">
            Diet Preference
          </label>
          <select
            value={form.dietPreference}
            onChange={(e) =>
              setForm({ ...form, dietPreference: e.target.value })
            }
            className="mt-1 w-full border rounded px-2 py-2"
          >
            <option>Any</option>
            <option>Veg</option>
            <option>Vegan</option>
            <option>Non-Veg</option>
            <option>Keto</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-600">Cooking Skill</label>
          <select
            value={form.cookingSkill}
            onChange={(e) => setForm({ ...form, cookingSkill: e.target.value })}
            className="mt-1 w-full border rounded px-2 py-2"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Expert</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-600">Budget Min (₹)</label>
          <input
            type="number"
            value={form.budgetMin}
            onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
            className="mt-1 w-full border rounded px-2 py-2"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600">Budget Max (₹)</label>
          <input
            type="number"
            value={form.budgetMax}
            onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
            className="mt-1 w-full border rounded px-2 py-2"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs text-slate-600 mb-2">Cuisines</label>
          <div className="flex flex-wrap gap-2">
            {sampleCuisines.map((c) => (
              <button
                key={c}
                onClick={() => toggleCuisine(c)}
                className={`px-3 py-1 rounded-full border cursor-pointer ${
                  form.cuisines.includes(c)
                    ? "bg-green-50 border-green-200"
                    : "bg-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <button
          onClick={save}
          className="px-7 py-2 bg-green-600 text-white rounded cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default PreferencesCard;
