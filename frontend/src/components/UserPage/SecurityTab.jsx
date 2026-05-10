import { useState } from "react";
import PasswordField from "./PasswordField";
import useToast from "../../hooks/useToast";
import axios from "axios";
import { base_url } from "../../utils/constant";

const api = (method, url, data) =>
  axios({ method, url: `${base_url}${url}`, data, withCredentials: true });

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "—"}</span>
    </div>
  );
}

function Badge({ label, color = "gray" }) {
  return <span className={`badge badge--${color}`}>{label}</span>;
}

export default function SecurityTab({ user }) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [show, setShow] = useState({ old: false, new: false, conf: false });
  const [saving, setSaving] = useState(false);
  const [strength, setStrength] = useState(0);

  const { showToast, showErrorToast } = useToast();

  function calcStrength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  }

  function handleNew(e) {
    const v = e.target.value;
    setForm((f) => ({ ...f, newPassword: v }));
    setStrength(calcStrength(v));
  }

  async function save() {
    if (form.newPassword !== form.confirm)
      return alert("Passwords don't match");
    if (form.newPassword.length < 8) return alert("Min 8 characters");
    setSaving(true);
    try {
      const res = await api("post", "/users/me/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
    //   console.log("Password changed", res.data);
      setForm({ oldPassword: "", newPassword: "", confirm: "" });
      setStrength(0);
      const message = res?.data?.message || "Password Changed";
      showToast(message);
    } catch (e) {
      const message = e.response?.data?.message || "Change failed";
      showErrorToast(message);
    //   console.error("Error:", e.response?.data);
    } finally {
      setSaving(false);
    }
  }

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#e24b4a", "#ef9f27", "#1d9e75", "#0f6e56"];

  return (
    <div className="tab-content">
      <section className="section">
        <h3 className="section-title">Change password</h3>
        <div className="security-form">
          <PasswordField
            label="Current password"
            value={form.oldPassword}
            show={show.old}
            onChange={(e) =>
              setForm((f) => ({ ...f, oldPassword: e.target.value }))
            }
            onToggle={() => setShow((s) => ({ ...s, old: !s.old }))}
          />
          <PasswordField
            label="New password"
            value={form.newPassword}
            show={show.new}
            onChange={handleNew}
            onToggle={() => setShow((s) => ({ ...s, new: !s.new }))}
          />
          {form.newPassword && (
            <div className="strength-wrap">
              <div className="strength-bars">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="strength-bar"
                    style={{
                      background:
                        i <= strength ? strengthColors[strength] : undefined,
                    }}
                  />
                ))}
              </div>
              <span
                className="strength-label"
                style={{ color: strengthColors[strength] }}
              >
                {strengthLabels[strength]}
              </span>
            </div>
          )}
          <PasswordField
            label="Confirm new password"
            value={form.confirm}
            show={show.conf}
            onChange={(e) =>
              setForm((f) => ({ ...f, confirm: e.target.value }))
            }
            onToggle={() => setShow((s) => ({ ...s, conf: !s.conf }))}
          />
          {form.confirm && form.confirm !== form.newPassword && (
            <p className="field-error">Passwords don't match</p>
          )}
          <div className="btn-row">
            <button
              className="btn btn--primary"
              onClick={save}
              disabled={
                saving ||
                !form.oldPassword ||
                !form.newPassword ||
                form.newPassword !== form.confirm
              }
            >
              {saving ? "Updating…" : "Update password"}
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <h3 className="section-title">Session info</h3>
        <div className="info-grid">
          <InfoRow label="Token version" value={user?.tokenVersion} />
          <InfoRow
            label="Account status"
            value={
              <Badge
                label={user?.isActive ? "Active" : "Suspended"}
                color={user?.isActive ? "green" : "red"}
              />
            }
          />
        </div>
      </section>
    </div>
  );
}
