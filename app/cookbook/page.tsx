import CookbookClient from "./CookbookClient";
import { getCookbook } from "../../db/cookbook";

// Casey can edit dishes from the dashboard, so the cookbook is built per request.
export const dynamic = "force-dynamic";

export default async function CookbookPage() {
  return <CookbookClient recipes={await getCookbook()} />;
}
