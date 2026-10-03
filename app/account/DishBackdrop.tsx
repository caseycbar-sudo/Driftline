/** A soft mosaic of the cookbook's own dish photos behind the dark frame of the customer pages. */
export default function DishBackdrop({ images }: { images: string[] }) {
  if (!images.length) return null;
  return (
    <div className="dish-backdrop" aria-hidden="true">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" loading={i < 8 ? "eager" : "lazy"} decoding="async" />
      ))}
    </div>
  );
}
