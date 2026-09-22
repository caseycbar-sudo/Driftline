import Link from "next/link";
import { requireUser, signOutPath } from "../auth";
import { getOrCreateCustomer } from "../../db/customers";
import { getMealPlan } from "../../db/meals";
import { getCookbook } from "../../db/cookbook";
import ProfileForm from "./ProfileForm";
import ReviewForm from "./ReviewForm";
import BillingPanel from "./BillingPanel";
import { listUpcomingForCustomer } from "../../db/schedule";
import { oregonToday } from "../oregon-time";
import { prettyTime, prettyVisitDate } from "../visit-emails";
import DisclosureGate from "../disclosures/DisclosureGate";
import VisitGallery from "./VisitGallery";
import { listCustomerVisits } from "../../db/visits";
import BrandLogo from "../BrandLogo";
import { CONTACT_EMAIL, smallImage } from "../site-config";
import "./account.css";
import DishPhoto from "../DishPhoto";
import PasskeyPrompt from "../PasskeyPrompt";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser("/account");
  const stored = await getOrCreateCustomer(user.email, user.displayName);
  // Accounts made before we had a name on file stored the email as the name; never greet someone by their email.
  const profile = stored.fullName.includes("@") ? { ...stored, fullName: "" } : stored;
  const profileDone = Boolean(profile.fullName && profile.streetAddress);
  const hasVisit = (await listCustomerVisits(user.email).catch(() => [])).length > 0;
  const mealPlan = await getMealPlan(user.email);
  const recipes = await getCookbook();
  const chosenRecipes = recipes.filter(recipe => recipe.side === "meal-prep" && mealPlan.selectedRecipeIds.includes(recipe.id));
  const dinnerWishlist = recipes.filter(recipe => recipe.side === "private-chef" && mealPlan.selectedRecipeIds.includes(recipe.id));
  const firstName = profile.fullName.split(" ")[0] || "";
  const upcoming = await listUpcomingForCustomer(user.email, oregonToday()).catch(() => []);
  return <main className="account-page">
    <DisclosureGate scope="customer" />
    <PasskeyPrompt />
    <header className="account-nav"><Link className="account-brand" href="/"><BrandLogo/></Link><nav><Link href="/cookbook">Cookbook</Link><Link href="/meal-prep#pricing">Pricing</Link><a href={signOutPath("/")}>Sign out</a></nav></header>
    <section className="welcome-panel"><div><p>YOUR DRIFTLINE ACCOUNT</p><h1>{firstName ? `Welcome, ${firstName}.` : "Welcome."}</h1><span>Let&apos;s make home meals feel easier this week.</span></div><div className="account-status"><i>✓</i><span><small>Account ready</small><strong>Your preferences travel with every visit</strong></span></div></section>
    <section className="account-content">
      <div className="onboarding-path"><a href="#household" className={profileDone?"path-complete":"path-current"}><i>{profileDone?"✓":"1"}</i><b>Tell us about your household</b></a><span className={chosenRecipes.length+mealPlan.customRecipes.length>0?"path-complete":"path-current"}><i>{chosenRecipes.length+mealPlan.customRecipes.length>0?"✓":"2"}</i><b>Choose starter dishes</b></span><span><i>3</i><b>Request your first visit</b></span></div>
      <div className="quick-cards"><Link href="/cookbook"><span>01</span><h3>Choose your meals</h3><p>Browse 48 meal prep recipes and pick the dishes your household will love.</p><b>Open cookbook →</b></Link><Link href="/cookbook?add=recipe"><span>02</span><h3>Add your own recipe</h3><p>Share a family favorite or a recipe you already know you love.</p><b>Add a personal recipe →</b></Link><a href="/meal-prep#booking"><span>03</span><h3>Request a visit</h3><p>Once your starter menu feels right, check North Coast availability.</p><b>Check availability →</b></a></div>
      <section className="meal-plan"><div className="meal-plan-heading"><div><span>YOUR STARTER MEAL PLAN</span><h2>Dishes you&apos;d like us to make</h2></div><Link href="/cookbook">+ Choose more dishes</Link></div>{chosenRecipes.length+mealPlan.customRecipes.length===0?<div className="empty-meals"><b>Your menu is ready for a first choice.</b><p>Save a few favorites to give us a feel for your household. Each visit covers 2 to 4 entrées depending on your package, and we rotate the rest into later weeks. Nothing is scheduled or charged yet.</p><Link href="/cookbook">Browse the cookbook →</Link></div>:<div className="chosen-meals">{chosenRecipes.map(recipe=><article key={recipe.id}><DishPhoto src={recipe.image?smallImage(recipe.image):""} alt={recipe.title} label={recipe.category}/><div><small>DRIFTLINE RECIPE</small><h3>{recipe.title}</h3><p>{recipe.category}</p></div></article>)}{mealPlan.customRecipes.map(recipe=><article className="custom-meal" key={`custom-${recipe.id}`}><div className="custom-icon">♥</div><div><small>YOUR OWN RECIPE</small><h3>{recipe.title}</h3><p>{recipe.servings} servings · Saved for chef review</p></div></article>)}</div>}</section>
      {dinnerWishlist.length ? <section className="meal-plan"><div className="meal-plan-heading"><div><span>PRIVATE DINNER WISHLIST</span><h2>Dishes you&apos;d love at a dinner</h2></div><Link href="/cookbook?side=private-chef">+ Browse private chef dishes</Link></div><div className="chosen-meals">{dinnerWishlist.map(recipe=><article key={recipe.id}><DishPhoto src={recipe.image?smallImage(recipe.image):""} alt={recipe.title} label={recipe.category}/><div><small>{recipe.category.toUpperCase()}</small><h3>{recipe.title}</h3><p>Casey will build these into your menu</p></div></article>)}</div></section> : null}
      {upcoming.length ? <section className="upcoming-visits"><span>COMING UP</span><h2>Your next visits</h2><ul>{upcoming.map(v => <li key={v.id}><b>{prettyVisitDate(v.serviceDate).replace(/,.*$/, "")}<br/>{prettyVisitDate(v.serviceDate).replace(/^[^,]*, /, "")}</b><span>{prettyTime(v.startTime)}{v.endTime ? `–${prettyTime(v.endTime)}` : ""} · {v.serviceType === "meal_prep" ? `${v.packageName || "Meal prep"} visit` : v.serviceType === "catering" ? "Catering" : "Private dinner"}</span><small>{v.chefEmail ? `Your chef: ${v.chef.split(" ")[0]}` : "We'll confirm your chef soon"}{v.status === "confirmed" ? " · Confirmed" : ""}</small></li>)}</ul></section> : null}
      <div id="household"><ProfileForm initialProfile={profile} /></div>
      <BillingPanel />
      <VisitGallery />
      {hasVisit ? <ReviewForm defaultName={profile.fullName} defaultTown={profile.city} /> : null}
      <aside className="account-help"><div><span>Need a hand?</span><h2>We&apos;re real people, right here on the coast.</h2><p>Questions about packages, allergies, or whether the service is right for your household? Reach out and we&apos;ll talk it through.</p></div><a href={`mailto:${CONTACT_EMAIL}`}>Email Driftline →</a></aside>
    </section>
  </main>;
}
