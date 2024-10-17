import h from "vhtml";
import { PortableTextBlock } from "@portabletext/types";
import { toHTML } from "@portabletext/to-html";

export type Props = {
  _type: "textSection";
  _key: string;
  heading: string;
  excerpt: PortableTextBlock;
};

export default function TextSection({ heading, excerpt }: Props) {
  return (
    <section className="w-full text-left py-24 bg-light" id="about">
      <div className="max-w-5xl mx-auto">
        <h1 className="ml-16 lg:mx-0">{heading}</h1>

        <div
          className="leading-relaxed space-y-8 mx-16 lg:mx-auto mt-16 max-w-4xl text-text text-lg"
          dangerouslySetInnerHTML={{ __html: toHTML(excerpt) }}
        />
      </div>
    </section>
  );
}
