import gql from "graphql-tag";

import DetailFragment from "../fragments/frequent-inspect-detail";

export default gql`
  mutation createFrequentInspect($data: FrequentInspectCreateInput!) {
    createFrequentInspect(data: $data) {
      ...FrequentInspectDetail
    }
    ${DetailFragment}
  }
`;
