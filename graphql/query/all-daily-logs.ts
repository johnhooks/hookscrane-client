import gql from "graphql-tag";

import DailyLogDetailFragment from "../fragments/daily-log-detail";

export default gql`
  query allDailyLogs {
    allDailyLogs {
      ...DailyLogDetail
    }
    ${DailyLogDetailFragment}
  }
`;
