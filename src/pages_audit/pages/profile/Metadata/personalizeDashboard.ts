import { GridMetaDataType } from "@acuteinfo/common-base";
import { getdashboxData } from "../api";
import { t } from "i18next";

export const PersonlizationDashboardGridData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "DashboardDataCards",
    rowIdColumn: "ID",
    defaultColumnConfig: {
      width: 400,
      maxWidth: 450,
      minWidth: 300,
    },
    allowColumnReordering: true,
    disableGlobalFilter: true,
    disableSorting: false,
    hideHeader: false,
    hideFooter: true,
    disableGroupBy: true,
    allowRowSelection: false,
    containerHeight: {
      min: "calc(100vh - 400px)",
      max: "calc(100vh - 400px)",
    },
  },
  // filters: [],
  columns: [
    {
      accessor: "SR_NO",
      columnName: "SrNo",
      sequence: 1,
      alignment: "center",
      componentType: "default",
      width: 80,
      minWidth: 40,
      maxWidth: 80,
      isAutoSequence: true,
    },
    {
      accessor: "DASH_TRAN_CD",
      columnName: "Dashbox Card",
      sequence: 2,
      alignment: "left",
      componentType: "editableAutocomplete",
      enableDefaultOption: true,
      options: getdashboxData,
      _optionsKey: "getdashboxData",
      width: 300,
      maxWidth: 400,
      minWidth: 250,
      validation: (value, data, prev, next) => {
        let concatenatedArray = [prev, next].flat();
        let nextMsg: any = concatenatedArray?.some((item) => {
          if (value) {
            return value === item?.DASH_TRAN_CD;
          }
          return false;
        });

        if (nextMsg) {
          return t("OptionIsAlreadyEntered");
        }
        return "";
      },
    },
  ],
};
