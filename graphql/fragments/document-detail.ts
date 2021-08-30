import gql from "graphql-tag";

export const DocumentDetail = gql`
  fragment DocumentDetail on Document {
    datetime
    hours
    id
    miles
    pass
    meta
    type
  }
`;
