import gql from "graphql-tag";

import DetailFragment from "../fragments/daily-vehicle-inspect-detail";

export default gql`
  query recentDailyVehicleInspects {
    recentDailyVehicleInspects {
      ...DailyVehicleInspectDetail
    }
    ${DetailFragment}
  }
`;
