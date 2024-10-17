import h from "vhtml";

import Hero, { Props as HeroProps } from "./hero";
import TextSection, { Props as TextSectionProps } from "./textSection";
import PeopleSection, { Props as PeopleSectionProps } from "./peopleSection";
import InstagramSection from "./insta";
import EventsSection, { Props as EventsSectionProps } from "./eventsSection";

type Props =
  | HeroProps
  | TextSectionProps
  | PeopleSectionProps
  | EventsSectionProps
  | {
      _type: "instagram";
    };

export default function Block(props: Props) {
  switch (props._type) {
    case "hero":
      return <Hero {...props} />;

    case "textSection":
      return <TextSection {...props} />;

    case "people":
      return <PeopleSection {...props} />;

    case "instagram":
      return <InstagramSection settings={props.settings} />;

    case "events": {
      return <EventsSection {...props} />;
    }

    default:
      return null;
  }
}
