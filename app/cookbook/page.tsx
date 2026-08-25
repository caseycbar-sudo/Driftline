"use client";

import { useMemo, useState } from "react";
import { recipes, type Recipe } from "./recipes";
import "./cookbook.css";

const categories=["All","Poultry","Beef, Pork & Lamb","Seafood","Vegetarian"];

export default function Cookbook(){
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [selected,setSelected]=useState<Recipe>(recipes[0]);
  const [portions,setPortions]=useState(12);
  const [saved,setSaved]=useState<number[]>([]);
  const filtered=useMemo(()=>recipes.filter(r=>(category==="All"||r.category===category)&&(`${r.title} ${r.main} ${r.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))),[query,category]);
  const factor=portions/12;
  const scale=(line:string)=>line.replace(/^(\d+(?:\.\d+)?|½|¼|¾|1½|1¾)/,m=>{
    const map:Record<string,number>={"½":.5,"¼":.25,"¾":.75,"1½":1.5,"1¾":1.75};
    const n=(map[m]??Number(m))*factor;
    return Number.isInteger(n)?String(n):n.toFixed(1);
  });
  return <main className="cookbook">
    <header className="book-top"><a href="/portal">← Portal</a><div><span>D</span><strong>DRIFTLINE COOKBOOK</strong><small>100 standardized meal-prep recipes</small></div><button onClick={()=>window.print()}>Print recipe</button></header>
    <section className="book-hero"><div><p>CHEF RECIPE LIBRARY</p><h1>Built for real<br/>meal-prep days.</h1><span>Complete recipes, approved scales, safety notes, storage, reheating, and production pairings.</span></div><aside><strong>100</strong><span>full recipes</span><strong>4</strong><span>production categories</span><strong>6–24</strong><span>approved portion range</span></aside></section>
    <section className="book-tools"><label><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by dish, ingredient, or tag…"/></label><div>{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><b>{filtered.length} recipes</b></section>
    <div className="book-layout">
      <section className="recipe-gallery">{filtered.map(r=><article key={r.id} className={selected.id===r.id?"active":""} onClick={()=>{setSelected(r);setPortions(12)}}><button className={saved.includes(r.id)?"save on":"save"} aria-label={saved.includes(r.id)?"Remove favorite":"Save favorite"} onClick={e=>{e.stopPropagation();setSaved(v=>v.includes(r.id)?v.filter(x=>x!==r.id):[...v,r.id])}}>♥</button><img src={r.image} alt={r.title}/><div><small>{r.category} · #{String(r.id).padStart(3,"0")}</small><h2>{r.title}</h2><p>{r.active} min active · {r.total} min total</p><span>{r.tags.slice(0,2).map(t=><i key={t}>{t}</i>)}</span></div></article>)}</section>
      <aside className="recipe-detail">
        <div className="detail-photo"><img src={selected.image} alt={selected.title}/><span>DRIFTLINE APPROVED</span></div>
        <div className="detail-title"><small>{selected.category} · RECIPE #{String(selected.id).padStart(3,"0")}</small><h2>{selected.title}</h2><p>{selected.main} · {selected.starch} · {selected.vegetables}</p></div>
        <div className="detail-meta"><span><small>ACTIVE</small><b>{selected.active} min</b></span><span><small>TOTAL</small><b>{selected.total} min</b></span><span><small>ALLERGENS</small><b>{selected.allergens.length?selected.allergens.join(", "):"None listed"}</b></span></div>
        <div className="portion-tool"><div><small>PORTION CALCULATOR</small><strong>Scale the full recipe</strong></div><button onClick={()=>setPortions(Math.max(6,portions-2))}>−</button><b>{portions}</b><button onClick={()=>setPortions(Math.min(24,portions+2))}>+</button><span>{factor.toFixed(2)}× batch</span></div>
        <section className="book-section ingredients"><h3>Ingredients</h3>{selected.ingredients.map((x,i)=><p key={i}><span>□</span>{scale(x)}</p>)}</section>
        <section className="book-section"><h3>Method</h3><ol>{selected.directions.map((x,i)=><li key={i}><b>{i+1}</b><span>{x}</span></li>)}</ol></section>
        <div className="production-grid"><section><h3>Equipment</h3><ul>{selected.equipment.map(x=><li key={x}>{x}</li>)}</ul></section><section><h3>Pairs efficiently with</h3><ul>{selected.pairings.map(x=><li key={x}>{x}</li>)}</ul></section></div>
        <section className="safety-notes"><div><b>FOOD SAFETY</b><p>{selected.safety}</p></div><div><b>STORAGE</b><p>{selected.storage}</p></div><div><b>REHEATING</b><p>{selected.reheating}</p></div></section>
        <div className="recipe-actions"><button onClick={()=>setSaved(v=>v.includes(selected.id)?v:[...v,selected.id])}>{saved.includes(selected.id)?"Saved to favorites ✓":"Save to favorites"}</button><button onClick={()=>window.print()}>Print production card</button></div>
        <footer><p>Standard recipe format developed for Driftline At Home. Verify household allergy notes before every visit.</p><p>Safety guidance follows USDA/FDA recommendations for cooling, storage, and reheating.</p></footer>
      </aside>
    </div>
  </main>
}
