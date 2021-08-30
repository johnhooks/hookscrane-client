import gql from "graphql-tag";

import { DocumentListItem } from "../fragments/document-list-item";

export default gql`
  query recentDocumentsList($types: [DocType!]) {
    recentDocuments(types: $types) {
      ...DocumentListItem
    }
    ${DocumentListItem}
  }
`;
