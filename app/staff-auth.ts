import {getChatGPTUser} from "./chatgpt-auth";
import {resolveStaff,type StaffRole} from "../db/staff";
export async function getStaffUser(){const user=await getChatGPTUser();if(!user)return null;const staff=await resolveStaff(user.email,user.displayName);return staff?{...user,staff}:null}
export async function requireStaffRole(role?:StaffRole){const user=await getStaffUser();if(!user)return null;if(role&&user.staff.role!==role)return null;return user}
