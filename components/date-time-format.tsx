import type { FunctionComponent } from "react";
import { format as formatDate } from "date-fns";

interface Props {
  date: Date;
}

export const DateTimeFormat: FunctionComponent<Props> = ({ date }) => {
  return <time dateTime={formatDate(date, "yyyy-MM-dd'T'hh:mm:ss.SSS")}>{formatDate(date, "LLLL d, Y h:mm bb")}</time>;
};
