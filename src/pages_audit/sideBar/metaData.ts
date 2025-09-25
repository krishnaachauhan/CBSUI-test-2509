import { NavBarMetaDataType } from "components/navigation";
//import * as Roles from "pages_audit/roles";
//import * as Companies from "pages_audit/companies";

export const metaData: NavBarMetaDataType = {
  //config: {
  //   rel: "noopener noreferrer",
  //   target: "_blank",
  // },
  navItems: [
    {
      label: "Dashboard",
      href: "dashboard",
      isRouterLink: true,
      icon: "hashtag",
    },
    {
      label: "AllScreens",
      href: "all-screens",
      isRouterLink: true,
      icon: "hashtag",
    },
    {
      label: "Technical Support",
      icon: "plus",
      children: [
        {
          label: "Release Block Users",
          href: "technical-support/release-block-users",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Release Card PIN Block Users",
          href: "technical-support/release-card-block-users",
          isRouterLink: true,
          icon: "circle",
        },
      ],
    },
    {
      label: "Operation",
      icon: "plus",
      children: [
        {
          label: "Customer Activation",
          href: "operation/customer-activation",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Customer Activation Confirmation",
          href: "confirm/cust_activation",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Primary Identifier Change",
          href: "operation/primary-id-change",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Customer Searching",
          href: "operation/customer-searching",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Tag Account Request",
          href: "operation/tag-account",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Tag Card Request",
          href: "operation/tag-card",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "CIB Loan Request",
          href: "operation/cib-loan-req",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "DBR Loan Request",
          href: "operation/dbr-loan-req",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Loan Approval Detail",
          href: "operation/auth-loan-req",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Loan Closure Request",
          href: "operation/loan-cls-req",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Customer Wise Limit Modification Confirmation",
          href: "confirm/user-limit",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Password Reset Confirmation",
          href: "confirm/pass_reset",
          isRouterLink: true,
          icon: "circle",
        },
      ],
    },
    {
      label: "Configuration",
      icon: "gears",
      children: [
        {
          label: "Validation Message",
          href: "config/validation-msg",
          isRouterLink: true,
          icon: "circle",
        },
        {
          label: "Service Charge Template",
          href: "config/charge-template",
          isRouterLink: true,
          icon: "circle",
        },
      ],
    },
    // {
    //   label: "Reports",
    //   icon: "table",
    //   seperateView: true,
    //   viewName: "report",
    // },
  ],
};
