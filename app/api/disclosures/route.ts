import {NextResponse} from "next/server";
import {getChatGPTUser} from "../../chatgpt-auth";
import {requireStaffRole} from "../../staff-auth";
import {acceptDisclosure,hasAccepted} from "../../../db/disclosures";
import {DISCLOSURE_VERSION} from "../../disclosures/content";
export const dynamic="force-dynamic";
async function identity(scope:string){if(scope==="chef"){const user=await requireStaffRole("chef");return user?user.email:null}const user=await getChatGPTUser();return user?.email??null}
export async function GET(request:Request){const scope=new URL(request.url).searchParams.get("scope")==="chef"?"chef":"customer",email=await identity(scope);if(!email)return NextResponse.json({error:"Sign in required"},{status:403});return NextResponse.json({accepted:await hasAccepted(email,scope,DISCLOSURE_VERSION),scope,version:DISCLOSURE_VERSION})}
export async function POST(request:Request){const body=await request.json() as Record<string,unknown>,scope=body.scope==="chef"?"chef":"customer",email=await identity(scope);if(!email)return NextResponse.json({error:"Sign in required"},{status:403});if(body.version!==DISCLOSURE_VERSION||body.agreed!==true)return NextResponse.json({error:"Current terms must be accepted"},{status:400});return NextResponse.json(await acceptDisclosure(email,scope,DISCLOSURE_VERSION))}
