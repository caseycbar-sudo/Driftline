import Link from "next/link";
import { requireChatGPTUser, chatGPTSignOutPath } from "../chatgpt-auth";
import { getOrCreateCustomer } from "../../db/customers";
import { getMealPlan } from "../../db/meals";
import { recipes } from "../cookbook/recipes";
import ProfileForm from "./ProfileForm";
import DisclosureGate from "../disclosures/DisclosureGate";
import VisitGallery from "./VisitGallery";
import BrandLogo from "../BrandLogo";
import "./account.css";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireChatGPTUser("/account");
  const profile = await getOrCreateCustomer(user.email, user.displayName);
  const mealPlan = await getMealPlan(user.email);
  const chosenRecipes = recipes.filter(recipe => mealPlan.selectedRecipeIds.includes(recipe.id));
  const firstName = profile.fullName.split(" ")[0] || "there";
  return <main className="account-page">
    <DisclosureGate scope="customer" />
    <header className="account-nav"><Link className="account-brand" href="/"><BrandLogo/></Link><nav><Link href="/cookbook">Cookbook</Link><Link href="/#pricing">Pricing</Link><Link className="staff-access" href="/chef">Chef login</Link><a href={chatGPTSignOutPath("/")}>Sign out</a></nav></header>
    <section className="welcome-panel"><div><p>YOUR DRIFTLINE ACCOUNT</p><h1>Welcome, {firstName}.</h1><span>Let&apos;s make home meals feel easier this week.</span></div><div className="account-status"><i>✓</i><span><small>Account ready</small><strong>Your preferences travel with every visit</strong></span></div></section>
    <section className="account-content">
      <div className="onboarding-path"><span className="path-complete"><i>✓</i><b>Build your profile</b></span><span className={chosenRecipes.length+mealPlan.customRecipes.length>0?"path-complete":"path-current"}><i>{chosenRecipes.length+mealPlan.customRecipes.length>0?"✓":"2"}</i><b>Choose starter dishes</b></span><span><i>3</i><b>Request your first visit</b></span></div>
      <div className="quick-cards"><Link href="/cookbook"><span>01</span><h3>Choose your meals</h3><p>Browse 100 full recipes and find dishes your household will love.</p><b>Open cookbook →</b></Link><Link href="/cookbook?add=recipe"><span>02</span><h3>Add your own recipe</h3><p>Share a family favorite or a recipe you already know you love.</p><b>Add a personal recipe →</b></Link><a href="/#booking"><span>03</span><h3>Request a visit</h3><p>Once your starter menu feels right, check North Coast availability.</p><b>Check availability →</b></a></div>
      <section className="meal-plan"><div className="meal-plan-heading"><div><span>YOUR STARTER MEAL PLAN</span><h2>Dishes you&apos;d like us to make</h2></div><Link href="/cookbook">+ Choose more dishes</Link></div>{chosenRecipes.length+mealPlan.customRecipes.length===0?<div className="empty-meals"><b>Your menu is ready for a first choice.</b><p>Pick 3–6 dishes to give us a feel for your household. Nothing is scheduled or charged yet.</p><Link href="/cookbook">Browse the cookbook →</Link></div>:<div className="chosen-meals">{chosenRecipes.map(recipe=><article key={recipe.id}><img src={recipe.image} alt=""/><div><small>DRIFTLINE RECIPE</small><h3>{recipe.title}</h3><p>{recipe.main} · {recipe.starch}</p></div></article>)}{mealPlan.customRecipes.map(recipe=><article className="custom-meal" key={`custom-${recipe.id}`}><div className="custom-icon">♥</div><div><small>YOUR OWN RECIPE</small><h3>{recipe.title}</h3><p>{recipe.servings} servings · Saved for chef review</p></div></article>)}</div>}</section>
      <VisitGallery />
      <ProfileForm initialProfile={profile} />
      <aside className="account-help"><div><span>Need a hand?</span><h2>We&apos;re real people, right here on the coast.</h2><p>Questions about packages, allergies, or whether the service is right for your household? Reach out and we&apos;ll talk it through.</p></div><a href="mailto:hello@driftlineprovisions.com">Email Driftline →</a></aside>
    </section>
  </main>;
}
