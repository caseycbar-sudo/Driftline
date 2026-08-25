import { env } from "cloudflare:workers";

export type ScheduleEvent={id:number;serviceDate:string;startTime:string;endTime:string;household:string;chef:string;packageName:string;location:string;status:string;notes:string;createdAt:string;updatedAt:string};
const createSql=`CREATE TABLE IF NOT EXISTS schedule_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL DEFAULT '',
  household TEXT NOT NULL,
  chef TEXT NOT NULL DEFAULT 'Unassigned',
  package_name TEXT NOT NULL DEFAULT 'Weekly',
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;
function database(){if(!env.DB)throw new Error("Schedule database unavailable");return env.DB}
async function ensure(){await database().prepare(createSql).run()}
export async function listEvents(start:string,end:string){await ensure();const result=await database().prepare("SELECT * FROM schedule_events WHERE service_date >= ? AND service_date <= ? ORDER BY service_date, start_time").bind(start,end).all<Record<string,unknown>>();return result.results.map(map)}
export async function createEvent(createdBy:string,event:Omit<ScheduleEvent,"id"|"createdAt"|"updatedAt">){await ensure();const now=new Date().toISOString();const result=await database().prepare("INSERT INTO schedule_events (service_date,start_time,end_time,household,chef,package_name,location,status,notes,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(event.serviceDate,event.startTime,event.endTime,event.household,event.chef,event.packageName,event.location,event.status,event.notes,createdBy,now,now).run();return{id:Number(result.meta.last_row_id),...event,createdAt:now,updatedAt:now}}
export async function updateEvent(id:number,event:Omit<ScheduleEvent,"id"|"createdAt"|"updatedAt">){await ensure();const now=new Date().toISOString();await database().prepare("UPDATE schedule_events SET service_date=?,start_time=?,end_time=?,household=?,chef=?,package_name=?,location=?,status=?,notes=?,updated_at=? WHERE id=?").bind(event.serviceDate,event.startTime,event.endTime,event.household,event.chef,event.packageName,event.location,event.status,event.notes,now,id).run();return{id,...event,createdAt:"",updatedAt:now}}
export async function deleteEvent(id:number){await ensure();await database().prepare("DELETE FROM schedule_events WHERE id=?").bind(id).run()}
function map(row:Record<string,unknown>):ScheduleEvent{return{id:Number(row.id),serviceDate:String(row.service_date),startTime:String(row.start_time),endTime:String(row.end_time),household:String(row.household),chef:String(row.chef),packageName:String(row.package_name),location:String(row.location),status:String(row.status),notes:String(row.notes),createdAt:String(row.created_at),updatedAt:String(row.updated_at)}}
