import { requireChatGPTUser } from "../chatgpt-auth";
import PortalClient from "./PortalClient";
import {resolveStaff} from "../../db/staff";
import {redirect} from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const user=await requireChatGPTUser("/portal");
  const staff=await resolveStaff(user.email,user.displayName);
  if(!staff)return <main className="access-denied"><section><small>DRIFTLINE AT HOME</small><h1>Staff access pending</h1><p>This signed-in account has not been approved for the Driftline staff portal, or its access is currently suspended.</p><a href="/account">Return to customer account</a></section></main>;
  if(staff.role==="chef")redirect("/chef/workspace");
  return <PortalClient staff={{email:staff.email,fullName:staff.fullName,role:staff.role}} />;
}
