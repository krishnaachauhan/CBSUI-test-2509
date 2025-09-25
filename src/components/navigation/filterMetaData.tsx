import { NavItemType } from "components/navigation";

const matchByValue = (search, tags, navItem) => {
  if (!Array.isArray(tags)) {
    tags = [tags];
  }
  return tags.some((one) =>
    navItem[one]?.toLocaleLowerCase?.()?.includes(search?.toLocaleLowerCase?.())
  );
};

export const filterMetaDataByValue = (
  searchString: string,
  navItems: NavItemType[],
  tagsToSearch?: string[]
): NavItemType[] => {
  let newNavItems: NavItemType[] = [];
  for (let i = 0; i < navItems.length; i++) {
    if (matchByValue(searchString, tagsToSearch, navItems[i])) {
      let { children, ...newItem } = navItems[i];
      if (Array.isArray(children) && children.length > 0) {
        let newChildren = filterMetaDataByValue(
          searchString,
          children,
          tagsToSearch
        );
        if (newChildren.length > 0) {
          newNavItems.push({ ...newItem, children: newChildren });
        }
      } else {
        newNavItems.push({ ...newItem });
      }
    }
  }
  return newNavItems;
};
