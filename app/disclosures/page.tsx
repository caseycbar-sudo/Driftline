import Link from "next/link";
import SiteHeader from "../SiteHeader";
import SiteFooter from "../SiteFooter";
import "../home.css";
import {customerSections,chefSections,DISCLOSURE_VERSION} from "./content";
import { CONTACT_EMAIL } from "../site-config";
import "./disclosures.css";
import type { Metadata } from "next";
import { pageMetadata } from "../site-config";

export const metadata: Metadata = pageMetadata(
  "/disclosures",
  "Service Disclosures · Driftline Provisions",
  "How Driftline Provisions' in-home private chef and meal prep services work: kitchen access, food safety, allergies, cancellations, and photos.",
);
export default function Disclosures(){return <main className="legal-page"><SiteHeader/><header><span>Disclosure version {DISCLOSURE_VERSION}</span></header><section><p>IMPORTANT SERVICE INFORMATION</p><h1>Clear expectations protect everyone.</h1><LegalGroup title="Customer service disclosures" items={customerSections}/><LegalGroup title="Chef workplace acknowledgments" items={chefSections}/><footer><p>Questions or incident reports: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p><Link href="/">Return home →</Link></footer></section><SiteFooter/></main>}
function LegalGroup({title,items}:{title:string;items:{title:string;body:string}[]}){return <article><h2>{title}</h2>{items.map((item,index)=><div key={item.title}><i>{index+1}</i><span><h3>{item.title}</h3><p>{item.body}</p></span></div>)}</article>}
