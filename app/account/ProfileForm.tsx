"use client";

import { useState } from "react";
import type { CustomerProfile } from "../../db/customers";

export default function ProfileForm({ initialProfile }: { initialProfile: CustomerProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const update = (key: keyof CustomerProfile, value: string | number) => setProfile((current) => ({ ...current, [key]: value }));

  async function save(event: React.FormEvent) {
    event.preventDefault(); setStatus("saving");
    try {
      const response = await fetch("/api/account", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(profile) });
      if (!response.ok) throw new Error("Save failed");
      setProfile(await response.json()); setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2600);
    } catch { setStatus("error"); }
  }

  return <form className="profile-form" onSubmit={save}>
    <div className="form-heading"><div><span>Your household</span><h2>Help us cook like we know you.</h2></div><p>These notes stay with your account, so you won&apos;t need to explain everything again.</p></div>
    <div className="profile-grid">
      <label>Full name<input value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} required /></label>
      <label>Email<input value={profile.email} disabled /></label>
      <label>Phone number<input type="tel" value={profile.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(503) 555-0123" /></label>
      <label>City<select value={profile.city} onChange={(e) => update("city", e.target.value)}><option value="">Choose your city</option><option>Astoria</option><option>Warrenton</option><option>Gearhart</option><option>Seaside</option><option>Cannon Beach</option><option>Outside current area</option></select></label>
      <label>Household size<input type="number" min="1" max="20" value={profile.householdSize} onChange={(e) => update("householdSize", Number(e.target.value))} /></label>
      <label>Who is service for?<select value={profile.serviceFor} onChange={(e) => update("serviceFor", e.target.value)}><option>My household</option><option>A parent or loved one</option><option>A client I care for</option></select></label>
      <label>Preferred package<select value={profile.preferredPackage} onChange={(e) => update("preferredPackage", e.target.value)}><option>Essential</option><option>Classic</option><option>Weekly</option><option>Couples</option><option>Household</option><option>Family</option></select></label>
    </div>
    <div className="notes-grid">
      <label>Allergies or dietary needs<textarea value={profile.dietaryNeeds} onChange={(e) => update("dietaryNeeds", e.target.value)} placeholder="Tell us what needs special care." /></label>
      <label>Foods you love<textarea value={profile.favoriteFoods} onChange={(e) => update("favoriteFoods", e.target.value)} placeholder="Favorite dishes, flavors, and comfort foods." /></label>
      <label>Foods to avoid<textarea value={profile.foodsToAvoid} onChange={(e) => update("foodsToAvoid", e.target.value)} placeholder="Dislikes, textures, or ingredients to skip." /></label>
    </div>
    <div className="save-row"><button disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Save household details"}<span>→</span></button><p role="status">{status === "saved" ? "✓ Your details are saved." : status === "error" ? "We couldn't save that. Please try again." : "You can update these details anytime."}</p></div>
  </form>;
}
