import { useState } from "react";

/**
 * Simple controlled form that kicks off geocoding through SitesContext.addSite.
 */
export default function AddSiteForm({
  onAdd,
  busy,
  blockedMessage = null,
  onDismissBlockedMessage,
}) {
  const [value, setValue] = useState("");
  /** Client-side validation when the user submits whitespace-only input (never hits the API). */
  const [localError, setLocalError] = useState(null);

  function handleChange(e) {
    setValue(e.target.value);
    setLocalError(null);
    if (onDismissBlockedMessage && blockedMessage) onDismissBlockedMessage();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (busy) return;
    if (!trimmed) {
      setLocalError("Address is required");
      return;
    }
    const started = await onAdd(trimmed);
    if (started) {
      setValue("");
      setLocalError(null);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="row">
        <input
          className="input"
          type="text"
          placeholder="Enter a U.S. street address"
          value={value}
          onChange={handleChange}
          disabled={busy}
          aria-label="Site address"
        />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Resolving address…" : "Add Site"}
        </button>
      </div>
      {busy ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          Resolving address…
        </p>
      ) : null}
      {localError ? (
        <p className="error" role="alert" style={{ marginBottom: 0 }}>
          {localError}
        </p>
      ) : null}
      {!localError && blockedMessage ? (
        <p className="error" role="alert" style={{ marginBottom: 0 }}>
          {blockedMessage}
        </p>
      ) : null}
    </form>
  );
}
