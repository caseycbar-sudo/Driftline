import {NextResponse} from "next/server";
import {requireStaffRole} from "../../../staff-auth";
import {getMealPlan} from "../../../../db/meals";
import {recipes} from "../../../cookbook/recipes";

export const dynamic="force-dynamic";
export async function GET(request:Request){
  if(!await requireStaffRole("admin"))return NextResponse.json({error:"Admin access required"},{status:403});
  const email=new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
  if(!email)return NextResponse.json({error:"Customer email is required"},{status:400});
  const plan=await getMealPlan(email);
  const cookbook=plan.selectedRecipeIds.map(id=>recipes.find(recipe=>recipe.id===id)).filter(Boolean).map(recipe=>({key:`recipe-${recipe!.id}`,title:recipe!.title,type:"Cookbook"}));
  const custom=plan.customRecipes.map(recipe=>({key:`custom-${recipe.id}`,title:recipe.title,type:"Customer recipe"}));
  return NextResponse.json({email,dishes:[...cookbook,...custom]});
}
