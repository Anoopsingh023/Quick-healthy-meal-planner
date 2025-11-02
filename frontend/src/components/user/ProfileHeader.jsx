import React from "react";

function ProfileHeader({ user, onEdit }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <img src={user?.avatar} alt="avatar" className="w-50 h-50 rounded-full object-cover border" />
        <div>
          <h2 className="text-2xl font-bold">{user?.fullName}</h2>
          <p className="text-sm text-slate-500">@{user?.userName}</p>
          <p className="text-sm text-slate-600 mt-2">{user?.email}</p>
          <p className="text-sm text-slate-600 mt-2">{user?.phoneNo}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader