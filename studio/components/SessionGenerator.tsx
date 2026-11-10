import { useCallback, useState, useMemo } from "react";
import { set, type ArrayOfObjectsInputProps } from "sanity";
import {
  Button,
  Card,
  Flex,
  Stack,
  Text,
  Select,
  TextInput,
  Box,
  Inline,
  Label,
} from "@sanity/ui";
import { Code } from "@sanity/ui/code";
import { RRule } from "rrule";

type SessionEntry = {
  _type: "object";
  _key: string;
  date: string;
  startTime: string;
  endTime: string;
  cancelled: boolean;
};

const WEEKDAYS = [
  { label: "Mon", value: RRule.MO, short: "M" },
  { label: "Tue", value: RRule.TU, short: "T" },
  { label: "Wed", value: RRule.WE, short: "W" },
  { label: "Thu", value: RRule.TH, short: "T" },
  { label: "Fri", value: RRule.FR, short: "F" },
  { label: "Sat", value: RRule.SA, short: "S" },
  { label: "Sun", value: RRule.SU, short: "S" },
] as const;

const ORDINALS = [
  { label: "1st", value: 1 },
  { label: "2nd", value: 2 },
  { label: "3rd", value: 3 },
  { label: "4th", value: 4 },
  { label: "Last", value: -1 },
];

const WEEKDAY_OPTIONS = [
  { label: "Monday", value: 0 },
  { label: "Tuesday", value: 1 },
  { label: "Wednesday", value: 2 },
  { label: "Thursday", value: 3 },
  { label: "Friday", value: 4 },
  { label: "Saturday", value: 5 },
  { label: "Sunday", value: 6 },
];

const RRULE_WEEKDAYS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

type MonthlyMode = "day-of-month" | "day-of-week";

function generateFromRRule(
  rruleStr: string,
  dtstart: Date,
  until: Date,
  defaultStartTime: string,
  defaultEndTime: string
): SessionEntry[] {
  const rule = RRule.fromString(rruleStr);

  // Ensure `until` is inclusive of the entire end date by setting it to
  // 23:59:59 UTC so any occurrence on that calendar day is captured.
  const inclusiveUntil = new Date(until);
  inclusiveUntil.setUTCHours(23, 59, 59, 999);

  const options = { ...rule.origOptions, dtstart, until: inclusiveUntil };
  const fullRule = new RRule(options);

  const startStr = dtstart.toISOString().split("T")[0];
  const untilStr = until.toISOString().split("T")[0];

  return fullRule
    .all()
    .filter((d) => {
      const ds = d.toISOString().split("T")[0];
      return ds >= startStr && ds <= untilStr;
    })
    .map((d) => {
      const dateStr = d.toISOString().split("T")[0];
      return {
        _type: "object" as const,
        _key: `session-${dateStr}`,
        date: dateStr,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        cancelled: false,
      };
    });
}

function DayToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      mode={active ? "default" : "ghost"}
      tone={active ? "primary" : "default"}
      text={label}
      onClick={onClick}
      style={{ minWidth: 44, fontWeight: active ? 700 : 400 }}
      padding={2}
      fontSize={1}
    />
  );
}

export function SessionGeneratorInput(props: ArrayOfObjectsInputProps) {
  const [genStart, setGenStart] = useState("");
  const [genEnd, setGenEnd] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [freq, setFreq] = useState<"weekly" | "monthly">("weekly");
  const [interval, setInterval] = useState(1);

  const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());

  const [monthlyMode, setMonthlyMode] = useState<MonthlyMode>("day-of-week");
  const [ordinal, setOrdinal] = useState(1);
  const [weekdayIndex, setWeekdayIndex] = useState(5); // Saturday

  const [useCustom, setUseCustom] = useState(false);
  const [customRRule, setCustomRRule] = useState("");

  const hasExisting = Array.isArray(props.value) && props.value.length > 0;

  const openForm = useCallback(() => {
    setUseCustom(false);
    setError("");
    setShowForm(true);
  }, []);

  const toggleDay = useCallback((dayIdx: number) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayIdx)) {
        next.delete(dayIdx);
      } else {
        next.add(dayIdx);
      }
      return next;
    });
  }, []);

  const rruleString = useMemo(() => {
    if (useCustom) return customRRule;

    try {
      if (freq === "weekly") {
        if (selectedDays.size === 0) return "";
        const byweekday = Array.from(selectedDays)
          .sort()
          .map((i) => RRULE_WEEKDAYS[i]);
        return new RRule({ freq: RRule.WEEKLY, interval, byweekday }).toString();
      }

      if (freq === "monthly") {
        if (monthlyMode === "day-of-month" && genStart) {
          const dayOfMonth = new Date(genStart + "T00:00:00Z").getUTCDate();
          return new RRule({
            freq: RRule.MONTHLY,
            interval,
            bymonthday: [dayOfMonth],
          }).toString();
        }

        if (monthlyMode === "day-of-week") {
          const wd = RRULE_WEEKDAYS[weekdayIndex].nth(ordinal);
          return new RRule({
            freq: RRule.MONTHLY,
            interval,
            byweekday: [wd],
          }).toString();
        }
      }
    } catch {
      return "";
    }

    return "";
  }, [useCustom, customRRule, freq, interval, selectedDays, monthlyMode, ordinal, weekdayIndex, genStart]);

  const previewText = useMemo(() => {
    if (!rruleString) return "";
    try {
      return RRule.fromString(rruleString).toText();
    } catch {
      return "";
    }
  }, [rruleString]);

  const previewCount = useMemo(() => {
    if (!rruleString || !genStart || !genEnd) return null;
    try {
      const dtstart = new Date(genStart + "T00:00:00Z");
      const until = new Date(genEnd + "T00:00:00Z");
      if (until < dtstart) return null;
      const rule = RRule.fromString(rruleString);
      const full = new RRule({ ...rule.origOptions, dtstart, until });
      return full.all().length;
    } catch {
      return null;
    }
  }, [rruleString, genStart, genEnd]);

  const handleGenerate = useCallback(
    (mode: "replace" | "append") => {
      setError("");

      if (!genStart || !genEnd) {
        setError("Start and end dates are required.");
        return;
      }

      const dtstart = new Date(genStart + "T00:00:00Z");
      const until = new Date(genEnd + "T00:00:00Z");

      if (until < dtstart) {
        setError("End date must be after start date.");
        return;
      }

      if (!rruleString) {
        setError(
          freq === "weekly"
            ? "Select at least one day of the week."
            : "Configure the monthly pattern."
        );
        return;
      }

      try {
        const sessions = generateFromRRule(rruleString, dtstart, until, startTime, endTime);

        if (sessions.length === 0) {
          setError("No dates matched the pattern in the given range.");
          return;
        }

        if (mode === "replace") {
          props.onChange(set(sessions));
        } else {
          const existing = Array.isArray(props.value) ? props.value : [];
          props.onChange(set([...existing, ...sessions]));
        }

        setShowForm(false);
      } catch (e: any) {
        setError(`Invalid rule: ${e.message}`);
      }
    },
    [genStart, genEnd, rruleString, startTime, endTime, freq, props]
  );

  return (
    <Stack gap={3}>
      {!showForm ? (
        <Card padding={3} radius={2} tone="primary">
          <Flex align="center" justify="space-between">
            <Text size={1} muted>
              {hasExisting
                ? `${(props.value as any[]).length} sessions configured`
                : "No sessions yet"}
            </Text>
            <Button
              text="Generate sessions"
              tone="primary"
              mode="ghost"
              onClick={openForm}
            />
          </Flex>
        </Card>
      ) : (
        <Card padding={4} radius={2} tone="primary" border>
          <Stack gap={4}>
            <Text size={1} weight="semibold">
              Generate session dates
            </Text>

            {/* Date range */}
            <Flex gap={2}>
              <Stack gap={2} style={{ flex: 1 }}>
                <Label size={0}>Start date</Label>
                <TextInput
                  type="date"
                  value={genStart}
                  onChange={(e) => setGenStart(e.currentTarget.value)}
                />
              </Stack>
              <Stack gap={2} style={{ flex: 1 }}>
                <Label size={0}>End date</Label>
                <TextInput
                  type="date"
                  value={genEnd}
                  onChange={(e) => setGenEnd(e.currentTarget.value)}
                />
              </Stack>
            </Flex>

            {/* Custom toggle */}
            {useCustom ? (
              <Stack gap={3}>
                <Flex align="center" justify="space-between">
                  <Label size={0}>Custom RRULE</Label>
                  <Button
                    text="Use visual builder"
                    mode="bleed"
                    tone="primary"
                    fontSize={0}
                    padding={1}
                    onClick={() => {
                      setUseCustom(false);
                      setError("");
                    }}
                  />
                </Flex>
                <TextInput
                  value={customRRule}
                  onChange={(e) => {
                    setCustomRRule(e.currentTarget.value);
                    setError("");
                  }}
                  placeholder="RRULE:FREQ=MONTHLY;BYDAY=2SA"
                />
              </Stack>
            ) : (
              <Stack gap={3}>
                {/* Repeat every N week(s)/month(s) */}
                <Flex align="center" gap={2} wrap="wrap">
                  <Text size={1}>Repeat every</Text>
                  <TextInput
                    type="number"
                    value={String(interval)}
                    onChange={(e) =>
                      setInterval(Math.max(1, parseInt(e.currentTarget.value) || 1))
                    }
                    style={{ width: 60 }}
                  />
                  <Select
                    value={freq}
                    onChange={(e) => {
                      setFreq(e.currentTarget.value as "weekly" | "monthly");
                      setError("");
                    }}
                    style={{ width: 130 }}
                  >
                    <option value="weekly">
                      {interval === 1 ? "week" : "weeks"}
                    </option>
                    <option value="monthly">
                      {interval === 1 ? "month" : "months"}
                    </option>
                  </Select>
                </Flex>

                {/* Weekly: day-of-week toggles */}
                {freq === "weekly" && (
                  <Stack gap={2}>
                    <Label size={0}>On these days</Label>
                    <Inline gap={1}>
                      {WEEKDAYS.map((day, idx) => (
                        <DayToggle
                          key={day.label}
                          label={day.label}
                          active={selectedDays.has(idx)}
                          onClick={() => toggleDay(idx)}
                        />
                      ))}
                    </Inline>
                  </Stack>
                )}

                {/* Monthly: mode selector */}
                {freq === "monthly" && (
                  <Stack gap={3}>
                    <Stack gap={2}>
                      <Label size={0}>Repeat on</Label>
                      <Select
                        value={monthlyMode}
                        onChange={(e) =>
                          setMonthlyMode(e.currentTarget.value as MonthlyMode)
                        }
                      >
                        <option value="day-of-week">
                          A specific weekday (e.g. last Saturday)
                        </option>
                        <option value="day-of-month">
                          Same date each month (from start date)
                        </option>
                      </Select>
                    </Stack>

                    {monthlyMode === "day-of-week" && (
                      <Flex gap={2} align="center" wrap="wrap">
                        <Text size={1}>The</Text>
                        <Select
                          value={String(ordinal)}
                          onChange={(e) =>
                            setOrdinal(parseInt(e.currentTarget.value))
                          }
                          style={{ width: 90 }}
                        >
                          {ORDINALS.map((o) => (
                            <option key={o.value} value={String(o.value)}>
                              {o.label}
                            </option>
                          ))}
                        </Select>
                        <Select
                          value={String(weekdayIndex)}
                          onChange={(e) =>
                            setWeekdayIndex(parseInt(e.currentTarget.value))
                          }
                          style={{ width: 140 }}
                        >
                          {WEEKDAY_OPTIONS.map((wd) => (
                            <option key={wd.value} value={String(wd.value)}>
                              {wd.label}
                            </option>
                          ))}
                        </Select>
                      </Flex>
                    )}

                    {monthlyMode === "day-of-month" && genStart && (
                      <Text size={1} muted>
                        On day {new Date(genStart + "T00:00:00Z").getUTCDate()} of each month
                      </Text>
                    )}
                  </Stack>
                )}

                <Flex justify="flex-end">
                  <Button
                    text="Use custom RRULE instead"
                    mode="bleed"
                    tone="default"
                    fontSize={0}
                    padding={1}
                    onClick={() => {
                      setCustomRRule(rruleString);
                      setUseCustom(true);
                    }}
                  />
                </Flex>
              </Stack>
            )}

            {/* Preview */}
            {previewText && (
              <Card padding={3} radius={2} tone="transparent" border>
                <Stack gap={2}>
                  <Text size={1}>
                    {previewText.charAt(0).toUpperCase() + previewText.slice(1)}
                  </Text>
                  {previewCount !== null && (
                    <Text size={0} muted>
                      {previewCount} session{previewCount !== 1 ? "s" : ""} in
                      this range
                    </Text>
                  )}
                  <Code size={0}>{rruleString}</Code>
                </Stack>
              </Card>
            )}

            {/* Times */}
            <Flex gap={2}>
              <Stack gap={2} style={{ flex: 1 }}>
                <Label size={0}>Default start time</Label>
                <TextInput
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.currentTarget.value)}
                />
              </Stack>
              <Stack gap={2} style={{ flex: 1 }}>
                <Label size={0}>Default end time</Label>
                <TextInput
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.currentTarget.value)}
                />
              </Stack>
            </Flex>

            {/* Error */}
            {error && (
              <Card padding={3} radius={2} tone="critical">
                <Text size={1}>{error}</Text>
              </Card>
            )}

            {/* Actions */}
            <Flex gap={2} marginTop={1}>
              {hasExisting ? (
                <>
                  <Button
                    text="Replace existing"
                    tone="caution"
                    onClick={() => handleGenerate("replace")}
                  />
                  <Button
                    text="Append"
                    tone="primary"
                    onClick={() => handleGenerate("append")}
                  />
                </>
              ) : (
                <Button
                  text="Generate"
                  tone="primary"
                  onClick={() => handleGenerate("replace")}
                />
              )}
              <Button
                text="Cancel"
                mode="ghost"
                onClick={() => setShowForm(false)}
              />
            </Flex>
          </Stack>
        </Card>
      )}
      {props.renderDefault(props)}
    </Stack>
  );
}
