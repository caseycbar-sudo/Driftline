import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { getOrCreateCustomer } from "../../db/customers";
import ProfileForm from "./ProfileForm";
import "./account.css";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");
  const profile = await getOrCreateCustomer(user.email, user.displayName);
  const firstName = profile.fullName.split(" ")[0] || "there";
  return <main className="account-page">
    <header className="account-nav"><Link className="account-brand" href="/"><span>D</span><strong>DRIFTLINE<small>AT HOME</small></strong></Link><nav><Link href="/cookbook">Cookbook</Link><Link href="/#pricing">Pricing</Link><a href={chatGPTSignOutPath("/")}>Sign out</a></nav></header>
    <section className="welcome-panel"><div><p>YOUR DRIFTLINE ACCOUNT</p><h1>Welcome, {firstName}.</h1><span>Let&apos;s make home meals feel easier this week.</span></div><div className="account-status"><i>✓</i><span><small>Account ready</small><strong>Your preferences travel with every visit</strong></span></div></section>
    <section className="account-content">
      <div className="quick-cards"><Link href="/cookbook"><span>01</span><h3>Choose your meals</h3><p>Browse 100 full recipes and find dishes your household will love.</p><b>Open cookbook →</b></Link><a href="/#booking"><span>02</span><h3>Request a visit</h3><p>Check North Coast availability when you&apos;re ready to get started.</p><b>Check availability →</b></a><article><span>03</span><h3>Your first visit</h3><p>After booking, your chef and visit details will appear right here.</p><b>Nothing scheduled yet</b></article></div>
      <ProfileForm initialProfile={profile} />
      <aside className="account-help"><div><span>Need a hand?</span><h2>We&apos;re real people, right here on the coast.</h2><p>Questions about packages, allergies, or whether the service is right for your household? Reach out and we&apos;ll talk it through.</p></div><a href="mailto:hello@driftlineprovisions.com">Email Driftline →</a></aside>
    </section>
  </main>;
}
