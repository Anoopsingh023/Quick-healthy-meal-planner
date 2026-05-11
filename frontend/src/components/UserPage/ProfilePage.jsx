import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { base_url } from "../../utils/constant";
import PreferencesTab from "./PreferencesTab";
import SecurityTab from "./SecurityTab";
import AllergiesTab from "./AllergiesTab";
import OverviewTab from "./OverviewTab";
import "./ProfilePage.css";
import Avatar from "./Avatar";
import { useAuth } from "../../context/AuthContext";

/* ─── helpers ─── */
const api = (method, url, data) =>
  axios({ method, url: `${base_url}${url}`, data, withCredentials: true });

const TABS = ["Overview", "Preferences", "Security", "Allergies"];

/* ─── main ─── */
export default function ProfilePage() {
  const [tab, setTab] = useState("Overview");

  const { user, setUser, loading } = useAuth(); // shared global state

  function patchUser(partial) {
    setUser((u) => ({ ...u, ...partial }));
  }

  if (loading)
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );

  const g = user?.gamification || {};

  return (
    <>
      <div className="profile-root">
        {/* Hero */}
        <div className="profile-hero">
          <div className="hero-inner">
            <Avatar user={user} onUpdate={patchUser} />
            <div className="hero-meta">
              <h1 className="hero-name">{user?.fullName || "Chef"}</h1>
              <p className="hero-handle">@{user?.userName}</p>
              <div className="hero-pills">
                {user?.profile?.dietPreference &&
                  user.profile.dietPreference !== "Any" && (
                    <span className="hero-pill hero-pill--green">
                      {user.profile.dietPreference}
                    </span>
                  )}
                {user?.profile?.cookingSkill && (
                  <span className="hero-pill hero-pill--blue">
                    {user.profile.cookingSkill}
                  </span>
                )}
                {g.streak > 0 && (
                  <span className="hero-pill hero-pill--amber">
                    🔥 {g.streak}d streak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="profile-card">
          {/* Tab bar */}
          <div className="tab-bar" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`tab-btn ${tab === t ? "tab-btn--active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          {tab === "Overview" && (
            <OverviewTab user={user} onUpdate={patchUser} />
          )}
          {tab === "Preferences" && (
            <PreferencesTab user={user} onUpdate={patchUser} />
          )}
          {tab === "Security" && <SecurityTab user={user} />}
          {tab === "Allergies" && (
            <AllergiesTab user={user} onUpdate={patchUser} />
          )}
        </div>
      </div>
    </>
  );
}
