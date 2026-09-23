import type { Section } from "./content";

/** A numbered run of plain-language clauses, matching the disclosures page. */
export default function LegalSections({ title, intro, items }: { title: string; intro?: string; items: Section[] }) {
  return (
    <article>
      <h2>{title}</h2>
      {intro ? <p className="legal-intro">{intro}</p> : null}
      {items.map((item, index) => (
        <div key={item.title}>
          <i>{index + 1}</i>
          <span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </span>
        </div>
      ))}
    </article>
  );
}
