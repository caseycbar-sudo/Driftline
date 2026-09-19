import "./private-chef.css";
import InquiryForm from "./InquiryForm";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import "../home.css";
import type { Metadata } from "next";
import { pageMetadata, smallImage } from "../site-config";
import ReviewsShowcase from "../ReviewsShowcase";

export const metadata: Metadata = pageMetadata(
  "/private-chef",
  "Private Chef Dinners · Driftline Provisions · Astoria, Oregon",
  "A restaurant-caliber dinner in your home or vacation rental on Oregon's North Coast. Chef Casey Barella plans the menu, shops, cooks, serves, and leaves the kitchen spotless.",
);

const occasions = ["Anniversaries", "Birthday dinners", "Vacation-home dining", "Elopements", "Family gatherings", "Just because"];

const sampleMenus = [
  { name: "The North Coast", detail: "Oysters on the half shell · pan-roasted halibut with chanterelles · marionberry cobbler", image: "/cookbook/pc/pan-roasted-halibut-with-chanterelles-and-brown-butter.webp" },
  { name: "The Hearth Table", detail: "Butternut squash soup with brown butter · braised short ribs with polenta · chocolate hazelnut torte", image: "/gallery/shortrib.webp" },
  { name: "Garden & Tide", detail: "Summer corn and tomato bruschetta · seared scallops with beurre blanc · Meyer lemon panna cotta", image: "/gallery/scallops.webp" },
];

export default function PrivateChefPage() {
  return <main className="pc-page">
    <SiteHeader current="/private-chef" />

    <section className="pc-hero">
      <div className="pc-hero-photo" role="img" aria-label="Pacific Northwest private chef dinner featuring a beautifully plated seafood course" />
      <div className="pc-hero-copy">
        <p className="pc-kicker">PRIVATE DINING · OREGON NORTH COAST</p>
        <h1>Your evening.<br/><em>Your table.</em><br/>Nothing to clean.</h1>
        <p>Chef Casey brings a restaurant-caliber dinner into your home or vacation rental—from the first menu idea to the final spotless counter.</p>
        <div><a className="pc-primary" href="#inquire">Start planning <span>→</span></a><a href="#experience">See the experience</a></div>
        <small>Astoria · Warrenton · Gearhart · Seaside · Cannon Beach</small>
      </div>
    </section>

    <section className="pc-included">
      <span>Custom menu planning</span><span>Grocery sourcing</span><span>Cooking in your kitchen</span><span>Plated service</span><span>Complete cleanup</span>
    </section>

    <section className="pc-intro" id="experience">
      <div><p className="pc-kicker">A DINNER THAT FEELS LIKE YOURS</p><h2>Be a guest<br/>in your own home.</h2></div>
      <div><p>No reservations, no driving, no hosting from the stove. We design the menu around your occasion, shop for every ingredient, cook in your kitchen, serve each course, and leave the cooking area clean.</p><p>You choose the people and the feeling. We take care of the dinner.</p></div>
    </section>

    <section className="pc-process">
      <article><b>01</b><h3>Tell us about the table</h3><p>Share your date, guest count, occasion, favorite flavors, dietary needs, and the mood you want.</p></article>
      <article><b>02</b><h3>Approve your custom menu</h3><p>We create a seasonal proposal and make thoughtful adjustments before anything is purchased.</p></article>
      <article><b>03</b><h3>Enjoy the evening</h3><p>Your chef shops, arrives prepared, cooks, plates, serves, and leaves the kitchen clean.</p></article>
    </section>

    <section className="pc-menus">
      <div className="pc-section-head"><p className="pc-kicker">MENU INSPIRATION</p><h2>Rooted in the coast.<br/>Made for your table.</h2><p>Every menu is customized. These are starting points—not fixed packages.</p></div>
      <div className="pc-menu-grid">{sampleMenus.map(menu => <article key={menu.name}><div style={{backgroundImage:`url('${smallImage(menu.image)}')`}}/><span>SAMPLE EXPERIENCE</span><h3>{menu.name}</h3><p>{menu.detail}</p><a href="#inquire">Plan this experience →</a></article>)}</div>
      <p className="pc-menu-more"><a href="/cookbook?side=private-chef">Browse all 20 private chef dishes by course →</a></p>
    </section>

    <section className="pc-occasions"><div><p className="pc-kicker">WORTH GATHERING FOR</p><h2>Big occasion or quiet celebration.</h2><p>Private dining works beautifully for an intimate table of two, a coastal getaway, or a gathering with the people you most want time with.</p></div><ul>{occasions.map(item => <li key={item}>{item}<span>↗</span></li>)}</ul></section>

    <section className="pc-price">
      <div><p className="pc-kicker">CLEAR STARTING PRICES</p><h2>A complete private-dining experience.</h2><p>Menu planning, shopping coordination, in-home cooking, plated service, and kitchen cleanup are included. Final proposals reflect menu ingredients, staffing, travel, rentals, and the needs of your home.</p></div>
      <div className="pc-price-card"><small>THREE-COURSE DINNER</small><strong>From <em>$175</em> per guest</strong><p>Six-guest minimum · groceries included in the proposal</p><hr/><small>INTIMATE TABLES OF 2–5</small><strong>From <em>$1,050</em></strong><p>A minimum keeps a small-table experience fully staffed and beautifully executed.</p><a href="#inquire">Request a custom proposal →</a></div>
    </section>

    <div className="dp"><ReviewsShowcase service="Private chef dinner" /></div>
    <section className="pc-details"><h2>What your evening includes</h2><div><article><h3>Before</h3><p>Personal consultation, custom menu, dietary review, ingredient sourcing, and a clear proposal.</p></article><article><h3>During</h3><p>On-site preparation, restaurant-quality cooking, thoughtful pacing, plating, and table service.</p></article><article><h3>After</h3><p>Leftovers packed when appropriate, dishes handled, cooking surfaces cleaned, and kitchen left ready for you.</p></article></div><small>Specialty rentals, additional servers, extensive travel, alcohol, and extraordinary ingredients may be quoted separately.</small></section>

    <section className="pc-inquiry" id="inquire">
      <div><p className="pc-kicker">LET’S PLAN YOUR TABLE</p><h2>Tell us what you’re celebrating.</h2><p>Send the basics and we’ll follow up with availability and a menu conversation. No payment is taken with this request.</p></div>
      <InquiryForm/>
    </section>

    <SiteFooter />
  </main>;
}
