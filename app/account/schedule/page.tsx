import { redirect } from "next/navigation";
import { requireUser } from "../../auth";
import { getOrCreateCustomer } from "../../../db/customers";
import { getCookbook } from "../../../db/cookbook";
import { getPricing } from "../../../db/pricing";
import { getRequest } from "../../../db/requests";
import { DEFAULT_PEOPLE, earliestDate, latestDate, planFor, profileGaps } from "../../request-core";
import ScheduleForm from "./ScheduleForm";
import { backdropImages } from "../backdrop-images";
import "../account.css";
import "../plan/plan.css";

export const dynamic = "force-dynamic";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const user = await requireUser("/account/schedule");
  const [profile, pricing, cookbook] = await Promise.all([getOrCreateCustomer(user.email, user.displayName), getPricing(), getCookbook()]);
  const ids = (params.items ?? "").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
  const dishes = ids.map((id) => cookbook.find((r) => r.id === id && r.side === "meal-prep")).filter((r): r is NonNullable<typeof r> => Boolean(r));
  const people = Number(params.people) || DEFAULT_PEOPLE;
  const plan = planFor(dishes.length, people, pricing);
  if (!plan) redirect(`/account/plan${params.edit ? `?edit=${params.edit}` : ""}`);

  let editId = 0;
  let initial: { windows: { date: string; from: string; to: string }[]; address: string; kitchenNotes: string; accessNotes: string } | null = null;
  const edit = Number(params.edit) || 0;
  if (edit) {
    const existing = await getRequest(edit);
    if (existing && existing.customerEmail === user.email.toLowerCase()) {
      editId = existing.id;
      initial = { windows: existing.windows, address: existing.address === profile.streetAddress ? "" : existing.address, kitchenNotes: existing.kitchenNotes, accessNotes: existing.accessNotes };
    }
  }

  return (
    <ScheduleForm
      recipeIds={dishes.map((d) => d.id)}
      dishes={dishes.map((d) => d.title)}
      people={people}
      planName={plan.package.name}
      priceCents={plan.package.priceCents}
      editId={editId}
      initial={initial}
      profile={{ address: profile.streetAddress, city: profile.city, accessNotes: profile.accessNotes, kitchenNotes: profile.kitchenNotes, gaps: profileGaps(profile) }}
      backdrop={backdropImages(cookbook)}
      earliest={earliestDate()}
      latest={latestDate()}
    />
  );
}
