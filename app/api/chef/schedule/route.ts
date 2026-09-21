import {NextResponse} from "next/server";
import {requireStaffRole} from "../../../staff-auth";
import {listEvents} from "../../../../db/schedule";
import {getMealPlan} from "../../../../db/meals";
import { getCookbook } from "../../../../db/cookbook";

export const dynamic="force-dynamic";
import {oregonToday} from "../../../oregon-time";
const addDays=(d:string,n:number)=>new Date(new Date(`${d}T12:00:00Z`).getTime()+n*86400000).toISOString().slice(0,10);

export async function GET(){
  const user=await requireStaffRole("chef");
  if(!user)return NextResponse.json({error:"Chef access required"},{status:403});
  const start=oregonToday(),end=addDays(start,90);
  const email=user.email.toLowerCase();
  const recipes=await getCookbook();
  const events=(await listEvents(start,end)).filter(event=>event.chefEmail.toLowerCase()===email&&event.status!=="cancelled");
  const enriched=await Promise.all(events.map(async event=>{
    const plan=event.customerEmail?await getMealPlan(event.customerEmail):{selectedRecipeIds:[],customRecipes:[]};
    const dishes=event.dishes.map(title=>{
      const cookbook=recipes.find(recipe=>recipe.title===title);
      if(cookbook)return{title,source:"Driftline cookbook",image:cookbook.image,ingredients:cookbook.ingredients,allergens:cookbook.allergens};
      const custom=plan.customRecipes.find(recipe=>recipe.title===title);
      if(custom)return{title,source:"Customer recipe",image:"",ingredients:custom.ingredients.split(/\r?\n/).map(item=>item.trim()).filter(Boolean),allergens:[]};
      return{title,source:"Special request",image:"",ingredients:[],allergens:[]};
    });
    return{...event,dishes};
  }));
  return NextResponse.json(enriched);
}
