import { GridMetaDataType } from "@acuteinfo/common-base";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import FavoriteIcon from "@mui/icons-material/Favorite";

export const AllScreensGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "AllScreens",
    rowIdColumn: "DOC_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 30, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "67vh",
      max: "67vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  filters: [
    {
      accessor: "DOC_TITLE",
      columnName: "Screen Name",
      filterComponentType: "valueFilter",
      gridProps: {
        xs: 12,
        md: 12,
        sm: 12,
      },
    },
  ],
  columns: [
    {
      accessor: "FAVOURITE",
      columnName: "#",
      sequence: 1,
      alignment: "left",
      componentType: "customIconCell",
      width: 50,
      minWidth: 50,
      maxWidth: 50,
      activeIcon: {
        icon: <FavoriteIcon htmlColor="red" />,
        tooltip: "Remove from favorite's",
      },
      inActiveIcon: {
        icon: <StarOutlineIcon htmlColor="#c4ad00" />,
        tooltip: "Add to favorite",
      },
    },
    {
      accessor: "DOC_TITLE",
      columnName: "Screen Name",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 700,
      minWidth: 400,
      maxWidth: 700,
    },
    {
      accessor: "DOC_CD",
      columnName: "User Code",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 120,
      maxWidth: 200,
    },
    {
      accessor: "USER_DEFINE_CD",
      columnName: "System Code",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 120,
      maxWidth: 200,
    },
    {
      accessor: "OPEN",
      columnName: "",
      componentType: "buttonRowCell",
      buttonLabel: "View Query",
      sequence: 14,
      alignment: "center",
      width: 120,
      minWidth: 100,
      maxWidth: 100,
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        if (original?.IS_REPORTFLAG === "Y") {
          return false;
        } else {
          return true;
        }
      },
    },
  ],
};

export const FavScreensGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "AllScreens",
    rowIdColumn: "DOC_CD",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableSorting: false,
    hideHeader: true,
    disableGroupBy: true,
    enablePagination: true,
    pageSizes: [15, 30, 50],
    defaultPageSize: 15,
    containerHeight: {
      min: "67vh",
      max: "67vh",
    },
    allowFilter: false,
    allowColumnHiding: false,
    allowRowSelection: false,
    isCusrsorFocused: true,
  },
  filters: [
    {
      accessor: "DOC_TITLE",
      columnName: "Screen Name",
      filterComponentType: "valueFilter",
      gridProps: {
        xs: 12,
        md: 12,
        sm: 12,
      },
    },
  ],
  columns: [
    {
      accessor: "DOC_TITLE",
      columnName: "Screen Name",
      sequence: 1,
      alignment: "left",
      componentType: "default",
      width: 700,
      minWidth: 400,
      maxWidth: 700,
    },
    {
      accessor: "DOC_CD",
      columnName: "User Code",
      sequence: 2,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 120,
      maxWidth: 200,
    },
    {
      accessor: "USER_DEFINE_CD",
      columnName: "System Code",
      sequence: 3,
      alignment: "left",
      componentType: "default",
      width: 180,
      minWidth: 120,
      maxWidth: 200,
    },
    {
      accessor: "OPEN",
      columnName: "",
      componentType: "buttonRowCell",
      buttonLabel: "View Query",
      sequence: 14,
      alignment: "center",
      width: 120,
      minWidth: 100,
      maxWidth: 100,
      shouldExclude: (initialValue, original, prevRows, nextRows) => {
        console.log(original);

        if (original?.IS_REPORTFLAG === "Y") {
          return false;
        } else {
          return true;
        }
      },
    },
  ],
};
