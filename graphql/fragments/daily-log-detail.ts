import gql from "graphql-tag";

export default gql`
  fragment DailyLogDetail on DailyLog {
    id
    type
    datetime
    miles
    meta
  }
`;
