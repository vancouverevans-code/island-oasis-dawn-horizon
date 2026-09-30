import { createFileRoute } from "@tanstack/react-router";
import { KilnApp } from "@/components/kiln/kiln-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <KilnApp />;
}
