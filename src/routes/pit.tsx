import { createFileRoute } from "@tanstack/react-router";
import { KilnApp } from "@/components/kiln/kiln-app";

export const Route = createFileRoute("/pit")({
  head: () => ({
    meta: [{ title: "The pit · Kiln" }],
  }),
  component: PitPage,
});

function PitPage() {
  return <KilnApp />;
}
