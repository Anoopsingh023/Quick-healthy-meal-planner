// pages/ShoppingList.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Ingredients from "../../shared/Ingredients";
import { base_url } from "../../utils/constant";
import ShoppingItem from "../../shared/ShoppingItem";
import axios from "axios";
import BackButton from "../../shared/BackButton";

const API_URL = `${base_url}/shopinglists`;

const fetchListFromServer = async (signal) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw { code: "NO_TOKEN", message: "No auth token in localStorage" };
  }

  const res = await axios.get(`${API_URL}/`, {
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    signal, // abort support
  });
  console.log("shopping list",res.data)

  return res.data; // expected { success: true, items: [...] }
};

const addItemApi = async (item) => {
  // send only necessary fields to backend
  const payload = {
    name: item.name,
    quantity: item.quantity,
    category: item.category || "",
    isPurchased: !!item.isPurchased,
    addedFromRecipe: item.addedFromRecipe || null,
  };

  const res = await axios.post(`${API_URL}/add`, payload, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "Content-Type": "application/json",
    },
  });
  console.log("Add item in shopping list", res.data);

  // axios returns parsed data on res.data
  return res.data.data;
};

const updateItemApi = async (itemId, patch) => {
  try {
    const res = await axios.patch(
      `${API_URL}/update/${itemId}`,
      patch, // <-- send the patch object as the request body
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    // res.data is parsed JSON from axios
    console.log("update item response:", res.data);
    return res.data;
  } catch (err) {
    console.error(
      "updateItemApi error:",
      err?.response?.data || err.message || err
    );
    throw err; // let caller handle revert
  }
};

const togglePurchaseApi = async (itemId, patch) => {
  try {
    const res = await axios.patch(
      `${API_URL}/toggle/${itemId}`,
      patch, // <-- send the patch object as the request body
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    // res.data is parsed JSON from axios
    console.log("update item response:", res.data);
    return res.data;
  } catch (err) {
    console.error(
      "updateItemApi error:",
      err?.response?.data || err.message || err
    );
    throw err; // let caller handle revert
  }
};

const removeItemApi = async (itemId) => {
  const res = await axios.delete(`${API_URL}/remove/${itemId}`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "Content-Type": "application/json",
    },
  });
  console.log("remove item from shopping list", res.data);

  // axios returns parsed data on res.data
  return res.data;
};

const Heading = ({ children }) => (
  <h2 className="text-2xl font-semibold mb-3">{children}</h2>
);

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
  const controller = new AbortController();
  const signal = controller.signal;

  (async () => {
    if (initialItems && Array.isArray(initialItems)) {
      setItems(initialItems);
    }

    const MAX_RETRIES = 2;
    let attempt = 0;

    while (mounted && attempt <= MAX_RETRIES) {
      try {
        setLoading(true);
        const data = await fetchListFromServer(signal);

        if (!mounted) return;

        if (data?.success) {
          setItems(data.data.items || []);
        } else {
          console.warn("Unexpected shopping list response:", data);
          setItems(data.items || []);
        }
        break;
      } catch (err) {
        if (axios.isCancel && axios.isCancel(err)) {
          console.log("Shopping list fetch aborted");
          break;
        }

        if (err && err.code === "NO_TOKEN" && attempt < MAX_RETRIES) {
          attempt++;
          console.warn("No token yet, retrying fetch... attempt:", attempt);
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }

        if (err?.response?.status === 401) {
          console.warn("Unauthorized when fetching shopping list (401)");
        } else {
          console.error("Error fetching shopping list:", err?.response?.data ?? err.message ?? err);
        }
        break;
      } finally {
        if (mounted) setLoading(false);
      }
    }
  })();

  return () => {
    mounted = false;
    controller.abort?.();
  };
}, [initialItems]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.name.trim()) {
      alert("Enter item name");
      return;
    }

    setAdding(true);

    // optimistic local item (temporary id)
    const temp = {
      name: newItem.name,
      quantity: newItem.quantity || "",
      category: newItem.category || "",
      _id: `temp-${Date.now()}`,
      isPurchased: false,
      addedFromRecipe: null,
    };

    // add locally immediately
    setItems((s) => [temp, ...s]);
    setNewItem({ name: "", quantity: "", category: "" });

    try {
      // call real API
      const data = await addItemApi(temp);
      // Expect server to return created item (with _id)
      // Adjust checks to match your API response shape
      const saved = data?.list || data?.data || data; // support common patterns

      if (!saved || !saved._id) {
        // backend didn't return created item; throw so we revert
        console.error("Unexpected add response:", data);
        throw new Error("Invalid response from server");
      }

      // Replace temp item with saved item from server
      setItems((s) => s.map((it) => (it._id === temp._id ? saved : it)));
    } catch (err) {
      // revert optimistic update
      setItems((s) => s.filter((it) => it._id !== temp._id));
      console.error("Add item failed:", err);
      alert("Failed to add item. Try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (item) => {
    const yes = window.confirm(`Remove "${item.name}" from shopping list?`);
    if (!yes) return;

    // optimistic remove
    const backup = Array.isArray(items) ? [...items] : [];
    setItems((s) => s.filter((it) => it._id !== item._id));

    try {
      const data = await removeItemApi(item._id);
      if (data && data.success && Array.isArray(data.items)) {
        setItems(data.items);
        return;
      }

      // If backend responded but without items, check success flag
      if (data && data.success) {
        // nothing else to do (already removed optimistically)
        return;
      }
      console.error("Remove failed response:", data);
      throw new Error("Failed to remove item on server");
    } catch (err) {
      console.error(err);
      alert("Failed to remove item. Restoring.");
      setItems(backup);
    }
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    const backup = Array.isArray(items) ? [...items] : [];

    setItems((s) =>
      s.map((it) =>
        it._id === item._id ? { ...it, quantity: newQuantity } : it
      )
    );

    try {
      const data = await updateItemApi(item._id, { quantity: newQuantity });

      if (!data || data.success !== true) {
        console.error("Unexpected update response:", data);
        throw new Error("Failed to update on server");
      }

      if (Array.isArray(data.items)) {
        setItems(data.items);
      } else if (data.item) {
        setItems((s) =>
          s.map((it) => (it._id === data.item._id ? data.item : it))
        );
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update quantity. Reverting.");
      setItems(backup);
    }
  };

  const handleTogglePurchased = async (item) => {
    const backup = Array.isArray(items) ? [...items] : [];
    setItems((s) =>
      s.map((it) =>
        it._id === item._id ? { ...it, isPurchased: !it.isPurchased } : it
      )
    );

    try {
      const data = await togglePurchaseApi(item._id, {
        isPurchased: !item.isPurchased,
      });
      if (!data || data.success !== true) throw new Error("Failed to update");

      if (Array.isArray(data.items)) {
        setItems(data.items);
      } else if (data.item) {
        setItems((s) =>
          s.map((it) => (it._id === data.item._id ? data.item : it))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update. Reverting.");
      setItems(backup);
    }
  };

  const handleUpdateCategory = async (item, category) => {
    const backup = Array.isArray(items) ? [...items] : [];
    setItems((s) =>
      s.map((it) => (it._id === item._id ? { ...it, category } : it))
    );

    try {
      const data = await updateItemApi(item._id, { category });

      if (!data || data.success !== true) {
        console.error("Unexpected update response:", data);
        throw new Error("Failed to update on server");
      }

      if (Array.isArray(data.items)) {
        setItems(data.items);
      } else if (data.item) {
        setItems((s) =>
          s.map((it) => (it._id === data.item._id ? data.item : it))
        );
      }
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
          <BackButton/>
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