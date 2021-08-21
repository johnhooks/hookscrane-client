import gql from "graphql-tag";

export default gql`
  fragment DailyInspectDetail on DailyInspect {
    id
    type
    datetime
    hours
    meta
  }
`;
