import { filters } from "@acuteinfo/common-base";

export const metaData = {
  title: "CustomerRegistrationReport",
  disableGroupBy: "",
  hideFooter: "",
  hideAmountIn: "",
  filters: [
    {
      accessor: "FROM_DT",
      columnName: "GeneralFromDate",
      filterComponentType: "valueDateFilter",
      gridProps: {
        xs: 12,
        md: 12,
        sm: 12,
      },
    },
    {
      accessor: "TO_DT",
      columnName: "GeneralToDate",
      filterComponentType: "valueDateFilter",
      gridProps: {
        xs: 12,
        md: 12,
        sm: 12,
      },
    },
  ],
  columns: [
    {
      columnName: "UserName",
      accessor: "CUST_NAME",
      width: 180,
      type: "default",
    },
    {
      columnName: "RoleName",
      accessor: "userRoleName",
      Filter: filters.SelectColumnFilter,
      width: 180,
    },
    {
      columnName: "Products",
      accessor: "productCode",
      width: 250,
    },
    {
      columnName: "BranchName",
      accessor: "branchName",
      Filter: filters.SelectColumnFilter,
      width: 180,
    },
    {
      columnName: "TeamRoleName",
      accessor: "teamRoleName",
      Filter: filters.SelectColumnFilter,
      width: 180,
    },
    {
      columnName: "TeamUserName",
      accessor: "teamUserFullName",
      width: 180,
    },
  ],
};
