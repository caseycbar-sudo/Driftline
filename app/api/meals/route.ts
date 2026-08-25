import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";
import { addCustomRecipe, addSelectedMeal, getMealPlan, removeCustomRecipe, removeSelectedMeal } from "../../../db/meals";

export const dynamic = "force-dynamic";

export async function GET(){ const user=await getChatGPTUser(); if(!user)return NextResponse.json({signedIn:false,selectedRecipeIds:[],customRecipes:[]}); return NextResponse.json({signedIn:true,...await getMealPlan(user.email)}); }
export async function POST(request:Request){
  const user=await getChatGPTUser(); if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
  const body=await request.json() as Record<string,unknown>;
  if(body.type==="selection"){ const recipeId=Math.max(1,Math.min(100,Number(body.recipeId)||0)); if(!recipeId)return NextResponse.json({error:"Invalid recipe"},{status:400}); await addSelectedMeal(user.email,recipeId); return NextResponse.json({ok:true}); }
  const clean=(key:string,limit=6000)=>String(body[key]??"").trim().slice(0,limit);
  const title=clean("title",120), ingredients=clean("ingredients"), directions=clean("directions");
  if(!title||!ingredients||!directions)return NextResponse.json({error:"Title, ingredients, and directions are required"},{status:400});
  const recipe=await addCustomRecipe(user.email,{title,servings:Math.max(1,Math.min(50,Number(body.servings)||4)),ingredients,directions,notes:clean("notes",1000),sourceUrl:clean("sourceUrl",500)});
  return NextResponse.json(recipe,{status:201});
}
export async function DELETE(request:Request){
  const user=await getChatGPTUser(); if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
  const url=new URL(request.url), type=url.searchParams.get("type"), id=Number(url.searchParams.get("id"));
  if(type==="custom")await removeCustomRecipe(user.email,id); else await removeSelectedMeal(user.email,id);
  return NextResponse.json({ok:true});
}
