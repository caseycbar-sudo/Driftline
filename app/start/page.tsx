import { permanentRedirect } from "next/navigation";

/** Old ChatGPT-era chooser page; its choices now live on the home page. */
export default function StartPage() {
  permanentRedirect("/");
}
