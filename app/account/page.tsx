import Link from "next/link";
import { requireUser, signOutPath } from "../auth";
import { getOrCreateCustomer } from "../../db/customers";
import ProfileForm from "./ProfileForm";
import ReviewForm from "./ReviewForm";
import BillingPanel from "./BillingPanel";
import { listForCustomer } from "../../db/requests";
import { listUpcomingForCustomer } from "../../db/schedule";
import { oregonToday } from "../oregon-time";
import { prettyTime, prettyVisitDate } from "../visit-emails";
import { profileGaps } from "../request-core";
import SessionCards from "./SessionCards";
import "./plan/plan.css";
import DisclosureGate from "../disclosures/DisclosureGate";
import VisitGallery from "./VisitGallery";
import BrandLogo from "../BrandLogo";
import { CONTACT_EMAIL } from "../site-config";
import "./account.css";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("/account");
  const profile = await getOrCreateCustomer(user.email, user.displayName);
  const firstName = profile.fullName.split(" ")[0] || "there";
  const requests = await listForCustomer(user.email).catch(() => []);
  const profileDone = profileGaps(profile).length === 0;
  // Visits Casey booked directly (not from a request) still show up.
  const direct = (await listUpcomingForCustomer(user.email, oregonToday()).catch(() => [])).filter(v => !v.requestId);
  const firstTime = requests.length === 0 && direct.length === 0;
  return <main className="account-page">
    <DisclosureGate scope="customer" />
    <header className="account-nav"><Link className="account-brand" href="/"><BrandLogo/></Link><nav><Link href="/cookbook">Cookbook</Link><Link href="/meal-prep#pricing">Pricing</Link><Link className="staff-access" href="/chef">Chef login</Link><a href={signOutPath("/")}>Sign out</a></nav></header>
    <section className="welcome-panel"><div><p>YOUR DRIFTLINE ACCOUNT</p><h1>Welcome, {firstName}.</h1><span>Let&apos;s make home meals feel easier this week.</span></div><div className="account-status"><i>✓</i><span><small>Account ready</small><strong>Your preferences travel with every visit</strong></span></div></section>
    <section className="account-content">
      {firstTime ? <nav className="steps-first" aria-label="Get started">
        <Link className={profileDone ? "done" : ""} href="#profile"><i>{profileDone ? "✓" : "1"}</i><span><b>Tell us about you</b><br/>Name, phone, address and allergies.</span></Link>
        <Link href="/account/plan"><i>2</i><span><b>Pick your plan and meals</b><br/>Choose 3 to 5 dishes. The plan and price follow your picks.</span></Link>
        <Link href="/account/plan"><i>3</i><span><b>Schedule your prep</b><br/>Tell us when you&apos;re free. We confirm within a day.</span></Link>
      </nav> : <SessionCards sent={params.sent === "1"} />}
      {!firstTime && direct.length ? <section className="session-cards"><span>BOOKED WITH DRIFTLINE</span>{direct.map(v => <article className="session-card" key={v.id}><header><b>{prettyVisitDate(v.serviceDate)}</b><small>{v.status === "confirmed" ? "Confirmed" : "Scheduled"}</small></header><p>{prettyTime(v.startTime)}{v.endTime ? `-${prettyTime(v.endTime)}` : ""} · {v.chefEmail ? `Your chef: ${v.chef.split(" ")[0]}` : "We'll confirm your chef soon"}</p></article>)}</section> : null}
      <BillingPanel />
      <VisitGallery />
      <ProfileForm initialProfile={profile} />
      <ReviewForm defaultName={profile.fullName} defaultTown={profile.city} />
      <aside className="account-help"><div><span>Need a hand?</span><h2>We&apos;re real people, right here on the coast.</h2><p>Questions about packages, allergies, or whether the service is right for your household? Reach out and we&apos;ll talk it through.</p></div><a href={`mailto:${CONTACT_EMAIL}`}>Email Driftline →</a></aside>
    </section>
  </main>;
}
