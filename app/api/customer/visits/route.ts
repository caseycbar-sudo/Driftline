import {NextResponse} from "next/server";
import {getChatGPTUser} from "../../../chatgpt-auth";
import {listCustomerVisits} from "../../../../db/visits";
export const dynamic="force-dynamic";
export async function GET(){const user=await getChatGPTUser();if(!user)return NextResponse.json({error:"Sign in required"},{status:401});return NextResponse.json(await listCustomerVisits(user.email))}
