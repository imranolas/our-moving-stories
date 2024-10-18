import type { Props } from "./eventsSection";

export const Address = ({
  address,
  name,
}: Props["events"][number]["venue"]) => {
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
