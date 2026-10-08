import { createFileRoute } from "@tanstack/react-router";
import { SitePage } from "@/components/site/site-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kiln — agents on BOT Chain" },
      {
        name: "description",
        content: "Forge one agent, fire a public signal, and stoke it with BOT.",
      },
    ],
  }),
  component: SitePage,
});
