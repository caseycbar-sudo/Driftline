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
import DishBackdrop from "./DishBackdrop";
import { backdropImages } from "./backdrop-images";
import { getCookbook } from "../../db/cookbook";
import "./plan/plan.css";
import DisclosureGate from "../disclosures/DisclosureGate";
import VisitGallery from "./VisitGallery";
import { listCustomerVisits } from "../../db/visits";
import { listPantry } from "../../db/pantry";
import BrandLogo from "../BrandLogo";
import { CONTACT_EMAIL } from "../site-config";
import "./account.css";
import PasskeyPrompt from "../PasskeyPrompt";
import Overview from "./Overview";
import { listPaymentsForCustomer } from "../../db/payments";
import { billingProfileFor, forCurrentSquare } from "../billing";

export const dynamic = "force-dynamic";

export default async function AccountPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("/account");
  const stored = await getOrCreateCustomer(user.email, user.displayName);
  // Accounts made before we had a name on file stored the email as the name; never greet someone by their email.
  const profile = stored.fullName.includes("@") ? { ...stored, fullName: "" } : stored;
  const profileDone = profileGaps(profile).length === 0;
  const visits = await listCustomerVisits(user.email).catch(() => []);
  const hasVisit = visits.length > 0;
  const billing = await billingProfileFor(user.email).catch(() => null);
  const payments = await listPaymentsForCustomer(user.email).then(forCurrentSquare).catch(() => []);
  const upcomingAll = await listUpcomingForCustomer(user.email, oregonToday()).catch(() => []);
  const pantry = await listPantry(user.email).catch(() => []);
  const firstName = profile.fullName.split(" ")[0] || "";
  const requests = await listForCustomer(user.email).catch(() => []);
  // Visits Casey booked directly (not from a request) still show up.
  const direct = (await listUpcomingForCustomer(user.email, oregonToday()).catch(() => [])).filter(v => !v.requestId);
  const firstTime = requests.length === 0 && direct.length === 0;
  const backdrop = backdropImages(await getCookbook().catch(() => []));
  return <main className="account-page has-dishes">
    <DishBackdrop images={backdrop} />
    <DisclosureGate scope="customer" />
    <PasskeyPrompt />
    <header className="account-nav"><Link className="account-brand" href="/"><BrandLogo/></Link><nav><Link href="/cookbook">Cookbook</Link><Link href="/meal-prep#pricing">Pricing</Link><a href={signOutPath("/")}>Sign out</a></nav></header>
    <section className="welcome-panel"><div><p>YOUR DRIFTLINE ACCOUNT</p><h1>{firstName ? `Welcome, ${firstName}.` : "Welcome."}</h1><span>Let&apos;s make home meals feel easier this week.</span></div><div className="account-status"><i>✓</i><span><small>Account ready</small><strong>Your preferences travel with every visit</strong></span></div></section>
    <section className="account-content">
      <Overview upcoming={upcomingAll} requests={requests} address={[profile.streetAddress, profile.city].filter(Boolean).join(", ")} completedVisits={visits.length} hasAutopay={Boolean(billing?.autopayConsentAt)} card={billing?.cardId ? { brand: billing.cardBrand, last4: billing.cardLast4, expMonth: billing.cardExpMonth, expYear: billing.cardExpYear } : null} payments={payments.map(p => ({ amountCents: p.amountCents, status: p.status, createdAt: p.createdAt, paidAt: p.paidAt ?? "" }))} />
      <div id="sessions">{firstTime ? <nav className="steps-first" aria-label="Get started">
        <Link className={profileDone ? "done" : ""} href="#profile"><i>{profileDone ? "✓" : "1"}</i><span><b>Tell us about you</b><br/>Name, phone, address and allergies.</span></Link>
        <Link href="/account/plan"><i>2</i><span><b>Pick your plan and meals</b><br/>Choose 3 to 5 entrées, plus 1 dessert. The plan and price follow your picks.</span></Link>
        <Link href="/account/plan"><i>3</i><span><b>Schedule your prep</b><br/>Tell us when you&apos;re free. We confirm within a day.</span></Link>
      </nav> : <SessionCards sent={params.sent === "1"} />}</div>
      {!firstTime && direct.length ? <section className="session-cards"><span>BOOKED WITH DRIFTLINE</span>{direct.map(v => <article className="session-card" key={v.id}><header><b>{prettyVisitDate(v.serviceDate)}</b><small>{v.status === "confirmed" ? "Confirmed" : "Scheduled"}</small></header><p>{prettyTime(v.startTime)}{v.endTime ? `-${prettyTime(v.endTime)}` : ""} · {v.chefEmail ? `Your chef: ${v.chef.split(" ")[0]}` : "We'll confirm your chef soon"}</p></article>)}</section> : null}
      {pantry.length ? <section className="meal-plan pantry-panel"><div className="meal-plan-heading"><div><span>IN YOUR KITCHEN</span><h2>Left from your last visit</h2></div></div><p className="pantry-note">Your chef put these away and will skip them on your next shopping list, so you aren&apos;t buying them twice.</p><ul className="pantry-items">{pantry.map(item => <li key={item.itemKey}>{item.name}{item.note ? <small> · {item.note}</small> : null}</li>)}</ul></section> : null}
      <div id="household"><ProfileForm initialProfile={profile} /></div>
      <BillingPanel />
      <div id="visits"><VisitGallery /></div>
      {hasVisit ? <ReviewForm defaultName={profile.fullName} defaultTown={profile.city} /> : null}
      <aside className="account-help" id="help"><div><span>Need a hand?</span><h2>We&apos;re real people, right here on the coast.</h2><p>Questions about packages, allergies, or whether the service is right for your household? Reach out and we&apos;ll talk it through.</p></div><a href={`mailto:${CONTACT_EMAIL}`}>Email Driftline →</a></aside>
    </section>
  </main>;
}
