import {NextResponse} from "next/server";
import {requireStaffRole} from "../../../staff-auth";
import {getStaff} from "../../../../db/staff";
import {listEvents} from "../../../../db/schedule";
import {listTimeEntries} from "../../../../db/timecards";

export const dynamic="force-dynamic";

export async function GET(request:Request){
  if(!await requireStaffRole("admin"))return NextResponse.json({error:"Admin access required"},{status:403});
  const email=new URL(request.url).searchParams.get("email")?.trim().toLowerCase()||"";
  const staff=await getStaff(email);
  if(!staff)return NextResponse.json({error:"Staff account not found"},{status:404});
  const [allEvents,entries]=await Promise.all([listEvents("2000-01-01","2100-12-31"),listTimeEntries(email,"2000-01-01T00:00:00.000Z","2100-01-01T00:00:00.000Z")]);
  const events=allEvents.filter(event=>event.chefEmail.toLowerCase()===email);
  const totalMinutes=entries.reduce((sum,entry)=>{if(entry.activityType==="mileage"||!entry.endedAt)return sum;const duration=(Date.parse(entry.endedAt)-Date.parse(entry.startedAt))/60000;return sum+(Number.isFinite(duration)&&duration>0?duration:0)},0);
  const mileage=entries.reduce((sum,entry)=>sum+entry.mileageHundredths/100,0);
  const completed=events.filter(event=>event.status==="completed");
  const upcoming=events.filter(event=>!["completed","cancelled"].includes(event.status));
  return NextResponse.json({staff,events:[...events].sort((a,b)=>b.serviceDate.localeCompare(a.serviceDate)||b.startTime.localeCompare(a.startTime)),entries,summary:{assignedJobs:events.length,completedJobs:completed.length,upcomingJobs:upcoming.length,totalHours:Number((totalMinutes/60).toFixed(2)),mileage:Number(mileage.toFixed(2)),earningsCents:events.reduce((sum,event)=>sum+event.chefPayCents,0)}});
}
