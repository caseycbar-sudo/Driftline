import "./DishPhoto.css";

/**
 * A dish's photo, or an honest placeholder when there isn't a photo that matches
 * the recipe yet. Casey replaces placeholders by uploading his own photos from the
 * Cookbook tab.
 */
export default function DishPhoto({
  src,
  alt,
  label,
  className = "",
  loading,
}: {
  src: string;
  alt: string;
  /** Short word shown on the placeholder, usually the course or category. */
  label?: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  if (src) return <img className={className} src={src} alt={alt} loading={loading} decoding="async" />;
  return (
    <div className={`dish-photo-empty ${className}`} role="img" aria-label={`${alt}: photo coming soon`}>
      <i aria-hidden="true" />
      {label ? <b>{label}</b> : null}
      <small>Photo coming soon</small>
    </div>
  );
}
