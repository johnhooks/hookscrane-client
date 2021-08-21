import gql from "graphql-tag";

import DailyInspectDetailFragment from "../fragments/daily-log-detail";

export default gql`
  mutation createDailyInspect($data: DailyInspectCreateInput!) {
    createDaily(data: $data) {
      ...DailyInspectDetail
    }
    ${DailyInspectDetailFragment}
  }
`;
