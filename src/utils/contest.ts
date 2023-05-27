import { useParams } from "react-router";
import { trpc } from "./trpc";
import { Contest } from "~/shared/schemas/contests";
import {
  formatDistanceToNow,
  formatRelative,
  isWithinInterval,
} from "date-fns/esm";
import { toDate } from "date-fns-tz";
import { format } from "date-fns";

export function useContest() {
  const { contestId } = useParams();
  if (!contestId) {
    throw new Error(
      "No contestId provided. Make sure you're using this hook in a route that has a contestId param"
    );
  }
  return trpc.contest.get.useQuery({ id: contestId });
}

export function useContestInterval({
  contest,
  relative,
}: {
  contest?: Contest;
  relative?: boolean;
}) {
  if (!contest) {
    return {
      start: null,
      startPretty: "",
      end: null,
      endPretty: "",
      interval: { start: null, end: null },
      isActive: false,
    };
  }

  const tz = contest.timezone;
  const start = toDate(`${contest.startsAt}T00:00:00`, { timeZone: tz });
  const end = toDate(`${contest.endsAt}T23:59:59`, { timeZone: tz });
  const interval = { start, end };
  const startFormatted = format(start, "PPP");
  return {
    start,
    startPretty: relative
      ? `${formatRelative(start, new Date())} (${startFormatted})`
      : startFormatted,
    end,
    endPretty: format(end, "PPP"),
    interval,
    isActive: isWithinInterval(new Date(), interval),
  };
}
