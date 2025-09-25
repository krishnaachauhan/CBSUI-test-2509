import { GridColumnType } from "@acuteinfo/common-base";
import * as Api from "../api";
export const AdditionalcollumnMetadata: GridColumnType[] = [
  {
    columnName: "selectCofiguration",
    componentType: "editableSelect",
    accessor: "DESCRIPTION",
    options: Api.GetBankIfscImportDdwn,
    _optionsKey: "GetBankIfscImportDdwn",
    sequence: 3,
    alignment: "left",
    width: 350,
    minWidth: 50,
    maxWidth: 600,
    required: true,
    validation: (values) => {
      if (!values) return "selectCofigurationRequired";
      return "";
    },
  },
];
