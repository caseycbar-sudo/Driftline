import { env } from "cloudflare:workers";

export type ScheduleEvent={id:number;serviceDate:string;startTime:string;endTime:string;household:string;customerEmail:string;dishes:string[];chef:string;chefEmail:string;packageName:string;location:string;status:string;chefPayCents:number;notes:string;createdAt:string;updatedAt:string};
const createSql=`CREATE TABLE IF NOT EXISTS schedule_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL DEFAULT '',
  household TEXT NOT NULL,
  customer_email TEXT NOT NULL DEFAULT '',
  dishes TEXT NOT NULL DEFAULT '[]',
  chef TEXT NOT NULL DEFAULT 'Unassigned',
  chef_email TEXT NOT NULL DEFAULT '',
  package_name TEXT NOT NULL DEFAULT 'Weekly',
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled',
  chef_pay_cents INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;
function database(){if(!env.DB)throw new Error("Schedule database unavailable");return env.DB}
async function ensure(){await database().prepare(createSql).run()}
export async function listEvents(start:string,end:string){await ensure();const result=await database().prepare("SELECT * FROM schedule_events WHERE service_date >= ? AND service_date <= ? ORDER BY service_date, start_time").bind(start,end).all<Record<string,unknown>>();return result.results.map(map)}
export async function createEvent(createdBy:string,event:Omit<ScheduleEvent,"id"|"createdAt"|"updatedAt">){await ensure();const now=new Date().toISOString(),normalized={...event,customerEmail:event.customerEmail.trim().toLowerCase(),chefEmail:event.chefEmail.trim().toLowerCase()};const result=await database().prepare("INSERT INTO schedule_events (service_date,start_time,end_time,household,customer_email,dishes,chef,chef_email,package_name,location,status,chef_pay_cents,notes,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(normalized.serviceDate,normalized.startTime,normalized.endTime,normalized.household,normalized.customerEmail,JSON.stringify(normalized.dishes),normalized.chef,normalized.chefEmail,normalized.packageName,normalized.location,normalized.status,normalized.chefPayCents,normalized.notes,createdBy.toLowerCase(),now,now).run();return{id:Number(result.meta.last_row_id),...normalized,createdAt:now,updatedAt:now}}
export async function updateEvent(id:number,event:Omit<ScheduleEvent,"id"|"createdAt"|"updatedAt">){await ensure();const now=new Date().toISOString(),normalized={...event,customerEmail:event.customerEmail.trim().toLowerCase(),chefEmail:event.chefEmail.trim().toLowerCase()};await database().prepare("UPDATE schedule_events SET service_date=?,start_time=?,end_time=?,household=?,customer_email=?,dishes=?,chef=?,chef_email=?,package_name=?,location=?,status=?,chef_pay_cents=?,notes=?,updated_at=? WHERE id=?").bind(normalized.serviceDate,normalized.startTime,normalized.endTime,normalized.household,normalized.customerEmail,JSON.stringify(normalized.dishes),normalized.chef,normalized.chefEmail,normalized.packageName,normalized.location,normalized.status,normalized.chefPayCents,normalized.notes,now,id).run();return{id,...normalized,createdAt:"",updatedAt:now}}
export async function deleteEvent(id:number){await ensure();await database().prepare("DELETE FROM schedule_events WHERE id=?").bind(id).run()}
export async function getEvent(id:number){await ensure();const row=await database().prepare("SELECT * FROM schedule_events WHERE id=?").bind(id).first<Record<string,unknown>>();return row?map(row):null}
export async function setChefEventStatus(id:number,chefEmail:string,status:string){await ensure();const now=new Date().toISOString(),email=chefEmail.toLowerCase();await database().prepare("UPDATE schedule_events SET status=?,updated_at=? WHERE id=? AND lower(chef_email)=?").bind(status,now,id,email).run();if(status==="completed")await database().prepare("UPDATE chef_time_entries SET ended_at=?,updated_at=? WHERE schedule_event_id=? AND lower(chef_email)=? AND activity_type='job' AND ended_at=''").bind(now,now,id,email).run()}
function map(row:Record<string,unknown>):ScheduleEvent{let dishes:string[]=[];try{dishes=JSON.parse(String(row.dishes||"[]")) as string[]}catch{}return{id:Number(row.id),serviceDate:String(row.service_date),startTime:String(row.start_time),endTime:String(row.end_time),household:String(row.household),customerEmail:String(row.customer_email||""),dishes,chef:String(row.chef),chefEmail:String(row.chef_email||""),packageName:String(row.package_name),location:String(row.location),status:String(row.status),chefPayCents:Number(row.chef_pay_cents||0),notes:String(row.notes),createdAt:String(row.created_at),updatedAt:String(row.updated_at)}}
