import gql from "graphql-tag";

export const DocumentListItem = gql`
  fragment DocumentListItem on Document {
    datetime
    id
    pass
    type
  }
`;
