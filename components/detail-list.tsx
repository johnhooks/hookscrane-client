import type { PropsWithChildren } from "react";

export interface DetailItemProps {
  name: string;
  label: string;
  value: string;
  description?: string;
}

export interface Props<Detail extends DetailItemProps> {
  items: Detail[];
  className?: string;
}

function DetailItem<Detail extends DetailItemProps>({ name, label, value }: PropsWithChildren<Detail>) {
  const labelId = `${name}-display-label`;
  return (
    <div>
      <dt role="label" id={labelId} className="text-sm font-medium text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-gray-900" aria-labelledby={labelId}>
        {value}
      </dd>
    </div>
  );
}

const baseClassName = "grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6  print:grid-cols-2";

export function DetailList<Detail extends DetailItemProps>({
  items,
  className: classNameProp,
}: PropsWithChildren<Props<Detail>>) {
  const className = classNameProp ? baseClassName + " " + classNameProp : baseClassName;
  return (
    <dl className={className}>
      {items.map(item => (
        <DetailItem {...item} key={item.name} />
      ))}
    </dl>
  );
}
