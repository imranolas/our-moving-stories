export type NavigationItem = {
  navigationItemUrl: {
    _type: "link";
    internalLink: {
      reference: { slug: { current: string; _type: "slug" } };
      anchor?: string;
    };
  };
  _type: "navigationItem";
  text: string;
  _key: string;
};

export const formatInternalLink = (
  link: NavigationItem["navigationItemUrl"]
) => {
  let href = link.internalLink.reference.slug.current;
  if (link.internalLink.reference.slug.current === "index") {
    href = "/";
  }

  if (link.internalLink.anchor) {
    return `${href}#${link.internalLink.anchor}`;
  }

  return href;
};
