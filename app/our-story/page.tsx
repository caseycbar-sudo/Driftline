import type { Metadata } from "next";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import "../home.css";
import { pageMetadata, smallImage } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "/our-story",
  "Our Story · Chef Casey Barella · Driftline Provisions",
  "Chef Casey Barella: Pacific Northwest born, fine dining trained, founder of the award-winning Chowder Stop, and now cooking at your table through Driftline Provisions.",
);

const gallery = [
  { src: "/gallery/salmon.webp", alt: "Roasted salmon with asparagus and saffron orzo" },
  { src: "/gallery/scallops.webp", alt: "Seared scallops with beurre blanc" },
  { src: "/gallery/shortrib.webp", alt: "Braised short rib over creamy polenta" },
  { src: "/gallery/dessert.webp", alt: "Plated dessert with chocolate drizzle" },
];

export default function OurStoryPage() {
  return (
    <main className="dp">
      <SiteHeader current="/our-story" />

      <section className="dp-hero dp-hero-short">
        <div className="dp-hero-copy">
          <p className="dp-eyebrow">
            <span aria-hidden="true" /> Our story
          </p>
          <h1>
            Casey Barella.
            <em>Cooking for the coast.</em>
          </h1>
          <p className="dp-lede">
            Pacific Northwest born, fine dining trained, and the chef behind
            Astoria&apos;s award-winning clam chowder.
          </p>
        </div>
        <figure className="dp-hero-photo">
          <img src="/gallery/chef-casey.webp" alt="Chef Casey Barella cooking in a home kitchen" />
        </figure>
      </section>

      <section className="dp-section dp-story">
        <div className="dp-story-copy">
          <h2>
            Good food doesn&apos;t need <em>white tablecloths.</em>
          </h2>
          <p>
            Born and raised in the Pacific Northwest, Casey has spent his career
            celebrating the region&apos;s ingredients and its laid-back
            hospitality. After honing his craft in fine dining kitchens, he set
            out to prove that exceptional food doesn&apos;t require white
            tablecloths. It just requires quality ingredients, thoughtful
            preparation, and a passion for sharing great meals.
          </p>
          <p>
            That vision became <strong>The Chowder Stop</strong>, where Casey
            built an award-winning restaurant known for its handcrafted clam
            chowder and approachable Northwest fare. Year after year his chowder
            earned top honors, and it became a destination for locals and
            visitors alike. After building and successfully selling the
            restaurant, Casey chose to return to what he enjoys most: creating
            memorable, personal dining experiences.
          </p>
          <p>
            Today, through <strong>Driftline Provisions</strong>, Casey brings
            restaurant-quality cooking straight to your table. Whether it&apos;s
            an intimate chef&apos;s dinner, a catered celebration, or a week of
            meals made in your kitchen, every menu is inspired by the flavors of
            the Pacific Northwest and prepared with the same care that made The
            Chowder Stop a local favorite.
          </p>
        </div>
        <aside className="dp-story-side">
          <blockquote>
            “Great food doesn&apos;t have to be complicated. It just has to be
            unforgettable.”
            <cite>Chef Casey Barella</cite>
          </blockquote>
          <div className="dp-gallery dp-gallery-2">
            {gallery.map((photo) => (
              <img key={photo.src} src={smallImage(photo.src)} alt={photo.alt} loading="lazy" decoding="async" />
            ))}
          </div>
        </aside>
      </section>

      <section className="dp-market">
        <figure>
          <img src="/gallery/chowder-stand.webp" alt="Chef Casey at the clam chowder stand" loading="lazy" />
        </figure>
        <div className="dp-market-copy">
          <p className="dp-eyebrow dp-eyebrow-light">
            <span aria-hidden="true" /> Still serving chowder
          </p>
          <h2>
            Come say hi <em>on Sundays.</em>
          </h2>
          <p>
            The chowder that made The Chowder Stop famous is still here, served
            hot at the Astoria Sunday Market all season long.
          </p>
          <div className="dp-hero-actions">
            <a className="dp-btn dp-btn-gold" href="/sunday-market">
              Market details <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="dp-plan">
        <div className="dp-plan-card">
          <h2>
            Let&apos;s cook <em>for you.</em>
          </h2>
          <div className="dp-plan-actions">
            <a className="dp-btn dp-btn-gold" href="/private-chef">
              Private chef dinners <span aria-hidden="true">→</span>
            </a>
            <a className="dp-btn dp-btn-ghost" href="/catering">
              Catering
            </a>
            <a className="dp-btn dp-btn-ghost" href="/meal-prep">
              Weekly meal prep
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
