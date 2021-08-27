import gql from "graphql-tag";

import DetailFragment from "../fragments/frequent-inspect-detail";

export default gql`
  query recentFrequentInspects {
    recentFrequentInspects {
      ...FrequentInspectDetail
    }
    ${DetailFragment}
  }
`;
