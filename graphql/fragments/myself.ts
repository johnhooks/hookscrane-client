import gql from "graphql-tag";

export default gql`
  fragment Myself on User {
    id
    roles
    email
    firstName
    lastName
  }
`;
