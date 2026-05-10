import axios from "axios";
import { useEffect, useState } from "react";
import { base_url } from "../../utils/constant";
import useToast from "../../hooks/useToast";

const api = (method, url, data) =>
  axios({ method, url: `${base_url}${url}`, data, withCredentials: true });

export default function AllergiesTab({ user, onUpdate }) {
  const [items, setItems] = useState(user?.profile?.allergies || []);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const {showToast,showErrorToast} = useToast()

  useEffect(() => setItems(user?.profile?.allergies || []), [user]);

  function add() {
    const v = input.trim().toLowerCase();
    if (!v || items.includes(v)) return;
    setItems((i) => [...i, v]);
    setInput("");
  }

  async function save() {
    setSaving(true);
    try {
      const res = await api("put", "/users/me/allergies", { allergies: items });
      onUpdate?.(res.data.data);
      console.log("add allergies",res.data)
      showToast("Allergies updated!");
    } catch (e) {
    showErrorToast("Allergies update failed");
    console.log("Error add allergies",e)
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tab-content">
      <section className="section">
        <h3 className="section-title">Your allergies</h3>
        <p className="section-desc">
          We'll exclude recipes with these ingredients from your
          recommendations.
        </p>

        <div className="allergy-input-row">
          <input
            className="field-input"
            placeholder="e.g. Gluten, Peanuts, Dairy…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn btn--outline" onClick={add}>
            Add
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🌿</span>
            <p>No allergies added yet.</p>
          </div>
        ) : (
          <div className="allergy-chips">
            {items.map((a) => (
              <div key={a} className="allergy-chip">
                <span>{a}</span>
                <button
                  onClick={() => setItems((i) => i.filter((x) => x !== a))}
                  className="allergy-remove"
                  aria-label={`Remove ${a}`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="btn-row mt-16">
          <button className="btn btn--primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save allergies"}
          </button>
        </div>
      </section>
    </div>
  );
}