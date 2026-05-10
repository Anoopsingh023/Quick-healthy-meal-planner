import axios from "axios";
import { useEffect, useState } from "react";
import { base_url } from "../../utils/constant";

export default function AllergiesCard({ allergies = [], onSave }) {
  const [items, setItems] = useState(allergies || []);
  const [newItem, setNewItem] = useState("");

  useEffect(() => setItems(allergies || []), [allergies]);

  function remove(a) {
    setItems(items.filter((x) => x !== a));
  }
  function add() {
    if (!newItem) return;
    setItems([...items, newItem]);
    setNewItem("");
  }

  async function save() {
    try {
      const normalized = Array.isArray(items) ? items : [items];

      const res = await axios.put(
        `${base_url}/users/me/allergies`,
        { allergies: normalized },
        {
          withCredentials: true
        }
      );
      alert("Allergies updated");
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="bg-[#cacaca] rounded-lg  p-4 shadow-md">
      <h3 className="font-semibold mb-3">Allergies</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((a) => (
          <div
            key={a}
            className="px-3 py-1 bg-red-50 border rounded-full flex items-center gap-2"
          >
            <span className="text-sm">{a}</span>
            <button
              onClick={() => remove(a)}
              className="text-xs text-red-600 cursor-pointer"
            >
              x
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="flex w-full items-center bg-white rounded-full shadow-md border border-gray-200 focus-within:ring-2 focus-within:ring-gray-400 transition-all duration-200">
          <div className="relative w-full">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add allergy (e.g. Gluten)"
              className="w-full px-5 py-3 text-gray-700 rounded-full focus:outline-none"
            />
          </div>

          <button
            onClick={add}
            className="ml-2 mr-1 px-5 py-2 bg-gray-600 text-white font-medium rounded-full hover:bg-gray-700 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Add
          </button>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={save}
          className="px-7 mx-auto py-2 bg-green-600 text-white rounded cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
}
