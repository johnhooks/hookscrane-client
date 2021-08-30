import gql from "graphql-tag";

export default gql`
  fragment DailyVehicleInspectDetail on DailyVehicleInspect {
    id
    datetime
    miles
    pass
    meta
  }
`;
