/**
 * The photograph behind a whole page.
 *
 * Rendered as a sibling of <main>, not inside it: several page roots clip their
 * overflow, which would crop a fixed-position child. Fixed to the viewport so a
 * long page doesn't stretch one photo over thousands of pixels -- the image
 * stays its natural size and the content scrolls over it.
 *
 * It sits under a heavy wash of the page's own colour (see .dp-canvas in
 * home.css). Readability comes first: this is texture and appetite, not a
 * picture anyone is meant to study.
 */
export default function PageCanvas({ src }: { src: string }) {
  return <div className="dp-canvas" aria-hidden="true" style={{ backgroundImage: `url("${src}")` }} />;
}
