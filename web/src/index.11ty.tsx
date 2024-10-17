import h from "vhtml";
import Block from "./_includes/partials/block";

export const data = {
  layout: "default",
  title: "Our Moving Stories",
  path: "home",
  description:
    "Our Moving Stories is a community-focused company based in Southall and Ealing. We explore the living potential of the moving body, fostering inclusive movement practices that bridge across divides. Join us for classes, creative projects, and artistic collaborations encompassing dance, music, spoken word, visual art, and more. Embrace the power of storytelling through movement and be a part of our inclusive movement practice. Subscribe to stay connected with our vibrant community.",
  pagination: {
    data: "pages",
    size: 1,
    alias: "page",
  },
  permalink: ({ page }) => {
    return page.slug.current + "/";
  },
};

export function render(this, data) {
  return (
    /* For every 2nth section render it with bg-primary */
    <div className="overflow-x-clip">
      {data.page.pageBuilder.map((block) => (
        <Block
          key={block._key}
          {...block}
          settings={data.settings}
          data={data}
        />
      ))}
    </div>
  );
}
