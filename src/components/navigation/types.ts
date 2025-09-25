import { useStylesBootstrapNav } from "./style";

export type hrefTarget = "_blank" | "_parent" | "_self" | "_top";

export interface NavItemType {
  label: string;
  secondaryLabel?: string;
  href?: string;
  isRouterLink?: boolean;
  rel?: string;
  target?: hrefTarget;
  children?: NavItemType[];
  navigationProps?: any;
  icon?: any;
  iconPosition?: "before" | "after";
  seperateView?: boolean;
  viewName?: string;
  group?: string;
  passNavigationPropsAsURLParmas?: boolean;
  visibleToRoles?: number[];
  visibleToBranches?: string[];
  visibleToCompanies?: string[];
  invisibleToRoles?: number[];
  visibleToProducts?: string[];
  user_code?: string;
  system_code?: string;
}

export interface NavBarMetaDataType {
  config?: {
    rel: string;
    target: hrefTarget;
  };
  navItems: NavItemType[];
}

export interface NestedNavItemProps {
  item: NavItemType;
  classes: ReturnType<typeof useStylesBootstrapNav>;
  direction?: string;
}

export interface NavRendererType {
  metaData: NavBarMetaDataType;
}

export interface SideBarRendererType {
  metaData: NavBarMetaDataType;
  handleDrawerOpen: Function;
  drawerOpen: boolean;
  setView?: any;
  slimSize?: boolean;
  setNewFilterData?: any;
  setNewFilterView?: any;
  isFromSeparetView?: boolean;
}
