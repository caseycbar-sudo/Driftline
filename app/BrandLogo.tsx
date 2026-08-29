const logoUrl="https://images.squarespace-cdn.com/content/v1/699e6197636f76123f36f3c2/bb5b95d1-ae32-4331-bbbb-df94b3e07864/driftline-logo-reversed.png?format=1500w";
export default function BrandLogo({className=""}:{className?:string}){return <span className={`driftline-master-logo ${className}`}><img src={logoUrl} alt="Driftline Provisions"/></span>}
