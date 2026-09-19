import { permanentRedirect } from "next/navigation";

// Old Squarespace address, kept so printed cards and saved links still work.
export default function OldAddress() {
  permanentRedirect("/private-chef");
}
