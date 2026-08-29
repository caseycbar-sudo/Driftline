import {requireChatGPTUser} from "../../chatgpt-auth";
import {getStaff} from "../../../db/staff";
import PortalClient from "../../portal/PortalClient";
import {redirect} from "next/navigation";

export const dynamic="force-dynamic";
export default async function ChefWorkspace(){
  const user=await requireChatGPTUser("/chef/workspace");
  const staff=await getStaff(user.email);
  if(staff?.status==="active"&&staff.role==="admin")redirect("/portal");
  if(!staff||staff.status!=="active"||staff.role!=="chef")redirect("/chef");
  return <PortalClient staff={{email:staff.email,fullName:staff.fullName,role:"chef"}}/>;
}
