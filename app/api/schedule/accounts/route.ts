import {NextResponse} from "next/server";
import {requireStaffRole} from "../../../staff-auth";
import {listCustomers} from "../../../../db/customers";

export const dynamic="force-dynamic";
export async function GET(){
  if(!await requireStaffRole("admin"))return NextResponse.json({error:"Admin access required"},{status:403});
  return NextResponse.json(await listCustomers());
}
