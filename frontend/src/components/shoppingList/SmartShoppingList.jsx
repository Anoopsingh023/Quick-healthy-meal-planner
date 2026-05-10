import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { base_url } from "../../utils/constant";

// ─── tiny helpers ────────────────────────────────────────────────────────────
const api = (method, path, data, cfg = {}) =>
  axios[method](`${base_url}${path}`, data, {
    withCredentials: true,
    ...cfg,
  });

const CAT_META = {
  Vegetable: { color: "#3b6d11", bg: "#eaf3de", icon: "🥦" },
  Fruit: { color: "#854f0b", bg: "#faeeda", icon: "🍎" },
  Dairy: { color: "#185fa5", bg: "#e6f1fb", icon: "🥛" },
  Spices: { color: "#993c1d", bg: "#faece7", icon: "🌶" },
  Bakery: { color: "#993556", bg: "#fbeaf0", icon: "🍞" },
  Other: { color: "#5f5e5a", bg: "#f1efe8", icon: "📦" },
};

const PRICE_MAP = {
  onion: 10,
  tomato: 20,
  potato: 15,
  garlic: 10,
  ginger: 15,
  milk: 55,
  butter: 50,
  paneer: 90,
  cumin: 20,
  coriander: 15,
  bread: 40,
  rice: 65,
  lemon: 8,
  spinach: 20,
  carrot: 25,
  capsicum: 35,
  eggs: 72,
  cheese: 95,
  flour: 45,
  oil: 120,
  sugar: 50,
  salt: 20,
  tea: 80,
  coffee: 150,
  chickpea: 70,
  lentil: 60,
  dal: 55,
};

const estimatePrice = (name) => {
  const lower = name.toLowerCase();
  const key = Object.keys(PRICE_MAP).find((k) => lower.includes(k));
  return key ? PRICE_MAP[key] : 25;
};

// ─── sub-components ──────────────────────────────────────────────────────────
const Spinner = () => (
  <span
    style={{
      display: "inline-block",
      width: 14,
      height: 14,
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
      verticalAlign: "middle",
    }}
  />
);

const Tag = ({ label, color, bg }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500,
      color,
      background: bg,
      letterSpacing: "0.02em",
    }}
  >
    {label}
  </span>
);

const ProgressBar = ({ pct }) => {
  const color = pct > 90 ? "#a32d2d" : pct > 70 ? "#ba7517" : "#1d9e75";
  return (
    <div
      style={{
        height: 5,
        background: "#e5e5e5",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(pct, 100)}%`,
          background: color,
          borderRadius: 4,
          transition: "width 0.4s ease, background 0.4s ease",
        }}
      />
    </div>
  );
};

// ─── main component ───────────────────────────────────────────────────────────
export default function SmartShoppingList() {
  // ── state ──
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState(800);
  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(7);
  const [tab, setTab] = useState("list"); // list | ai | recipe | planner
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCat, setNewCat] = useState("Vegetable");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [smartList, setSmartList] = useState(null);
  const [priorities, setPriorities] = useState({}); // itemId → priority
  const [quantities, setQuantities] = useState({}); // ingredient → qty
  const [aiError, setAiError] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const inputRef = useRef(null);

  // ── derived ──
  const totalSpent = items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);
  const remaining = budget - totalSpent;
  const budgetPct = Math.round((totalSpent / budget) * 100);
  const pendingCount = items.filter((i) => i.status === "pending").length;

  // ── fetch shopping list on mount ──
  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await api("get", "/shopinglists", undefined, {});
      const raw = res.data?.data?.items || [];
      console.log("List fetched",res.data)
      // attach local price estimate if not present
      setItems(
        raw.map((it) => ({
          ...it,
          estimatedPrice: it.estimatedPrice || estimatePrice(it.name),
        })),
      );
    } catch (e) {
      console.error("Fetch list error", e);
    } finally {
      setLoading(false);
    }
  };

  // ── fetch saved recipes for "From Recipe" tab ──
  const fetchRecipes = async () => {
    if (recipes.length) return;
    try {
      setRecipeLoading(true);
      const res = await api("get", "/users/me/saved-recipes", undefined, {});
      setRecipes(res.data?.data || []);
    } catch (e) {
      console.error("Fetch recipes error", e);
    } finally {
      setRecipeLoading(false);
    }
  };

  // ── add item ──
  const handleAdd = async () => {
    if (!newName.trim()) return;
    const price = estimatePrice(newName);
    try {
      const res = await api("post", "/shopinglists/add", {
        name: newName.trim(),
        quantity: newQty.trim(),
        category: newCat,
        estimatedPrice: price,
      });
      setItems(
        (res.data?.data?.items || []).map((it) => ({
          ...it,
          estimatedPrice: it.estimatedPrice || estimatePrice(it.name),
        })),
      );
      setNewName("");
      setNewQty("");
      inputRef.current?.focus();
    } catch (e) {
      console.error("Add item error", e);
    }
  };

  // ── remove item ──
  const handleRemove = async (itemId) => {
    try {
      const res = await api("delete", `/shopinglists/remove/${itemId}`);
      setItems(
        (res.data?.data?.items || []).map((it) => ({
          ...it,
          estimatedPrice: it.estimatedPrice || estimatePrice(it.name),
        })),
      );
    } catch (e) {
      console.error("Remove item error", e);
    }
  };

  // ── toggle purchased ──
  const handleToggle = async (itemId) => {
    // optimistic
    setItems((prev) =>
      prev.map((it) =>
        it._id === itemId
          ? { ...it, status: it.status === "pending" ? "purchased" : "pending" }
          : it,
      ),
    );
    try {
      await api("patch", `/shopinglists/toggle/${itemId}`);
    } catch (e) {
      console.error("Toggle error", e);
      fetchList(); // revert on failure
    }
  };

  // ── clear list ──
  const handleClear = async () => {
    if (!window.confirm("Clear entire shopping list?")) return;
    try {
      await api("delete", "/shopinglists/clear");
      setItems([]);
    } catch (e) {
      console.error("Clear error", e);
    }
  };

  // ── add from recipe ──
  const handleAddFromRecipe = async (recipeId) => {
    try {
      setRecipeLoading(true);
      const res = await api("post", "/shopinglists/from-recipe", { recipeId });
      setItems(
        (res.data?.data?.items || []).map((it) => ({
          ...it,
          estimatedPrice: it.estimatedPrice || estimatePrice(it.name),
        })),
      );
      setTab("list");
    } catch (e) {
      console.error("Add from recipe error", e);
    } finally {
      setRecipeLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  //  AI FEATURES  (all call the Anthropic API via your backend proxy)
  // ────────────────────────────────────────────────────────────────────────────

  // helper: call your backend AI endpoint
  const callAI = async (feature, payload) => {
    const res = await api("post", `/shopinglists/ai/${feature}`, payload);
    return res.data?.data;
  };

  // 1. Budget-aware suggestions
  const getBudgetSuggestions = useCallback(async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const data = await callAI("suggest", {
        budget,
        spent: totalSpent,
        remaining,
        currentItems: items.map((i) => i.name),
        people,
        days,
      });
      setAiSuggestions(data?.suggestions || []);
    } catch (e) {
      setAiError("Could not fetch suggestions. Try again.");
    } finally {
      setAiLoading(false);
    }
  }, [budget, totalSpent, remaining, items, people, days]);

  // 2. Substitute recommender
  const getSubstitutes = useCallback(async () => {
    if (!items.length) return;
    setAiLoading(true);
    setAiError("");
    try {
      const data = await callAI("substitutes", {
        items: items.map((i) => ({ name: i.name, price: i.estimatedPrice })),
        budget,
        remaining,
      });
      setSubstitutes(data?.substitutes || []);
    } catch (e) {
      setAiError("Could not fetch substitutes.");
    } finally {
      setAiLoading(false);
    }
  }, [items, budget, remaining]);

  // 3. Smart quantity estimation
  const getSmartQuantities = useCallback(async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const data = await callAI("quantities", {
        items: items.map((i) => i.name),
        people,
        days,
        budget,
      });
      setQuantities(data?.quantities || {});
    } catch (e) {
      setAiError("Could not estimate quantities.");
    } finally {
      setAiLoading(false);
    }
  }, [items, people, days, budget]);

  // 4. Priority auto-tagging
  const getPriorities = useCallback(async () => {
    if (!items.length) return;
    setAiLoading(true);
    setAiError("");
    try {
      const data = await callAI("priorities", {
        items: items.map((i) => ({
          id: i._id,
          name: i.name,
          category: i.category,
        })),
      });
      const map = {};
      (data?.priorities || []).forEach(({ id, priority }) => {
        map[id] = priority;
      });
      setPriorities(map);
    } catch (e) {
      setAiError("Could not fetch priorities.");
    } finally {
      setAiLoading(false);
    }
  }, [items]);

  // 5. Weekly meal planner sync
  const getWeeklyPlan = useCallback(async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const data = await callAI("weekly-plan", {
        budget,
        people,
        days,
        currentItems: items.map((i) => i.name),
      });
      setWeeklyPlan(data);
    } catch (e) {
      setAiError("Could not generate plan.");
    } finally {
      setAiLoading(false);
    }
  }, [budget, people, days, items]);

  // 6. Smart list from weekly plan (auto-populates shopping list)
  const syncWeeklyPlanToList = async () => {
    if (!weeklyPlan?.ingredients?.length) return;
    setAiLoading(true);
    try {
      const res = await api("post", "/shopinglists/ai/sync-plan", {
        ingredients: weeklyPlan.ingredients,
      });
      setItems(
        (res.data?.data?.items || []).map((it) => ({
          ...it,
          estimatedPrice: it.estimatedPrice || estimatePrice(it.name),
        })),
      );
      setTab("list");
    } catch (e) {
      setAiError("Could not sync plan.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── grouped items ──
  const grouped = items.reduce((acc, it) => {
    const c = it.category || "Other";
    if (!acc[c]) acc[c] = [];
    acc[c].push(it);
    return acc;
  }, {});

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        maxWidth: 780,
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,600;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .sl-item { animation: fadeSlideIn 0.2s ease; }
        .sl-btn { cursor:pointer; border:none; background:transparent; font-family:inherit; }
        .sl-tab { cursor:pointer; padding:7px 18px; border-radius:20px; font-size:13px; font-weight:500; border:1.5px solid #e0e0e0; background:transparent; transition:all .15s; }
        .sl-tab.active { background:#042d52; color:#fff; border-color:#042d52; }
        .sl-tab:not(.active):hover { background:#f5f5f5; }
        .sl-input { border:1.5px solid #e0e0e0; border-radius:10px; padding:9px 14px; font-size:14px; font-family:inherit; outline:none; transition:border-color .15s; background:#fafafa; }
        .sl-input:focus { border-color:#042d52; background:#fff; }
        .sl-select { border:1.5px solid #e0e0e0; border-radius:10px; padding:9px 12px; font-size:13px; font-family:inherit; outline:none; background:#fafafa; cursor:pointer; }
        .primary-btn { background:#042d52; color:#fff; border:none; border-radius:10px; padding:9px 20px; font-size:13px; font-weight:500; font-family:inherit; cursor:pointer; transition:opacity .15s; }
        .primary-btn:hover { opacity:.88; }
        .primary-btn:disabled { opacity:.5; cursor:not-allowed; }
        .ghost-btn { background:transparent; border:1.5px solid #e0e0e0; color:#444; border-radius:10px; padding:8px 16px; font-size:13px; font-weight:500; font-family:inherit; cursor:pointer; transition:all .15s; }
        .ghost-btn:hover { background:#f5f5f5; border-color:#bbb; }
        .danger-btn { background:#fcebeb; border:1.5px solid #f7c1c1; color:#a32d2d; border-radius:10px; padding:8px 14px; font-size:12px; font-family:inherit; cursor:pointer; }
        .danger-btn:hover { background:#f7c1c1; }
        .ai-card { background:#f7fbff; border:1.5px solid #b5d4f4; border-radius:14px; padding:1.25rem; margin-bottom:1rem; }
        .ai-tag { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; background:#fff; border:1.5px solid #e0e0e0; border-radius:20px; font-size:13px; cursor:pointer; transition:all .15s; }
        .ai-tag:hover { border-color:#042d52; color:#042d52; }
        .priority-high   { color:#a32d2d; background:#fcebeb; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
        .priority-medium { color:#854f0b; background:#faeeda; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
        .priority-low    { color:#3b6d11; background:#eaf3de; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
        .day-card { background:#fff; border:1.5px solid #e0e0e0; border-radius:12px; padding:1rem; }
        .check-box { width:20px; height:20px; border-radius:6px; border:1.5px solid #ccc; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; flex-shrink:0; }
        .check-box.done { background:#1d9e75; border-color:#1d9e75; color:#fff; }
        .sub-arrow { color:#888; font-size:16px; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 32,
            fontWeight: 600,
            color: "#042d52",
            marginBottom: 4,
          }}
        >
          Smart Shopping List
        </h1>
        <p style={{ fontSize: 14, color: "#888" }}>
          AI-powered grocery management for {people} people · {days} days
        </p>
      </div>

      {/* ── BUDGET PANEL ── */}
      <div
        style={{
          background: "#fff",
          border: "1.5px solid #e0e0e0",
          borderRadius: 16,
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#555",
              minWidth: 56,
            }}
          >
            Budget
          </span>
          <input
            type="range"
            min={200}
            max={5000}
            step={50}
            value={budget}
            onChange={(e) => setBudget(+e.target.value)}
            style={{ flex: 1, accentColor: "#042d52" }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#042d52",
              minWidth: 60,
              textAlign: "right",
            }}
          >
            ₹{budget}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {[
            { label: "estimated", val: `₹${totalSpent}`, warn: false },
            {
              label: "remaining",
              val: `₹${Math.max(0, remaining)}`,
              warn: remaining < 0,
            },
            { label: "items", val: items.length, warn: false },
            { label: "pending", val: pendingCount, warn: false },
          ].map(({ label, val, warn }) => (
            <div
              key={label}
              style={{
                background: warn ? "#fcebeb" : "#f7f7f7",
                borderRadius: 10,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: warn ? "#a32d2d" : "#042d52",
                }}
              >
                {val}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <ProgressBar pct={budgetPct} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#999",
            marginTop: 4,
          }}
        >
          <span>₹0</span>
          <span style={{ color: budgetPct > 90 ? "#a32d2d" : "#999" }}>
            {budgetPct}% used
          </span>
          <span>₹{budget}</span>
        </div>

        {/* people + days */}
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          {[
            { label: "People", val: people, set: setPeople, min: 1, max: 10 },
            { label: "Days", val: days, set: setDays, min: 1, max: 30 },
          ].map(({ label, val, set, min, max }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ fontSize: 13, color: "#666" }}>{label}</span>
              <button
                className="sl-btn"
                style={{
                  width: 26,
                  height: 26,
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                }}
                onClick={() => set((v) => Math.max(min, v - 1))}
              >
                −
              </button>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {val}
              </span>
              <button
                className="sl-btn"
                style={{
                  width: 26,
                  height: 26,
                  border: "1.5px solid #e0e0e0",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 16,
                }}
                onClick={() => set((v) => Math.min(max, v + 1))}
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "list", label: "📋 My List" },
          { key: "ai", label: "✨ AI Features" },
          { key: "recipe", label: "🍳 From Recipe" },
          { key: "planner", label: "📅 Weekly Planner" },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`sl-tab${tab === key ? " active" : ""}`}
            onClick={() => {
              setTab(key);
              if (key === "recipe") fetchRecipes();
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB: LIST
      ════════════════════════════════════════════════════════ */}
      {tab === "list" && (
        <div>
          {/* add row */}
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <input
              ref={inputRef}
              className="sl-input"
              style={{ flex: "1 1 160px" }}
              placeholder="Item name (e.g. Onion)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <input
              className="sl-input"
              style={{ width: 90 }}
              placeholder="Qty"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <select
              className="sl-select"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            >
              {Object.keys(CAT_META).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button className="primary-btn" onClick={handleAdd}>
              + Add
            </button>
          </div>

          {loading ? (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#999" }}
            >
              <Spinner /> Loading…
            </div>
          ) : !items.length ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#bbb",
                fontSize: 15,
              }}
            >
              Your list is empty.
              <br />
              <span style={{ fontSize: 13 }}>
                Add items above or use AI Features / From Recipe.
              </span>
            </div>
          ) : (
            <>
              {Object.entries(grouped).map(([cat, catItems]) => (
                <div key={cat} style={{ marginBottom: "1.25rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>
                      {CAT_META[cat]?.icon || "📦"}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: CAT_META[cat]?.color || "#666",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {cat}
                    </span>
                    <Tag
                      label={catItems.length}
                      color={CAT_META[cat]?.color || "#666"}
                      bg={CAT_META[cat]?.bg || "#f1efe8"}
                    />
                  </div>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {catItems.map((item) => (
                      <div
                        key={item._id}
                        className="sl-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          background: "#fff",
                          border: "1.5px solid #ebebeb",
                          borderRadius: 12,
                          padding: "10px 14px",
                          opacity: item.status === "purchased" ? 0.45 : 1,
                          transition: "opacity .2s",
                        }}
                      >
                        <div
                          className={`check-box${item.status === "purchased" ? " done" : ""}`}
                          onClick={() => handleToggle(item._id)}
                        >
                          {item.status === "purchased" && "✓"}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: 14,
                              color: "#1a1a1a",
                              textDecoration:
                                item.status === "purchased"
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span
                              style={{
                                fontSize: 12,
                                color: "#999",
                                marginLeft: 6,
                              }}
                            >
                              ({item.quantity})
                            </span>
                          )}
                          {quantities[item.name] && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "#185fa5",
                                marginLeft: 6,
                                fontWeight: 500,
                              }}
                            >
                              → {quantities[item.name]}
                            </span>
                          )}
                        </div>

                        {priorities[item._id] && (
                          <span className={`priority-${priorities[item._id]}`}>
                            {priorities[item._id]}
                          </span>
                        )}

                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#042d52",
                            minWidth: 44,
                            textAlign: "right",
                          }}
                        >
                          ₹{item.estimatedPrice || estimatePrice(item.name)}
                        </span>

                        <button
                          className="sl-btn"
                          onClick={() => handleRemove(item._id)}
                          style={{
                            color: "#ccc",
                            fontSize: 16,
                            padding: "2px 4px",
                            borderRadius: 6,
                            transition: "color .15s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.color = "#a32d2d")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.color = "#ccc")
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button className="danger-btn" onClick={handleClear}>
                  🗑 Clear all
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: AI FEATURES
      ════════════════════════════════════════════════════════ */}
      {tab === "ai" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {aiError && (
            <div
              style={{
                background: "#fcebeb",
                border: "1px solid #f7c1c1",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#a32d2d",
                fontSize: 13,
              }}
            >
              {aiError}
            </div>
          )}

          {/* 1. Budget suggestions */}
          <div className="ai-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#042d52",
                    marginBottom: 2,
                  }}
                >
                  ✨ Budget-aware suggestions
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Items you can still afford within ₹{Math.max(0, remaining)}{" "}
                  remaining
                </div>
              </div>
              <button
                className="primary-btn"
                style={{ fontSize: 12, padding: "7px 14px" }}
                onClick={getBudgetSuggestions}
                disabled={aiLoading}
              >
                {aiLoading ? <Spinner /> : "Suggest"}
              </button>
            </div>
            {aiSuggestions.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {aiSuggestions.map((s, i) => (
                  <div
                    key={i}
                    className="ai-tag"
                    onClick={() => {
                      setNewName(s.name);
                      setNewCat(s.category || "Other");
                      setTab("list");
                    }}
                  >
                    <span>{CAT_META[s.category]?.icon || "📦"}</span>
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span style={{ color: "#1d9e75", fontSize: 12 }}>
                      ₹{s.estimatedPrice}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Substitutes */}
          <div className="ai-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#042d52",
                    marginBottom: 2,
                  }}
                >
                  💡 Budget-friendly substitutes
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Cheaper swaps for items in your list
                </div>
              </div>
              <button
                className="primary-btn"
                style={{ fontSize: 12, padding: "7px 14px" }}
                onClick={getSubstitutes}
                disabled={aiLoading || !items.length}
              >
                {aiLoading ? <Spinner /> : "Analyze"}
              </button>
            </div>
            {substitutes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {substitutes.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      background: "#fff",
                      borderRadius: 10,
                      border: "1.5px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: 14, flex: 1 }}>
                      <strong>{s.original}</strong>
                    </span>
                    <span className="sub-arrow">→</span>
                    <span style={{ fontSize: 14, color: "#185fa5", flex: 1 }}>
                      {s.substitute}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#1d9e75",
                        fontWeight: 600,
                      }}
                    >
                      Save ₹{s.savings}
                    </span>
                    <button
                      className="ghost-btn"
                      style={{ fontSize: 12, padding: "5px 10px" }}
                      onClick={() => {
                        handleRemove(
                          items.find(
                            (it) =>
                              it.name.toLowerCase() ===
                              s.original.toLowerCase(),
                          )?._id,
                        );
                        setNewName(s.substitute);
                        setTab("list");
                      }}
                    >
                      Swap
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Smart quantities */}
          <div className="ai-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#042d52",
                    marginBottom: 2,
                  }}
                >
                  ⚖️ Smart quantity estimator
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {people} people × {days} days — calculates exact amounts
                  needed
                </div>
              </div>
              <button
                className="primary-btn"
                style={{ fontSize: 12, padding: "7px 14px" }}
                onClick={getSmartQuantities}
                disabled={aiLoading || !items.length}
              >
                {aiLoading ? <Spinner /> : "Calculate"}
              </button>
            </div>
            {Object.keys(quantities).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(quantities).map(([name, qty]) => (
                  <div
                    key={name}
                    style={{
                      padding: "6px 12px",
                      background: "#fff",
                      borderRadius: 20,
                      border: "1.5px solid #b5d4f4",
                      fontSize: 13,
                    }}
                  >
                    <strong>{name}</strong>:{" "}
                    <span style={{ color: "#185fa5" }}>{qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Priority tagging */}
          <div className="ai-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#042d52",
                    marginBottom: 2,
                  }}
                >
                  🎯 Priority auto-tagging
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  AI tags each item as high / medium / low priority
                </div>
              </div>
              <button
                className="primary-btn"
                style={{ fontSize: 12, padding: "7px 14px" }}
                onClick={getPriorities}
                disabled={aiLoading || !items.length}
              >
                {aiLoading ? <Spinner /> : "Tag items"}
              </button>
            </div>
            {Object.keys(priorities).length > 0 && (
              <div style={{ fontSize: 13, color: "#555" }}>
                Priorities applied — switch to <strong>My List</strong> tab to
                see tags on each item.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: FROM RECIPE
      ════════════════════════════════════════════════════════ */}
      {tab === "recipe" && (
        <div>
          {recipeLoading ? (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "#999" }}
            >
              <Spinner /> Loading saved recipes…
            </div>
          ) : !recipes.length ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "#bbb",
                fontSize: 15,
              }}
            >
              No saved recipes found.
              <br />
              <span style={{ fontSize: 13 }}>
                Save some recipes first from the Recipes section.
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {recipes.map((r) => (
                <div
                  key={r._id}
                  style={{
                    background: "#fff",
                    border: "1.5px solid #e0e0e0",
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "border-color .15s, transform .15s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#042d52";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0";
                    e.currentTarget.style.transform = "none";
                  }}
                  onClick={() => handleAddFromRecipe(r._id)}
                >
                  {r.image && (
                    <img
                      src={r.image}
                      alt={r.title}
                      style={{ width: "100%", height: 110, objectFit: "cover" }}
                    />
                  )}
                  <div style={{ padding: "10px 12px" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#042d52",
                        marginBottom: 4,
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#888",
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {r.metadata?.cuisine && (
                        <Tag
                          label={r.metadata.cuisine}
                          color="#185fa5"
                          bg="#e6f1fb"
                        />
                      )}
                      {r.metadata?.cookingTime && (
                        <span>{r.metadata.cookingTime} min</span>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "#1d9e75",
                        fontWeight: 500,
                      }}
                    >
                      + Add all ingredients
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB: WEEKLY PLANNER
      ════════════════════════════════════════════════════════ */}
      {tab === "planner" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: "1.25rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 14, color: "#666", flex: 1 }}>
              Generate a {days}-day meal plan for {people} people within ₹
              {budget}
            </div>
            <button
              className="primary-btn"
              onClick={getWeeklyPlan}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <Spinner /> Generating…
                </>
              ) : (
                "✨ Generate plan"
              )}
            </button>
          </div>

          {aiError && (
            <div
              style={{
                background: "#fcebeb",
                border: "1px solid #f7c1c1",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#a32d2d",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              {aiError}
            </div>
          )}

          {weeklyPlan && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: 10,
                  marginBottom: "1.25rem",
                }}
              >
                {weeklyPlan.days?.map((d, i) => (
                  <div key={i} className="day-card">
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#042d52",
                        marginBottom: 8,
                      }}
                    >
                      Day {d.day}
                    </div>
                    {["breakfast", "lunch", "dinner"].map(
                      (meal) =>
                        d[meal] && (
                          <div key={meal} style={{ marginBottom: 6 }}>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#999",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              {meal}
                            </div>
                            <div style={{ fontSize: 13, color: "#333" }}>
                              {d[meal]}
                            </div>
                          </div>
                        ),
                    )}
                    {d.estimatedCost && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#1d9e75",
                          marginTop: 6,
                          fontWeight: 500,
                        }}
                      >
                        ~₹{d.estimatedCost}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {weeklyPlan.totalCost && (
                <div
                  style={{
                    background:
                      weeklyPlan.totalCost <= budget ? "#eaf3de" : "#fcebeb",
                    border: `1.5px solid ${weeklyPlan.totalCost <= budget ? "#c0dd97" : "#f7c1c1"}`,
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: "1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    Total estimated cost:{" "}
                    <strong>₹{weeklyPlan.totalCost}</strong>
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color:
                        weeklyPlan.totalCost <= budget ? "#3b6d11" : "#a32d2d",
                    }}
                  >
                    {weeklyPlan.totalCost <= budget
                      ? "✓ Within budget"
                      : "⚠ Exceeds budget"}
                  </span>
                </div>
              )}

              <button
                className="primary-btn"
                style={{ width: "100%", padding: "12px" }}
                onClick={syncWeeklyPlanToList}
                disabled={aiLoading}
              >
                {aiLoading ? <Spinner /> : "📋 Sync all ingredients to My List"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
