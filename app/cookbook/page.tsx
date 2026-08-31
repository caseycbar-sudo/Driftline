"use client";

import { useEffect, useMemo, useState } from "react";
import { recipes, type Recipe } from "./recipes";
import { scaleIngredients } from "../portal/grocery-list";
import "./cookbook.css";
import BrandLogo from "../BrandLogo";

const categories=["All","Poultry","Beef, Pork & Lamb","Seafood","Vegetarian"];

export default function Cookbook(){
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [selected,setSelected]=useState<Recipe>(recipes[0]);
  const [portions,setPortions]=useState(12);
  const [saved,setSaved]=useState<number[]>([]);
  const [signedIn,setSignedIn]=useState(false);
  const [showOwnRecipe,setShowOwnRecipe]=useState(false);
  const [notice,setNotice]=useState("");
  const [customCount,setCustomCount]=useState(0);
  const [detailOpen,setDetailOpen]=useState(false);
  useEffect(()=>{const params=new URLSearchParams(window.location.search);if(params.get("add")==="recipe")setShowOwnRecipe(true);const requested=Number(params.get("recipe"));const requestedRecipe=recipes.find(recipe=>recipe.id===requested);if(requestedRecipe){setSelected(requestedRecipe);if(window.matchMedia("(max-width: 1050px)").matches)setDetailOpen(true)}fetch("/api/meals").then(r=>r.json()).then(data=>{setSignedIn(Boolean(data.signedIn));setSaved(data.selectedRecipeIds??[]);setCustomCount(data.customRecipes?.length??0)}).catch(()=>setNotice("We couldn't load your saved meals."))},[]);
  useEffect(()=>{if(!detailOpen)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setDetailOpen(false)};document.body.style.overflow="hidden";window.addEventListener("keydown",close);return()=>{document.body.style.overflow="";window.removeEventListener("keydown",close)}},[detailOpen]);
  const filtered=useMemo(()=>recipes.filter(r=>(category==="All"||r.category===category)&&(`${r.title} ${r.main} ${r.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))),[query,category]);
  const factor=portions/12;
  const scaledIngredients=useMemo(()=>scaleIngredients(selected.ingredients,12,portions),[selected,portions]);
  async function toggleMeal(recipeId:number){
    if(!signedIn){window.location.href="/signin-with-chatgpt?return_to=%2Fcookbook";return}
    const removing=saved.includes(recipeId); setSaved(current=>removing?current.filter(id=>id!==recipeId):[...current,recipeId]);
    const response=await fetch(removing?`/api/meals?type=selection&id=${recipeId}`:"/api/meals",removing?{method:"DELETE"}:{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({type:"selection",recipeId})});
    if(!response.ok){setSaved(current=>removing?[...current,recipeId]:current.filter(id=>id!==recipeId));setNotice("That didn't save. Please try again.")}else{setNotice(removing?"Dish removed from your starter meals.":"Dish added to your starter meals ✓");window.setTimeout(()=>setNotice(""),2400)}
  }
  async function submitOwnRecipe(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault(); if(!signedIn){window.location.href="/signin-with-chatgpt?return_to=%2Fcookbook";return}
    const form=new FormData(event.currentTarget); const body=Object.fromEntries(form.entries());
    const response=await fetch("/api/meals",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    if(response.ok){setCustomCount(count=>count+1);setShowOwnRecipe(false);setNotice("Your recipe was added to your Driftline meal plan ✓");window.setTimeout(()=>setNotice(""),3000)}else setNotice("Please complete the recipe title, ingredients, and directions.");
  }
  return <main className="cookbook">
    <header className="book-top"><a href="/account">← My account</a><div><BrandLogo/><small>COOKBOOK · CHOOSE DISHES FOR YOUR HOUSEHOLD</small></div><a className="book-account" href="/account">My meal plan</a></header>
    <section className="book-hero"><div><p>BUILD YOUR STARTER MENU</p><h1>What sounds good<br/>for your table?</h1><span>Choose a few Driftline dishes to help your chef learn what your household enjoys—or add a treasured recipe of your own.</span><div className="hero-choice"><strong>{saved.length+customCount}</strong><span>meals chosen</span><button onClick={()=>setShowOwnRecipe(true)}>+ Add my own recipe</button></div></div><aside><strong>100</strong><span>complete recipes</span><strong>4</strong><span>easy categories</span><strong>6–24</strong><span>portion range</span></aside></section>
    <section className="book-tools"><label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by dish, ingredient, or tag…"/></label><div>{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><b>{filtered.length} recipes</b></section>
    <div className="book-layout">
      <section className="recipe-gallery">{filtered.map((r,index)=><article key={r.id} className={selected.id===r.id?"active":""} role="button" tabIndex={0} aria-label={`Open full recipe for ${r.title}`} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected(r);setPortions(12);setDetailOpen(true)}}} onClick={()=>{setSelected(r);setPortions(12);setDetailOpen(true)}}><button className={saved.includes(r.id)?"save on":"save"} aria-label={saved.includes(r.id)?"Remove from my meals":"Choose this dish"} onClick={e=>{e.stopPropagation();toggleMeal(r.id)}}>{saved.includes(r.id)?"✓":"+"}</button><img src={r.image} alt={r.title} loading={index<4?"eager":"lazy"} decoding="async"/><div><small>{r.category} · #{String(r.id).padStart(3,"0")}</small><h2>{r.title}</h2><p>{r.active} min active · {r.total} min total</p><span>{r.tags.slice(0,2).map(t=><i key={t}>{t}</i>)}</span><b className="open-recipe">View full recipe →</b></div></article>)}</section>
      <aside className={`recipe-detail${detailOpen?" open":""}`} role={detailOpen?"dialog":undefined} aria-modal={detailOpen?"true":undefined} aria-label={detailOpen?`${selected.title} recipe details`:undefined}>
        <button className="detail-close" type="button" onClick={()=>setDetailOpen(false)} aria-label="Close recipe details">×</button>
        <div className="detail-photo"><img src={selected.image} alt={selected.title} decoding="async"/><span>DRIFTLINE APPROVED</span></div>
        <div className="detail-title"><small>{selected.category} · RECIPE #{String(selected.id).padStart(3,"0")}</small><h2>{selected.title}</h2><p>{selected.main} · {selected.starch} · {selected.vegetables}</p></div>
        <div className="detail-meta"><span><small>ACTIVE</small><b>{selected.active} min</b></span><span><small>TOTAL</small><b>{selected.total} min</b></span><span><small>ALLERGENS</small><b>{selected.allergens.length?selected.allergens.join(", "):"None listed"}</b></span></div>
        <div className="portion-tool"><div><small>PORTION CALCULATOR</small><strong>Scale the full recipe</strong></div><button onClick={()=>setPortions(Math.max(6,portions-2))}>−</button><b>{portions}</b><button onClick={()=>setPortions(Math.min(24,portions+2))}>+</button><span>{factor.toFixed(2)}× batch</span></div>
        <section className="book-section ingredients"><h3>Ingredients</h3>{scaledIngredients.map((x,i)=><p key={i}><span>□</span>{x}</p>)}</section>
        <section className="book-section"><h3>Method</h3><ol>{selected.directions.map((x,i)=><li key={i}><b>{i+1}</b><span>{x}</span></li>)}</ol></section>
        <div className="production-grid"><section><h3>Equipment</h3><ul>{selected.equipment.map(x=><li key={x}>{x}</li>)}</ul></section><section><h3>Pairs efficiently with</h3><ul>{selected.pairings.map(x=><li key={x}>{x}</li>)}</ul></section></div>
        <section className="safety-notes"><div><b>FOOD SAFETY</b><p>{selected.safety}</p></div><div><b>STORAGE</b><p>{selected.storage}</p></div><div><b>REHEATING</b><p>{selected.reheating}</p></div></section>
        <div className="recipe-actions"><button onClick={()=>toggleMeal(selected.id)}>{saved.includes(selected.id)?"Chosen for my meals ✓":"Choose this dish"}</button><button onClick={()=>window.print()}>Print recipe</button></div>
        <footer><p>Standard recipe format developed for Driftline At Home. Verify household allergy notes before every visit.</p><p>Safety guidance follows USDA/FDA recommendations for cooling, storage, and reheating.</p></footer>
      </aside>
    </div>
    {notice?<div className="book-notice" role="status">{notice}</div>:null}
    {showOwnRecipe?<div className="recipe-modal" role="dialog" aria-modal="true" aria-labelledby="own-recipe-title"><form onSubmit={submitOwnRecipe}><button className="modal-close" type="button" onClick={()=>setShowOwnRecipe(false)} aria-label="Close">×</button><p>YOUR FAMILY RECIPE</p><h2 id="own-recipe-title">What would you like us to make?</h2><span>Enter the full recipe below. Your chef will review it with your household notes before scheduling.</span><label>Recipe name<input name="title" required placeholder="Grandma's chicken and dumplings"/></label><div className="own-row"><label>Servings<input name="servings" type="number" min="1" max="50" defaultValue="4"/></label><label>Recipe link, if available<input name="sourceUrl" type="url" placeholder="https://…"/></label></div><label>Ingredients<textarea name="ingredients" required placeholder={'List each ingredient and amount on its own line\n2 cups flour\n1 tsp salt…'}/></label><label>Directions<textarea name="directions" required placeholder={'Write each step in order\n1. Preheat the oven…'}/></label><label>Notes for your chef<textarea name="notes" placeholder="Family traditions, preferred brands, substitutions, or anything that makes it taste right."/></label><button className="submit-recipe">Add recipe to my meal plan <span>→</span></button><small>{signedIn?"This recipe will be saved privately to your account.":"You'll be asked to sign in before this recipe is saved."}</small></form></div>:null}
  </main>
}
