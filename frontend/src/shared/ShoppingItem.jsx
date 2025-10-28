import { useEffect, useState } from "react";

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
        !item.isPurchased ? "bg-green-50/40 border-green-300" : "bg-[#a4a2a2]"
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

export default ShoppingItem;
