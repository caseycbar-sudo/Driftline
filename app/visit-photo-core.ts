/**
 * Photo rules for finishing a visit. Pure, so the rule is readable and testable in one place.
 *
 * Normally a visit needs 1 to 8 dish photos and exactly one clean-kitchen photo.
 * When the customer asked for no photos in their home, the chef marks that and
 * neither is needed. (The grocery receipt photo is separate and still follows its own rule.)
 */
export const MAX_DISH_PHOTOS = 8;
export const NO_PHOTOS_NOTE = "No photos taken: the customer asked for none.";

/** An error message for the chef, or "" when the photo counts are fine. */
export function visitPhotoProblem(noPhotos: boolean, dishCount: number, kitchenCount: number): string {
  if (noPhotos) return "";
  if (dishCount < 1 || dishCount > MAX_DISH_PHOTOS || kitchenCount !== 1) {
    return "Add 1 to 8 dish photos and exactly one clean-kitchen photo, or tick that the customer asked for no photos.";
  }
  return "";
}

/** The visit note as saved: the chef's own words, plus a line the owner can see when no photos were taken. */
export function visitNoteWith(note: string, noPhotos: boolean): string {
  const clean = note.trim().slice(0, 1000);
  if (!noPhotos) return clean;
  return clean ? `${NO_PHOTOS_NOTE} ${clean}`.slice(0, 1100) : NO_PHOTOS_NOTE;
}
