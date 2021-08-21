import gql from "graphql-tag";

import DailyInspectDetailFragment from "../fragments/daily-log-detail";

export default gql`
  mutation createDailyInspect($data: DailyInspectCreateInput!) {
    createDailyInspect(data: $data) {
      ...DailyInspectDetail
    }
    ${DailyInspectDetailFragment}
  }
`;
