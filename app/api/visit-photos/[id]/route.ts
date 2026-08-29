import {NextResponse} from "next/server";
import {env} from "cloudflare:workers";
import {getChatGPTUser} from "../../../chatgpt-auth";
import {getStaff} from "../../../../db/staff";
import {getVisitPhoto} from "../../../../db/visits";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const user=await getChatGPTUser();if(!user)return NextResponse.json({error:"Sign in required"},{status:401});const photo=await getVisitPhoto(Number((await params).id));if(!photo)return NextResponse.json({error:"Photo not found"},{status:404});const staff=await getStaff(user.email),authorized=user.email.toLowerCase()===photo.customerEmail.toLowerCase()||Boolean(staff&&staff.status==="active");if(!authorized)return NextResponse.json({error:"Not authorized"},{status:403});const object=await (env as unknown as {BUCKET:R2Bucket}).BUCKET.get(photo.objectKey);if(!object)return NextResponse.json({error:"Photo not found"},{status:404});return new Response(object.body,{headers:{"content-type":photo.contentType,"cache-control":"private, max-age=300","x-content-type-options":"nosniff"}})}
