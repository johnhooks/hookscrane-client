import gql from "graphql-tag";

import { DocumentDetail } from "../fragments/document-detail";

export default gql`
  query documentById($id: Int!) {
    documentById(id: $id) {
      ...DocumentDetail
    }
    ${DocumentDetail}
  }
`;
