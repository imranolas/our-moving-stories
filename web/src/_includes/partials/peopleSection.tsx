import h from "vhtml";
import { urlFor } from "../../utils/urlFor";
import { toHTML } from "@portabletext/to-html";
import type { PortableTextBlock } from "@portabletext/types";

export type Props = {
  _type: "people";
  _key: string;
  title: string;
  people: {
    name: string;
    role: string;
    email: string;
    social: {
      platform: string;
      handle: string;
    }[];
    profile: {
      asset: {
        url: string;
      };
    };
    qual: string[];
    bio: PortableTextBlock;
  }[];
};

export default function PeopleSection({ people }: Props) {
  return (
    <section className="w-full text-left py-24 bg-light" id="people">
      <div className="max-w-5xl mx-12 lg:mx-auto">
        <h1 className="mb-20">People</h1>
        <ul className="space-y-12 divide-y-2 divide-text divide-opacity-20">
          {people.map((person) => (
            <li className="flex justify-between space-y-12 md:space-y-0 md:space-x-12 lg:ml-16 flex-col md:flex-row pt-12 first:pt-0">
              <div className="space-y-4 flex-grow">
                <img
                  src={urlFor(person.profile).height(400).width(320).url()}
                  alt={person.name}
                  className="mx-auto lg:max-w-xs"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-4">
                  <span className="space-x-2 block">
                    <h2 className="text-text font-bold text-xl inline-block">
                      {person.name}
                    </h2>
                  </span>
                  <span className="text-text text-base font-semibold">
                    {person.role}
                  </span>
                </div>
                <div
                  className="prose text-text text-lg"
                  dangerouslySetInnerHTML={{ __html: toHTML(person.bio) }}
                ></div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
