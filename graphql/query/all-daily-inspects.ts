import gql from "graphql-tag";

import DailyInspectDetailFragment from "../fragments/daily-inspect-detail";

export default gql`
  query allDailyInspects {
    allDailyInspects {
      ...DailyInspectDetail
    }
    ${DailyInspectDetailFragment}
  }
`;
