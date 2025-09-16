import { SortFilterItem } from '@/lib/constants';
import FilterItemDropdownWrapper from '../FilterItemDropdownWrapper';
import FilterItemListWrapper from '../FilterItemWrapper';

export type ListItem = SortFilterItem | PathFilterItem;
export type PathFilterItem = { title: string; path: string };

export default function FilterList({ list, title }: { list: ListItem[]; title?: string }) {
  return (
    <>
      <nav className="flex items-center justify-center gap-x-8">
        {title ? (
          <h3 className="hidden font-lora text-xs text-darkPurple md:block md:text-lg">{title}</h3>
        ) : null}
        <ul className="hidden items-center justify-center gap-4 md:flex">
          <FilterItemListWrapper list={list} />
        </ul>
        <ul className="md:hidden">
          <FilterItemDropdownWrapper list={list} />
        </ul>
      </nav>
    </>
  );
}
