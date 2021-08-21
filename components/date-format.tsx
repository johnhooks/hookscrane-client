import type { FunctionComponent } from "react";
import { format as formatDate } from "date-fns";

interface Props {
  date: Date;
}

export const DateFormat: FunctionComponent<Props> = ({ date }) => {
  return (
    <time dateTime={formatDate(date, "yyyy-MM-dd")}>
      {formatDate(date, "LLLL d, Y")}
    </time>
  );
};

