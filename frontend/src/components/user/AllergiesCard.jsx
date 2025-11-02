import { useEffect, useState } from "react";

export default function AllergiesCard({ allergies = [], onSave }) {
  const [items, setItems] = useState(allergies || []);
  const [newItem, setNewItem] = useState("");

  useEffect(()=>setItems(allergies || []), [allergies]);

  function remove(a){ setItems(items.filter(x=>x!==a)); }
  function add(){ if(!newItem) return; setItems([...items, newItem]); setNewItem(''); }

  async function save(){
    try{
      const res = await api.updateMe({ profile: { allergies: items } });
      onSave(res);
      alert('Allergies updated');
    }catch(e){alert(e.message)}
  }

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <h3 className="font-semibold mb-3">Allergies</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((a) => (
          <div key={a} className="px-3 py-1 bg-red-50 border rounded-full flex items-center gap-2">
            <span className="text-sm">{a}</span>
            <button onClick={()=>remove(a)} className="text-xs text-red-600">x</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={newItem} onChange={(e)=>setNewItem(e.target.value)} className="border rounded px-3 py-2 flex-1" placeholder="Add allergy (e.g. Gluten)" />
        <button onClick={add} className="px-3 py-2 border rounded">Add</button>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={save} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
      </div>
    </div>
  );
}