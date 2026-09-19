const logoUrl = "/brand/driftline-logo-reversed.webp";
export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`driftline-master-logo ${className}`}>
      <img src={logoUrl} alt="Driftline Provisions" width={360} height={231} decoding="async" />
    </span>
  );
}
