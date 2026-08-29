import { desc, eq } from "drizzle-orm";
import { getDb } from "./index";
import { privateChefInquiries } from "./schema";
export type NewInquiry = typeof privateChefInquiries.$inferInsert;
export async function createPrivateChefInquiry(data: Omit<NewInquiry,"id"|"status"|"adminNotes"|"createdAt"|"updatedAt">){const now=new Date().toISOString();return(await getDb().insert(privateChefInquiries).values({...data,status:"new",adminNotes:"",createdAt:now,updatedAt:now}).returning())[0]}
export async function listPrivateChefInquiries(){return getDb().select().from(privateChefInquiries).orderBy(desc(privateChefInquiries.createdAt))}
export async function updatePrivateChefInquiry(id:number,status:string,adminNotes:string){return(await getDb().update(privateChefInquiries).set({status,adminNotes,updatedAt:new Date().toISOString()}).where(eq(privateChefInquiries.id,id)).returning())[0]}
