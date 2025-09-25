import { GridMetaDataType } from "@acuteinfo/common-base";
import { t } from "i18next";
import { GeneralAPI } from "registry/fns/functions";

export const PersonlizationQuickGridMetaData: GridMetaDataType = {
  gridConfig: {
    dense: true,
    gridLabel: "QuickView",
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
      accessor: "DOC_CD",
      columnName: "Screen Name List",
      sequence: 2,
      alignment: "left",
      componentType: "editableAutocomplete",
      enableDefaultOption: true,
      options: GeneralAPI.getquickViewList,
      _optionsKey: "getquickViewList",
      validation: (value, data, prev, next) => {
        let concatenatedArray = [prev, next].flat();
        let nextMsg: any = concatenatedArray?.some((item) => {
          if (value) {
            return value === item?.DOC_CD;
          }
          return false;
        });

        if (nextMsg) {
          return t("OptionIsAlreadyEntered");
        }
        return "";
      },
      width: 343,
      maxWidth: 450,
      minWidth: 300,
    },
  ],
};
