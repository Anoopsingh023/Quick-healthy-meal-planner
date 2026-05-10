import { useEffect, useState } from "react";

const api = (method, url, data) =>
  axios({ method, url: `${base_url}${url}`, data, withCredentials: true });

const DIET_OPTIONS = ["Any", "Veg", "Vegan", "Non-Veg", "Keto"];
const SKILL_OPTIONS = ["Beginner", "Intermediate", "Expert"];
const CUISINE_LIST = [
  "Indian",
  "Italian",
  "Chinese",
  "Mexican",
  "Thai",
  "Japanese",
  "French",
  "Mediterranean",
  "American",
  "Korean",
];

export default function PreferencesTab({ user, onUpdate }) {
  const [form, setForm] = useState({
    dietPreference: user?.profile?.dietPreference || "Any",
    cookingSkill: user?.profile?.cookingSkill || "Beginner",
    budgetMin: user?.preferences?.budgetRange?.min ?? 0,
    budgetMax: user?.preferences?.budgetRange?.max ?? 200,
    cuisines: user?.preferences?.cuisines || [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      dietPreference: user?.profile?.dietPreference || "Any",
      cookingSkill: user?.profile?.cookingSkill || "Beginner",
      budgetMin: user?.preferences?.budgetRange?.min ?? 0,
      budgetMax: user?.preferences?.budgetRange?.max ?? 200,
      cuisines: user?.preferences?.cuisines || [],
    });
  }, [user]);

  function toggleCuisine(c) {
    setForm((f) => ({
      ...f,
      cuisines: f.cuisines.includes(c)
        ? f.cuisines.filter((x) => x !== c)
        : [...f.cuisines, c],
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await api("put", "/users/me/profile", {
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
      });
      onUpdate?.(res.data.data);
      showToast("Preferences saved!");
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tab-content">
      <section className="section">
        <h3 className="section-title">Dietary & skill</h3>
        <div className="pref-grid">
          <label className="field-label">
            Diet preference
            <select
              className="field-select"
              value={form.dietPreference}
              onChange={(e) =>
                setForm((f) => ({ ...f, dietPreference: e.target.value }))
              }
            >
              {DIET_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Cooking skill
            <select
              className="field-select"
              value={form.cookingSkill}
              onChange={(e) =>
                setForm((f) => ({ ...f, cookingSkill: e.target.value }))
              }
            >
              {SKILL_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Budget range (₹)</h3>
        <div className="pref-grid">
          <label className="field-label">
            Min
            <input
              className="field-input"
              type="number"
              min="0"
              value={form.budgetMin}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetMin: e.target.value }))
              }
            />
          </label>
          <label className="field-label">
            Max
            <input
              className="field-input"
              type="number"
              min="0"
              value={form.budgetMax}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetMax: e.target.value }))
              }
            />
          </label>
        </div>
        <div className="budget-bar-wrap">
          <div className="budget-bar">
            <div
              className="budget-bar-fill"
              style={{
                left: `${(Math.min(form.budgetMin, 2000) / 2000) * 100}%`,
                right: `${100 - (Math.min(form.budgetMax, 2000) / 2000) * 100}%`,
              }}
            />
          </div>
          <div className="budget-labels">
            <span>₹0</span>
            <span>₹2000</span>
          </div>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Favourite cuisines</h3>
        <div className="chip-grid">
          {CUISINE_LIST.map((c) => (
            <button
              key={c}
              onClick={() => toggleCuisine(c)}
              className={`chip ${form.cuisines.includes(c) ? "chip--active" : ""}`}
            >
              {form.cuisines.includes(c) && (
                <span className="chip-check">✓</span>
              )}
              {c}
            </button>
          ))}
        </div>
      </section>

      <div className="btn-row">
        <button className="btn btn--primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}
