import CookbookClient from "./CookbookClient";
import { getCookbook } from "../../db/cookbook";

// Casey can edit dishes from the dashboard, so the cookbook is built per request.
export const dynamic = "force-dynamic";

export default async function CookbookPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const one = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]) ?? "";
  return (
    <CookbookClient
      recipes={await getCookbook()}
      initialRecipeId={Number(one("recipe")) || 0}
      initialSide={one("side") === "private-chef" ? "private-chef" : "meal-prep"}
      startAddingRecipe={one("add") === "recipe"}
    />
  );
}
