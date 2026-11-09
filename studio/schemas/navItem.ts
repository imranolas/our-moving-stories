import {} from "@sanity/icons";

export default {
  name: "navigationItem",
  title: "Navigation Item",
  type: "object",
  fields: [
    {
      name: "text",
      type: "string",
      title: "Navigation Text",
      description: "The label shown in the navigation menu.",
    },
    {
      name: "navigationItemUrl",
      type: "link",
      title: "Navigation Item URL",
      description: "Where this nav item links to (internal page or external URL).",
    },
  ],
};
