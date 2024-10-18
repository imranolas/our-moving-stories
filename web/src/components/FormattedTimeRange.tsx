import { DateTime } from "luxon";

export const FormattedTimeRange = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  const formattedStart = start.toLocaleString({
    hour: "numeric",
    minute: "2-digit",
  });
  const formattedEnd = end.toLocaleString({
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const delta = end.diff(start, ["hours", "minutes"]);

  return (
    <span>
      {formattedStart} - {formattedEnd} ({delta.hours}h {delta.minutes}m)
    </span>
  );
};
