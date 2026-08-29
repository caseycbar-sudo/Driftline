import "./start.css";
import BrandLogo from "../BrandLogo";
export default function StartPage(){return <main className="start-page">
  <header><a href="/"><BrandLogo/></a><p>ASTORIA · OREGON NORTH COAST</p></header>
  <section className="start-intro"><p>WEATHERED BY THE COAST · MADE FOR THE TABLE</p><h1>How can we make<br/>your table easier?</h1><span>Choose the kind of help you’re looking for.</span></section>
  <section className="start-choices">
    <a className="start-private" href="/private-chef"><div><small>SPECIAL OCCASIONS</small><h2>Private Chef</h2><p>A restaurant-quality dinner in your home or vacation rental—custom menu, shopping, cooking, plated service, and a clean kitchen when we leave.</p><ul><li>Anniversaries & birthdays</li><li>Coastal vacations & elopements</li><li>Intimate gatherings</li></ul><b>Explore private dining <span>→</span></b></div></a>
    <a className="start-prep" href="/#pricing"><div><small>EVERYDAY SUPPORT</small><h2>In-Home Meal Prep</h2><p>A trusted local chef shops, cooks, portions, labels, and cleans up—leaving your refrigerator ready for an easier week.</p><ul><li>6–24 portions per visit</li><li>100 recipes plus family favorites</li><li>Meals ready · kitchen clean</li></ul><b>Explore weekly meal prep <span>→</span></b></div></a>
  </section>
  <footer><p>Serving Astoria, Warrenton, Gearhart, Seaside & Cannon Beach</p><a href="/chef">Chef Login</a></footer>
</main>}
