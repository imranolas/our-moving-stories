import { validation } from "sanity";

export default {
  name: "link",
  type: "object",
  title: "Link",
  fields: [
    {
      title: "Internal Link",
      name: "internalLink",
      description: "Link to a page within this site.",
      type: "object",
      fields: [
        {
          name: "reference",
          title: "Page",
          type: "reference",
          description: "Select the page to link to.",
          to: [{ type: "page" }],
        },
        {
          name: "anchor",
          title: "Anchor",
          type: "string",
          description:
            "Optional anchor to scroll to a specific section on the page (e.g. 'whats-on').",
        },
      ],
    },
    {
      name: "externalUrl",
      title: "URL / Path",
      description:
        "A URL or path for the link (e.g. /events, /sessions, or https://example.com). Leave empty if using an internal link above.",
      type: "string",
    },
  ],
};
