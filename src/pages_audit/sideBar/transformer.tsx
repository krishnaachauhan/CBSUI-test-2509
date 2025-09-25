import { NavBarMetaDataType, NavItemType } from "components/navigation";
import { cloneDeep } from "lodash";

export const transformMetaDataAsPerRole = (
  metaData: NavBarMetaDataType,
  role: number,
  branches: string[],
  company: string,
  access: any,
  products: string[]
) => {
  let navItems = filterMetaData(
    metaData.navItems,
    role,
    branches,
    company,
    access,
    products
  );
  //console.log(navItems);
  let newnavItem = navItems.map((item) => {
    let { children, ...newItem } = item;
    if (Array.isArray(children) && children.length > 5) {
      if (!Boolean(newItem.seperateView)) {
        newItem.seperateView = true;
        newItem.viewName = "newfilterview";
        //console.log(newItem);
      }
    }
    return { ...newItem, children: children };
  });
  return {
    config: metaData.config,
    navItems: newnavItem,
  };
};
export const transformMetaDataAsPerMenuRights = (
  metaData: NavBarMetaDataType,
  authState: any
) => {
  let newMetadata = cloneDeep(metaData) as NavBarMetaDataType;
  let NavItem = filterMetaDataAsperRights(newMetadata.navItems, authState);
  newMetadata.navItems = NavItem;
  return newMetadata;
};
const filterMetaDataAsperRights = (navItems, accessgroup) => {
  let newNavItems: NavItemType[] = [];
  for (let i = 0; i < navItems.length; i++) {
    let { children, ...newItem } = navItems[i];
    if (Array.isArray(children) && children.length > 0) {
      let newChildren = filterMetaDataAsperRights(children, accessgroup);
      if (newChildren.length > 0) {
        newNavItems.push({ ...newItem, children: newChildren });
      }
    } else {
      //if(newItem?.doccd) ///condition
      ///newNavItems.push({ ...newItem });
    }
  }
  return newNavItems;
};
const matchBranches = (userBranches, accessBranches) => {
  if (!Array.isArray(accessBranches) || !Array.isArray(userBranches)) {
    return true;
  }
  if (accessBranches.length <= 0 || userBranches.length <= 0) {
    return true;
  }
  for (const one of accessBranches) {
    if (userBranches.indexOf(one) >= 0) {
      return true;
    }
  }
  return false;
};

const matchComany = (userCompany, accessCompany) => {
  if (!Array.isArray(accessCompany) || !Boolean(userCompany)) {
    return true;
  }
  if (accessCompany.length <= 0) {
    return true;
  }
  if (accessCompany.indexOf(userCompany) >= 0) {
    return true;
  }
  return false;
};

const matchRoles = (userRole, accessRoles) => {
  if (!Array.isArray(accessRoles) || typeof userRole !== "number") {
    return true;
  }
  if (accessRoles.length <= 0) {
    return true;
  }
  if (accessRoles.indexOf(userRole) >= 0) {
    return true;
  }
  return false;
};

const matchInvisibleRoles = (userRole, accessRoles) => {
  if (!Array.isArray(accessRoles) || typeof userRole !== "number") {
    return true;
  }
  if (accessRoles.length <= 0) {
    return true;
  }
  if (accessRoles.indexOf(userRole) >= 0) {
    return false;
  }
  return true;
};

const matchProducts = (userProducts, accessProducts) => {
  if (!Array.isArray(accessProducts) || !Array.isArray(userProducts)) {
    return true;
  }
  if (accessProducts.length <= 0 || userProducts.length <= 0) {
    return true;
  }

  for (const one of accessProducts) {
    if (userProducts.indexOf(one) >= 0) {
      return true;
    }
  }
  return false;
};
const ishrefisNotNull = (item) => {
  if (
    !(Array.isArray(item.children) && item.children.length > 0) &&
    !Boolean(item.href)
  ) {
    //console.log(item);
    return false;
  }
  return true;
};
const filterMetaData = (
  navItems: NavItemType[],
  role: number,
  branches: string[],
  company: string,
  access: any,
  products: string[]
): NavItemType[] => {
  let newNavItems: NavItemType[] = [];
  for (let i = 0; i < navItems.length; i++) {
    if (
      matchRoles(Number(role), navItems[i].visibleToRoles) &&
      matchComany(company, navItems[i].visibleToCompanies) &&
      matchBranches(branches, navItems[i].visibleToBranches) &&
      matchInvisibleRoles(Number(role), navItems[i].invisibleToRoles) &&
      matchProducts(products, navItems[i].visibleToProducts) &&
      ishrefisNotNull(navItems[i])
    ) {
      let { children, ...newItem } = navItems[i];
      if (Array.isArray(children) && children.length > 0) {
        let newChildren = filterMetaData(
          children,
          role,
          branches,
          company,
          access,
          products
        );
        if (newChildren.length > 0) {
          newNavItems.push({ ...newItem, children: newChildren });
        }
      } else {
        newNavItems.push({ ...newItem, secondaryLabel: newItem.system_code });
      }
    }
  }
  return newNavItems;
};
