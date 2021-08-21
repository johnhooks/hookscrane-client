import type { FunctionComponent } from "react";
import { format as formatDate } from "date-fns";

interface Props {
  date: Date;
}

export const TimeFormat: FunctionComponent<Props> = ({ date }) => {
  return (
    <time dateTime={formatDate(date, "hh:mm")}>
      {formatDate(date, "h:mm bb")}
    </time>
  );
};

