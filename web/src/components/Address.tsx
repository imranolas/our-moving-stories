import { formatAddress, type Venue } from "../lib/schedule";

/** Venue name and address on one line, e.g. "Open Havelock, Willowbrook Road, UB2 4RH". */
export const Address = ({ name, address }: Venue) => {
  const formatted = formatAddress({ address });
  return <span>{[name, formatted].filter(Boolean).join(", ")}</span>;
};
