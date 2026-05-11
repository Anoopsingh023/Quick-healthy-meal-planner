import axios from "axios";
import { useEffect, useState } from "react";
import { base_url } from "../../utils/constant";
import useToast from "../../hooks/useToast";


const api = (method, url, data) =>
  axios({ method, url: `${base_url}${url}`, data, withCredentials: true });

function Badge({ label, color = "gray" }) {
  return <span className={`badge badge--${color}`}>{label}</span>;
}

function StatPill({ icon, label, value }) {
  return (
    <div className="stat-pill">
      <span className="stat-icon">{icon}</span>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "—"}</span>
    </div>
  );
}


export default function OverviewTab({ user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    userName: user?.userName || "",
  });
  const [saving, setSaving] = useState(false);

  const {showToast,showErrorToast} = useToast()

  useEffect(() => {
    setForm({ fullName: user?.fullName || "", userName: user?.userName || "" });
  }, [user]);

  async function save() {
    setSaving(true);
    try {
      const res = await api("put", "/users/me/account", form);
      onUpdate?.(res.data.data);
      setEditing(false);
      console.log("Account details update ",res.data)
      const message = res?.data?.message || "Account details updated";
      showToast(message);
    } catch (e) {
      console.error("Error Account details update",e?.response.data)
        const errorMessage = e?.response?.data?.message || "Update failed";
      showErrorToast(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  const g = user?.gamification || {};

  return (
    <div className="tab-content">
      <section className="section">
        <h3 className="section-title">Personal info</h3>
        {!editing ? (
          <div className="info-grid">
            <InfoRow label="Full name" value={user?.fullName} />
            <InfoRow label="Username" value={`@${user?.userName}`} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone" value={user?.phoneNo} />
            <InfoRow
              label="Role"
              value={<Badge label={user?.role} color="blue" />}
            />
            <InfoRow
              label="Account"
              value={
                <Badge
                  label={user?.isActive ? "Active" : "Inactive"}
                  color={user?.isActive ? "green" : "red"}
                />
              }
            />
          </div>
        ) : (
          <div className="edit-form">
            <label className="field-label">
              Full name
              <input
                className="field-input"
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </label>
            <label className="field-label">
              Username
              <input
                className="field-input"
                value={form.userName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, userName: e.target.value }))
                }
              />
            </label>
            <div className="btn-row">
              <button
                className="btn btn--primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {!editing && (
          <button
            className="btn btn--outline mt-12"
            onClick={() => setEditing(true)}
          >
            Edit profile
          </button>
        )}
      </section>

      <section className="section">
        <h3 className="section-title">Cooking stats</h3>
        <div className="stats-row">
          <StatPill icon="🔥" label="Streak" value={`${g.streak || 0} days`} />
          <StatPill icon="⭐" label="Points" value={g.points || 0} />
          <StatPill
            icon="🍳"
            label="Cooked"
            value={`${g.cookedCount || 0} recipes`}
          />
        </div>
      </section>

      {g.badges?.length > 0 && (
        <section className="section">
          <h3 className="section-title">Badges</h3>
          <div className="badges-wrap">
            {g.badges.map((b) => (
              <Badge key={b} label={b} color="amber" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}