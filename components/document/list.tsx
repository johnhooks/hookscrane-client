import type { PropsWithChildren } from "react";

import { ListItem, Props as ListItemProps } from "./list-item";

interface Props {
  documents: ListItemProps[];
}

export function ListDocuments({ documents }: PropsWithChildren<Props>) {
  return (
    <div className="bg-white sm:shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {documents.map(document => (
          <ListItem key={document.id} {...document} />
        ))}
      </ul>
    </div>
  );
}
