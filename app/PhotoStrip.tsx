import { smallImage } from "./site-config";

type Photo = { src: string; alt: string; caption?: string };

/** A row of four photos (swipeable on phones). */
export default function PhotoStrip({ photos, label }: { photos: Photo[]; label: string }) {
  return (
    <section className="dp-photo-strip" aria-label={label}>
      {photos.map((photo) => (
        <figure key={photo.src}>
          <img src={smallImage(photo.src)} alt={photo.alt} loading="lazy" decoding="async" />
          {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
        </figure>
      ))}
    </section>
  );
}
