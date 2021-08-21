import gql from "graphql-tag";

import DailyLogDetailFragment from "../fragments/daily-log-detail";

export default gql`
  mutation createDailyLog($data: DailyLogCreateInput!) {
    createDailyLog(data: $data) {
      ...DailyLogDetail
    }
    ${DailyLogDetailFragment}
  }
`;
