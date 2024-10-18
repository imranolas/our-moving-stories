import { DateTime } from "luxon";

export const FormattedDateRange = ({
  startDate,
  endDate,
  recurrence,
}: {
  startDate: string;
  endDate: string;
  recurrence: { frequency: string; interval: number; endDate: string };
}) => {
  const start = DateTime.fromISO(startDate);
  const formattedStart = start.toLocaleString({
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const dayOfWeek = start.toFormat("ccc");

  if (recurrence) {
    const formattedEnd = DateTime.fromISO(recurrence.endDate).toLocaleString({
      month: "short",
      day: "numeric",
      year: "2-digit",
    });

    return (
      <span>
        Every {formattedStart} to {formattedEnd}
      </span>
    );
  } else {
    return <span>{formattedStart}</span>;
  }
};
