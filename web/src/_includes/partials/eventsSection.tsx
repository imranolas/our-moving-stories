import h from "vhtml";
import { urlFor } from "../../utils/urlFor";
import { toHTML } from "@portabletext/to-html";
import type { PortableTextBlock } from "@portabletext/types";
import { DateTime } from "luxon";

export type Props = {
  _type: "events";
  _key: string;
  title: string;
  events: {
    name: string;
    poster: {
      asset: {};
    };
    venue: {
      name: string;
      address: {
        address1: string;
        address2: string;
        city: string;
        region: string;
        postalCode: string;
      };
    };
    description: PortableTextBlock;
    startDate: string;
    endDate: string;
    isRecurring: boolean;
    recurrence: {
      frequency: string;
      interval: number;
      endDate: string; // ISO date
    };
  }[];
};

export default function EventsSection({
  events: noOfEvents,
  title,
  data,
}: Props) {
  return (
    <section className="w-full text-left py-24" id="whats-on">
      <div className="max-w-5xl mx-12 lg:mx-auto">
        <h1 className="mb-20">{title}</h1>
        <ul className="divide-text divide-opacity-20 divide-y-2 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12">
          {data.events.map((event) => (
            <li className="w-full space-y-4">
              <div className="overflow-hidden max-h-[300px]">
                <a href={event.link}>
                  <img
                    src={urlFor(event.poster).url()}
                    alt=""
                    className="pointer-events-none object-cover group-hover:opacity-75"
                  />
                </a>
              </div>
              <div className="space-y-1">
                <span className="space-x-2 block">
                  <a href={event.link}>
                    <h2 className="text-text font-bold text-2xl inline-block">
                      {event.name}
                    </h2>
                  </a>
                  <span className="text-text text-base font-semibold">
                    <Price price={event.price} />
                  </span>
                </span>
                <span className="text-text text-base font-semibold block">
                  <FormattedDateRange
                    startDate={event.startDate}
                    endDate={event.endDate}
                    recurrence={event.recurrence}
                  />
                </span>
                <span className="text-text text-base font-semibold block">
                  <FormattedTimeRange
                    startDate={event.startDate}
                    endDate={event.endDate}
                  />
                </span>

                <span className="text-text text-base font-semibold block pt-4">
                  <img
                    src="/static/img/pin.svg"
                    alt="Instagram"
                    className="inline-block w-8 text-text"
                  />
                  <a href={event.venue.googleMapsLink}>
                    <Address {...event.venue} />
                  </a>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const Price = ({ price }: { price: number }) => {
  if (price === 0) {
    return "Free";
  } else {
    return `£${price}`;
  }
};

const FormattedDateRange = ({
  startDate,
  endDate,
  recurrence,
}: {
  startDate: string;
  endDate: string;
  recurrence: { frequency: string; interval: number; endDate: string };
}) => {
  const start = DateTime.fromISO(startDate);
  const formattedStart = start.toLocaleString(DateTime.DATE_FULL);
  const dayOfWeek = start.toFormat("cccc");

  if (recurrence) {
    const formattedEnd = DateTime.fromISO(recurrence.endDate).toLocaleString(
      DateTime.DATE_FULL
    );

    return (
      <span>
        Every {dayOfWeek} {formattedStart} - {formattedEnd}
      </span>
    );
  } else {
    return (
      <span>
        {dayOfWeek} {formattedStart}
      </span>
    );
  }
};

const FormattedTimeRange = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  const formattedStart = start.toLocaleString(DateTime.TIME_SIMPLE);
  const formattedEnd = end.toLocaleString(DateTime.TIME_SIMPLE);
  const delta = end.diff(start, ["hours", "minutes"]);

  return (
    <span>
      {formattedStart} - {formattedEnd} ({delta.hours}h {delta.minutes}m)
    </span>
  );
};

const Address = ({ address, name }: Props["events"][number]["venue"]) => {
  const formattedAddress = Object.keys(address)
    .map((key) => address[key])
    .filter((e) => e.trim().length > 0)
    .join(", ");

  return (
    <span>
      {name}, {formattedAddress}
    </span>
  );
};
