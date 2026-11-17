import type { Metadata } from "next";
import { UsersView } from "@/features/users/components/users-view";

export const metadata: Metadata = { title: "Utilisateurs et rôles" };

export default function UtilisateursPage() {
  return <UsersView />;
}
