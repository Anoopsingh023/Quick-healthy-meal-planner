// pages/ShoppingList.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Ingredients from "../../shared/Ingredients";

/**
 * Props / Behavior:
 * - Reads initial items from location.state.items (if provided)
 * - If no items provided, tries to fetch from /api/shopping-list (change endpoint as needed)
 * - Exposes UI to add / edit / remove items
 * - Calls placeholder async functions (addItemApi, updateItemApi, removeItemApi).
 *   Replace them with your real API integration.
 */
const API_URL = `${
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
}/api/shopping-list`;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const placeholderFetchList = async () => {
  // replace with real API call

  return { ok: true, json: async () => ({ items: [] }) };
};

const addItemApi = async (item) => {
  // Replace with real POST /api/shopping-list call
  // Return created item (with _id) from server
  //   return { ok: true, json: async () => ({ ...item, _id: Date.now().toString() }) };
  const res = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(item),
  });
  return res.json();
};

const updateItemApi = async (itemId, patch) => {
  // Replace with PATCH /api/shopping-list/:id
  return { ok: true, json: async () => ({ success: true }) };
};

const removeItemApi = async (itemId) => {
  // Replace with DELETE /api/shopping-list/:id
  return { ok: true, json: async () => ({ success: true }) };
};

const Heading = ({ children }) => (
  <h2 className="text-2xl font-semibold mb-3">{children}</h2>
);

const ShoppingItem = ({
  item,
  onTogglePurchased,
  onRemove,
  onUpdateQuantity,
  onUpdateCategory,
}) => {
  const [editingQty, setEditingQty] = useState(false);
  const [qtyValue, setQtyValue] = useState(item.quantity || "");

  useEffect(() => setQtyValue(item.quantity || ""), [item.quantity]);

  return (
    <div
      className={`flex items-start gap-4 p-3 rounded-lg border ${
        item.isPurchased ? "bg-green-50/40 border-green-300" : "bg-white"
      }`}
    >
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={!!item.isPurchased}
          onChange={() => onTogglePurchased(item)}
          aria-label={`Mark ${item.name} as purchased`}
          className="w-5 h-5 cursor-pointer"
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Use shared Ingredients component when available; otherwise fallback */}
            {typeof Ingredients === "function" ? (
              <div className="min-w-[160px]">
                <Ingredients {...item} hideControls />
              </div>
            ) : (
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">{item.category}</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quantity editing */}
            {editingQty ? (
              <>
                <input
                  type="text"
                  value={qtyValue}
                  onChange={(e) => setQtyValue(e.target.value)}
                  className="w-28 px-2 py-1 border rounded"
                />
                <button
                  onClick={() => {
                    onUpdateQuantity(item, qtyValue);
                    setEditingQty(false);
                  }}
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setQtyValue(item.quantity || "");
                    setEditingQty(false);
                  }}
                  className="px-2 py-1 rounded bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-700 mr-2">
                  {item.quantity || "—"}
                </div>
                <button
                  onClick={() => setEditingQty(true)}
                  className="px-2 py-1 rounded border text-sm"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        {/* Category selector */}
        <div className="mt-2 flex items-center gap-3">
          <select
            value={item.category || ""}
            onChange={(e) => onUpdateCategory(item, e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="">Uncategorized</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Fruit">Fruit</option>
            <option value="Dairy">Dairy</option>
            <option value="Spices">Spices</option>
            <option value="Bakery">Bakery</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={() => onRemove(item)}
            className="ml-auto px-2 py-1 text-sm rounded bg-red-50 border border-red-200 text-red-600"
            aria-label={`Remove ${item.name}`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const ShoppingList = () => {
  const { state } = useLocation();
  const initialItems = state?.items ?? null;
  const [items, setItems] = useState(initialItems ?? []);
  const [loading, setLoading] = useState(!initialItems);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (initialItems) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await placeholderFetchList();
        if (!mounted) return;
        if (res.ok) {
          const payload = await res.json();
          setItems(payload.items || []);
        } else {
          alert("Failed to load shopping list");
        }
      } catch (err) {
        console.error(err);
        alert("Error loading shopping list");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [initialItems]);

  // Optimistic add
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      alert("Enter item name");
      return;
    }

    setAdding(true);
    // optimistic local item (temporary id)
    // const temp = {
    //   ...newItem,
    //   _id: `temp-${Date.now()}`,
    //   isPurchased: false,
    //   addedFromRecipe: null,
    // };
    // setItems((s) => [temp, ...s]);
    // setNewItem({ name: "", quantity: "", category: "" });

    try {
      const res = await addItemApi(temp);
      if (!res.ok) throw new Error("Failed to add");
      const saved = await res.json();
      // replace temp with saved from server
      setItems((s) => s.map((it) => (it._id === saved._id ? saved : it)));
    } catch (err) {
      // revert optimistic
      setItems((s) => s.filter((it) => it._id !== temp._id));
      console.error(err);
      alert("Failed to add item. Try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (item) => {
    const yes = window.confirm(`Remove "${item.name}" from shopping list?`);
    if (!yes) return;

    // optimistic remove
    const backup = items;
    setItems((s) => s.filter((it) => it._id !== item._id));

    try {
      const res = await removeItemApi(item._id);
      if (!res.ok) throw new Error("Failed to remove");
      // success — do nothing (already removed)
    } catch (err) {
      console.error(err);
      alert("Failed to remove item. Restoring.");
      setItems(backup);
    }
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    const backup = items;
    setItems((s) =>
      s.map((it) =>
        it._id === item._id ? { ...it, quantity: newQuantity } : it
      )
    );

    try {
      const res = await updateItemApi(item._id, { quantity: newQuantity });
      if (!res.ok) throw new Error("Failed to update");
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity. Reverting.");
      setItems(backup);
    }
  };

  const handleTogglePurchased = async (item) => {
    const backup = items;
    setItems((s) =>
      s.map((it) =>
        it._id === item._id ? { ...it, isPurchased: !it.isPurchased } : it
      )
    );

    try {
      const res = await updateItemApi(item._id, {
        isPurchased: !item.isPurchased,
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch (err) {
      console.error(err);
      alert("Failed to update. Reverting.");
      setItems(backup);
    }
  };

  const handleUpdateCategory = async (item, category) => {
    const backup = items;
    setItems((s) =>
      s.map((it) => (it._id === item._id ? { ...it, category } : it))
    );

    try {
      const res = await updateItemApi(item._id, { category });
      if (!res.ok) throw new Error("Failed to update");
    } catch (err) {
      console.error(err);
      alert("Failed to update category. Reverting.");
      setItems(backup);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 rounded bg-gray-100 border"
          >
            Back
          </button>
          <Heading>Shopping List</Heading>
        </div>

        <div className="text-sm text-gray-600">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Add item */}
      <form
        onSubmit={handleAddItem}
        className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem((s) => ({ ...s, name: e.target.value }))}
          placeholder="Item name (e.g., Tomatoes)"
          className="col-span-1 sm:col-span-2 px-3 py-2 border rounded"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem.quantity}
            onChange={(e) =>
              setNewItem((s) => ({ ...s, quantity: e.target.value }))
            }
            placeholder="Quantity (e.g., 2 pcs / 500g)"
            className="px-3 py-2 border rounded flex-1"
          />
          <select
            value={newItem.category}
            onChange={(e) =>
              setNewItem((s) => ({ ...s, category: e.target.value }))
            }
            className="px-2 py-2 border rounded"
          >
            <option value="">Category</option>
            <option value="Vegetable">Vegetable</option>
            <option value="Fruit">Fruit</option>
            <option value="Dairy">Dairy</option>
            <option value="Spices">Spices</option>
            <option value="Bakery">Bakery</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-3 flex gap-2">
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add to list"}
          </button>
          <button
            type="button"
            onClick={() => {
              // Quick clear form
              setNewItem({ name: "", quantity: "", category: "" });
            }}
            className="px-4 py-2 border rounded"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Items */}
      {loading ? (
        <div>Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-6 rounded border text-gray-600">
          No items in your shopping list.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ShoppingItem
              key={item._id}
              item={item}
              onTogglePurchased={handleTogglePurchased}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateCategory={handleUpdateCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
