import { requireChatGPTUser } from "../chatgpt-auth";
import PortalClient from "./PortalClient";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  await requireChatGPTUser("/portal");
  return <PortalClient />;
}
