export type NavigationItem = {
  navigationItemUrl: {
    _type: "link";
    internalLink?: {
      reference?: { slug: { current: string; _type: "slug" } };
      anchor?: string;
    };
    externalUrl?: string;
  };
  _type: "navigationItem";
  text: string;
  _key: string;
};

export const formatLink = (
  link: NavigationItem["navigationItemUrl"]
): string | null => {
  if (link.externalUrl) return link.externalUrl;

  const slug = link.internalLink?.reference?.slug?.current;
  if (!slug) return null;

  let href = slug === "index" ? "/" : `/${slug}`;

  if (link.internalLink?.anchor) {
    return `${href}#${link.internalLink.anchor}`;
  }

  return href;
};

/** @deprecated Use formatLink instead */
export const formatInternalLink = formatLink;
