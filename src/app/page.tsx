import { redirect } from "next/navigation";

/** "/" → dashboard (the proxy sends anonymous visitors to /connexion first). */
export default function Home() {
  redirect("/tableau-de-bord");
}
