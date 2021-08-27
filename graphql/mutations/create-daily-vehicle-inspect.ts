import gql from "graphql-tag";

import DetailFragment from "../fragments/daily-vehicle-inspect-detail";

export default gql`
  mutation createDailyVehicleInspect($data: DailyVehicleInspectCreateInput!) {
    createDailyVehicleInspect(data: $data) {
      ...DailyVehicleInspectDetail
    }
    ${DetailFragment}
  }
`;
