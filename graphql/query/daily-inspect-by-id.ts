import gql from "graphql-tag";

import DailyInspectDetailFragment from "../fragments/daily-inspect-detail";

export default gql`
  query dailyInspectById($id: Int!) {
    dailyInspectById(id: $id) {
      ...DailyInspectDetail
    }
    ${DailyInspectDetailFragment}
  }
`;
