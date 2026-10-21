import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "../auth";
import { googleConfig } from "../auth-session";
import { getPricing } from "../../db/pricing";
import StartFlow from "./StartFlow";
import "../home.css";
import "./start.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Get started · Driftline Provisions",
  description: "Tell us about your household and see your weekly meal prep plan in under a minute.",
};

export default async function StartPage() {
  if (await getUser()) redirect("/account/plan");
  const pricing = await getPricing();
  return (
    <StartFlow
      packages={pricing.mealPrep}
      pantryKit={pricing.pantryKitCents}
      googleEnabled={Boolean(googleConfig())}
    />
  );
}
