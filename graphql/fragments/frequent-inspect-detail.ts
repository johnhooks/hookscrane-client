import gql from "graphql-tag";

export default gql`
  fragment FrequentInspectDetail on FrequentInspect {
    id
    datetime
    hours
    meta
  }
`;
