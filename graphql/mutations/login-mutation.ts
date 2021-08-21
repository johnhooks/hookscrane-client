import gql from "graphql-tag";

import MyselfFragment from "../fragments/myself";

export default gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        ...Myself
      }
      token
      tokenExpires
    }
    ${MyselfFragment}
  }
`;
