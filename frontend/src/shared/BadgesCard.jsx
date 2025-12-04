function Badge({ name }) {
  return (
    <div className="bg-green-50 border border-green-100 text-green-800 px-3 py-2 rounded-md text-sm">{name}</div>
  );
}

export default function BadgesCard({ badges = [] }) {
  return (
    <div className="bg-[#cacaca] rounded-lg  p-4 shadow-md">
      <h3 className="font-semibold mb-3">Badges</h3>
      <div className="flex flex-wrap gap-2">
        {badges.length ? badges.map((b) => <Badge key={b} name={b} />) : <div className="text-sm text-slate-500">No badges earned yet</div>}
      </div>
    </div>
  );
}