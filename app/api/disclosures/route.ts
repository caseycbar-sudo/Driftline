import {NextResponse} from "next/server";
import {getUser} from "../../auth";
import {requireStaffRole} from "../../staff-auth";
import {isCrossSiteRequest} from "../../auth-core";
import {acceptDisclosure,hasAccepted} from "../../../db/disclosures";
import {DISCLOSURE_VERSION} from "../../disclosures/content";
export const dynamic="force-dynamic";
async function identity(scope:string){if(scope==="chef"){const user=await requireStaffRole("chef");return user?user.email:null}const user=await getUser();return user?.email??null}
export async function GET(request:Request){const scope=new URL(request.url).searchParams.get("scope")==="chef"?"chef":"customer",email=await identity(scope);if(!email)return NextResponse.json({error:"Sign in required"},{status:403});return NextResponse.json({accepted:await hasAccepted(email,scope,DISCLOSURE_VERSION),scope,version:DISCLOSURE_VERSION})}
export async function POST(request:Request){const body=(await request.json().catch(()=>null) ?? {}) as Record<string,unknown>;if(isCrossSiteRequest(request))return NextResponse.json({error:"Forbidden"},{status:403});const scope=body.scope==="chef"?"chef":"customer",email=await identity(scope);if(!email)return NextResponse.json({error:"Sign in required"},{status:403});if(body.version!==DISCLOSURE_VERSION||body.agreed!==true)return NextResponse.json({error:"Current terms must be accepted"},{status:400});return NextResponse.json(await acceptDisclosure(email,scope,DISCLOSURE_VERSION))}
