import { GridMetaDataType } from "@acuteinfo/common-base";
import {
  getAgGridSRNo,
  getGridRowData,
  handleDeleteButtonClick,
} from "components/agGridTable/utils/helper";
import { GeneralAPI } from "registry/fns/functions";
import { handleBlurChargeAmount } from "../marginDTL";
import { ETFGeneralAPI } from "../../../../../../generalAPI/general";
import { AbcRounded } from "@mui/icons-material";
import * as API from "../../api";
import { DefaultValue } from "recoil";
import { getTFChargeCal, getTFServiceTax } from "../../api";
import { validate } from "namor";
import { handleBlurAccCode, handleBlurService } from "./crgridColumnHelper";
import { NavItem } from "reactstrap";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

export function transaction_type() {
  return [
    { value: "L", label: "CASH MARGIN" },
    { value: "F", label: "FD LIEN" },
  ];
}

export const handleDisplayMessages = async (data, formState) => {
  for (const obj of data?.MSG ?? []) {
    if (obj?.O_STATUS === "999") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "ValidationFailed",
        message: obj?.O_MESSAGE ?? "",
        icon: "ERROR",
      });
      break;
    } else if (obj?.O_STATUS === "9") {
      await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length ? obj?.O_MSG_TITLE : "Alert",
        message: obj?.O_MESSAGE ?? "",
        icon: "WARNING",
      });
      continue;
    } else if (obj?.O_STATUS === "99") {
      const buttonName = await formState.MessageBox({
        messageTitle: obj?.O_MSG_TITLE?.length
          ? obj?.O_MSG_TITLE
          : "Confirmation",
        message: obj?.O_MESSAGE ?? "",
        buttonNames: ["Yes", "No"],
        defFocusBtnName: "Yes",
        icon: "CONFIRM",
      });
      if (buttonName === "No") {
        break;
      }
    } else if (obj?.O_STATUS === "0") {
      return data;
    }
  }
};

export const marginDtlMetadata = {
  GridMetaDataType: {
    gridLabel: "Margin Details",
  },
  columns: ({ authState, formRef }) => {
    return [
      {
        columnName: "Sr.",
        alignment: "left",
        width: 40,
        minWidth: 60,
        maxWidth: 80,
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
        sortable: false,
      },
      {
        accessor: "MARGIN_TYPE",
        columnName: "Margin Type",
        sequence: 2,
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "center",
        width: 130,
        minWidth: 130,
        maxWidth: 170,
        singleClickEdit: true,
        sortable: false,
        options: transaction_type,
        displayComponentType: "DisplaySelectCell",
        // (params) => {
        //   let rawValue = params?.data?.TYPE_CD || "";
        //   const trimmedValue = rawValue.trim();

        //   const matchedOption = transaction_type().find(
        //     (opt) => opt.value.trim() === trimmedValue
        //   );

        //   return matchedOption?.label || trimmedValue;
        // },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          const selectedType =
            value && typeof value === "object"
              ? value?.value?.trim?.() ?? ""
              : String(value ?? "").trim();

          const sdc = node?.data?.SDC ?? "";
          if (["NEFT", "DD"].includes(selectedType) && sdc !== "DISB") {
            context?.MessageBox({
              message:
                "Transaction Type NEFT/DD is not allowed except in Disbursement Entry.",
              messageTitle: "Validation Failed",
              icon: "ERROR",
            });
            onValueChange("");
            return;
          }

          // if (["NFET", "DD"].includes(selectedType)) {
          //   node.setData({
          //     ...node.data,
          //     OPP_BRANCH_CD: "",
          //     OPP_ACCT_TYPE: "",
          //     OPP_ACCT_CD: "",
          //     OPP_ACCT_NM: "",
          //     OPP_ACCT_TYPE_ID: "",
          //     OPP_BRANCH_CD_ID: "",
          //   });
          // } else {
          //   node.setData({
          //     ...node.data,
          //     FROM_INST: "",
          //     FROM_INST_ID: "",
          //   });
          // }

          context.updatePinnedBottomRow();
        },
        name: "DISPLY_MARGIN_TYPE",
      },
      {
        accessor: "FD_BRANCH_CD",
        columnName: "Branch Code",
        sequence: 6,
        alignment: "left",
        headerClass: "required",
        width: 120,
        minWidth: 150,
        maxWidth: 220,
        componentType: "autocomplete",
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        options: (data) => {
          return GeneralAPI.getBranchCodeList({
            COMP_CD: authState?.companyID || "",
          });
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Please enter Branch Code"] }],
        },
        name: "FD_BRANCH_CD",
      },
      {
        accessor: "FD_ACCT_TYPE",
        columnName: "Acct. Type",
        sequence: 7,
        alignment: "left",
        headerClass: "required",
        width: 160,
        minWidth: 160,
        maxWidth: 200,
        sortable: false,
        isReadOnly: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        shouldExclude: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        componentType: "autocomplete",
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        options: () => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "",
          });
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Please enter Acct. Type"] }],
        },
        name: "FD_ACCT_TYPE",
      },
      {
        accessor: "FD_ACCT_CD",
        columnName: "Acct. Code",
        sequence: 8,
        alignment: "left",
        headerClass: "required",
        width: 150,
        minWidth: 150,
        maxWidth: 200,
        sortable: false,
        isReadOnly: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        shouldExclude: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        displayComponentType: "DisplayCell",
        singleClickEdit: true,
        componentType: "NumberFormat",
        FormatProps: {
          isNumber: true,
        },
        // postValidationSetCrossAccessorValues: async (
        //   value: any,
        //   node: any,
        //   api: any,
        //   field: any,
        //   onValueChange: any,
        //   formState: any
        // ) =>
        //   handleBlurAccCode(
        //     value,
        //     node,
        //     api,
        //     field,
        //     onValueChange,
        //     formState,
        //     authState
        //   ),
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Please enter Acct. Code"] }],
        },
      },
      {
        accessor: "ACCT_NM",
        columnName: "Acct. Name",
        sequence: 9,
        alignment: "left",
        width: 250,
        minWidth: 250,
        maxWidth: 250,
        sortable: false,
        displayComponentType: "DisplayCell",
        isReadOnly: () => true,
        shouldExclude: ({ data }) =>
          ["NEFT", "DD"].includes(data?.TYPE_CD?.trim()),
        componentType: "NumberFormat",
        FormatProps: {
          uppercase: true,
        },
      },
      {
        accessor: "FD_NO",
        columnName: "FD No",
        sequence: 9,
        alignment: "left",
        width: 250,
        minWidth: 250,
        maxWidth: 250,
        sortable: false,
        displayComponentType: "DisplayCell",
        isReadOnly: ({ data }) =>
          ["CASH MARGIN"].includes(data?.MARGIN_TYPE?.trim()),
        dependentFields: ["MARGIN_TYPE"],
        shouldExclude: ({ data }) =>
          ["CASH MARGIN"].includes(data?.MARGIN_TYPE?.trim()),
        componentType: "NumberFormat",
        FormatProps: {
          uppercase: true,
        },
      },
      {
        accessor: "MATURITY_DT",
        columnName: "Maturity Date",
        sequence: 9,
        alignment: "left",
        width: 250,
        minWidth: 250,
        maxWidth: 250,
        sortable: false,
        displayComponentType: "DisplayCell",
        isReadOnly: true,
        componentType: "DatePicker",
        FormatProps: {
          uppercase: true,
        },
      },
      {
        accessor: "MARGIN_AMOUNT",
        columnName: "Amount",
        sequence: 3,
        alignment: "right",
        headerClass: "required",
        width: 130,
        minWidth: 180,
        maxWidth: 200,
        singleClickEdit: true,
        sortable: false,
        isReadOnly: ({ data }) => ["DISB", "INT"].includes(data?.SDC?.trim()),
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        // postValidationSetCrossAccessorValues: async (
        //   value: any,
        //   node: any,
        //   api: any,
        //   field: any,
        //   onValueChange: any,
        //   context: any
        // ) => {
        //   const rowData = await formRef?.current?.getFieldData();
        //   const gstResponse = await API.validateDisbtrnAmt({
        //     BASE_BRANCH_CD: authState?.user?.branch ?? "",
        //     LOGIN_BRANCH_CD: authState?.user?.branchCode ?? "",
        //     COMP_CD: authState?.companyID,
        //     BRANCH_CD: authState?.user?.branchCode ?? "",
        //     WORKING_DATE: authState?.workingDate ?? "",
        //     ACCT_TYPE: rowData?.ACCT_TYPE,
        //     ACCT_CD: rowData?.ACCT_CD,
        //     NEW_AMT: value,
        //     TRN_AMT: value,
        //     SDC: rowData?.SDC ?? "",
        //   });
        //   node.setData({
        //     ...node.data,
        //     GST: gstResponse?.[0]?.GST,
        //   });
        // },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
        },

        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["Please enter Transaction Amount"] },
          ],
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Delete",
        sequence: 11,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        sortable: false,
        cellClass: "numeric-cell-text-alignment",
        pinned: "right",
        isReadOnly: true,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
        },
        shouldExclude: (params) => {
          if (params?.data?.SDC === "DISB") {
            return true;
          }
          return false;
        },
      },
    ];
  },
};

export const lcChargeDetailMetadata = {
  GridMetaDataType: {
    gridLabel: "Charges Details",
  },
  columns: ({ authState, formRef }) => {
    return [
      {
        accessor: "SR_CD",
        columnName: "Sr.No",
        alignment: "left",
        width: 70,
        minWidth: 60,
        maxWidth: 80,
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
        sortable: false,
      },
      {
        name: "DISP_CHARGE_TYPE",
        accessor: "CHARGE_TYPE",
        columnName: "Type",
        sequence: 2,
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "center",
        width: 130,
        minWidth: 130,
        maxWidth: 170,
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        isOption: true,
        isVisible: true,
        isReadOnly: (value) => {
          const chargeType = value?.data?.CHARGE_TYPE;
          return ["S", "K"].includes(chargeType);
        },
        options: async (data) => {
          const apiOptions = await ETFGeneralAPI.GetFPMiscValue({
            CATEG_CD: "CHARGE_TYPE_LC",
          });
          return apiOptions;

          // const extraOptions = [
          //   { value: "S", label: "GST" },
          //   { value: "K", label: "Contingen" },
          // ];
          // return [...apiOptions, ...extraOptions];
        },
        _optionsKey: "chargeType",
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          node.setData({
            ...node.data,
            AMT_TYPE: "",
            CHARGE_SR_CD: "",
            CHARGE_SR_CD_ID: "",
            CR_BRANCH_CD: "",
            CR_ACCT_TYPE: "",
            CR_ACCT_CD: "",
            CR_ACCT_NM: "",
            CR_ACCT_TYPE_ID: "",
            CR_BRANCH_CD_ID: "",
            AMOUNT: "",
            NARRATION: "",
          });

          context.updatePinnedBottomRow();
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Select a Type"] }],
        },
      },
      {
        name: "AMT_TYPE",
        accessor: "AMT_TYPE",
        columnName: "Amount Type",
        sequence: 2,
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "center",
        width: 130,
        minWidth: 130,
        maxWidth: 170,
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        isOption: true,
        options: async (data) => {
          const amountType = await ETFGeneralAPI.GetFPMiscValue({
            CATEG_CD: "AMT_TYPE",
          });
          return amountType;
        },
        dependentFields: ["CHARGE_TYPE"],
        isReadOnly: (value, dependentFieldsValues, formState) => {
          const chargeType = value?.data?.CHARGE_TYPE;
          return !["3", "6"].includes(chargeType);
        },
      },
      {
        name: "CHARGE_SR_CD_ID",
        accessor: "CHARGE_SR_CD",
        columnName: "Code",
        sequence: 6,
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "center",
        width: 130,
        minWidth: 130,
        maxWidth: 170,
        singleClickEdit: true,
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        isOption: true,
        options: async () => {
          const ChargeCode = await GeneralAPI.getChargeCodeList();
          return ChargeCode;
        },
        validationRun: "all",
        dependentFields: ["CHARGE_TYPE", "NARRATION"],

        postValidationSetCrossAccessorValues: async (
          value,
          node,
          api,
          field,
          onValueChange,
          context
        ) => {
          const narration = value?.NARRATION || value?.CHARGE_DESC || "";

          const authState = context?.gridContext?.authState;
          const gridApiRef = context?.gridContext?.gridApiRef;

          const apiReq1 = {
            A_COMP_CD: authState?.companyID,
            A_BRANCH_CD: authState?.user?.branchCode,
            A_BRANCH_BASE: authState?.user?.baseBranchCode,
            A_CUST_ID: context?.gridContext?.rowData?.CUSTOMER_ID,
            A_FUNC_ID: context?.gridContext?.rowData?.function_id,
            A_AMOUNT: context?.gridContext?.data?.[0]?.A_AMOUNT,
            A_DOC_TRAN_CD: context?.gridContext?.data?.[0]?.LC_TRAN_CD?.TRAN_CD,
            A_TODATE: authState?.workingDate,
            A_ROUND: "Y",
            A_SPECIAL: "S",
            A_CHARGE_CD: value?.CHARGE_CD,
            A_TAX_TYPE: "S",
          };

          const chargeCalRes = await getTFChargeCal(apiReq1);
          const convAmt = chargeCalRes?.[0]?.AMOUNT ?? 0;

          node.setData({
            ...node.data,
            NARRATION: narration,
            AMOUNT: convAmt,
          });

          const apiReq2 = {
            A_COMP_CD: authState?.companyID ?? "",
            A_BRANCH_CD: authState?.user?.branchCode ?? "",
            A_BRANCH_BASE: authState?.user?.baseBranchCode,
            A_ASON_DT: authState?.workingDate ?? "",
            A_AMOUNT: String(convAmt ?? 0),
            A_CONV_AMT: 0,
            A_BRANCH_CODE: "",
            A_ACCT_TYPE: "",
            A_ACCT_CD: "",
          };

          const serviceTaxData = await getTFServiceTax(apiReq2);

          let gridData = getGridRowData(gridApiRef)?.filter(
            (row) => row?.CHARGE_TYPE !== "S"
          );

          if (serviceTaxData) {
            gridData = [...gridData, ...serviceTaxData];
          }

          gridApiRef?.current?.setGridOption("rowData", gridData);
        },

        isReadOnly: (value) => {
          const chargeType = value?.data?.CHARGE_TYPE;
          return !["C"].includes(chargeType);
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Select a Code"] }],
        },
      },

      {
        accessor: "GST_AC",
        columnName: "GST Dr.",
        headerTooltip: "GST Dr.",
        alignment: "center",
        minWidth: 70,
        maxWidth: 100,
        singleClickEdit: true,
        componentType: "agCheckboxCellEditor",
        isCheckBox: true,
        dependentFields: ["CHARGE_TYPE"],
        isReadOnly: (value, dependentFieldsValues, formState) => {
          const chargeType = value?.data?.CHARGE_TYPE;
          return ["S", "K", "C"].includes(chargeType);
        },
        cellRendererSelector: (params) => {
          const isPinned = params.node?.rowPinned;

          if (!isPinned) {
            return { component: "agCheckboxCellRenderer" };
          }
          return (params) => "";
        },
        isCheckbox: true,
        postValidationSetCrossAccessorValues: async ({
          value,
          data,
          context,
        }) => {
          const authState = context?.gridContext?.authState;

          const apiReq = {
            A_COMP_CD: authState?.companyID ?? "",
            A_BRANCH_CD: authState?.user?.branchCode ?? "",
            A_BRANCH_BASE: authState?.user?.baseBranchCode,
            A_ASON_DT: authState?.workingDate ?? "",
            A_AMOUNT: data?.AMOUNT ?? "",
            A_CONV_AMT: 0,
            A_BRANCH_CODE: "",
            A_ACCT_TYPE: "",
            A_ACCT_CD: "",
          };

          const chargeType = data?.CHARGE_TYPE;

          const serviceTaxData = await getTFServiceTax(apiReq);
          if (["3", "6"].includes(chargeType)) {
            if (
              !data?.AMOUNT ||
              Number(data?.AMOUNT) === 0 ||
              !serviceTaxData
            ) {
              const gridData = getGridRowData(
                context?.gridContext?.gridApiRef
              )?.filter((item) => item?.CHARGE_TYPE !== "S");

              context?.gridContext?.gridApiRef?.current?.setGridOption(
                "rowData",
                [...gridData]
              );
              return;
            }
          }
          if (serviceTaxData) {
            context?.gridContext?.gridApiRef?.current?.setGridOption(
              "rowData",
              [
                ...getGridRowData(context?.gridContext?.gridApiRef),
                serviceTaxData,
              ]
            );

            return {
              CR_BRANCH_CD: serviceTaxData?.CR_BRANCH_CD,
              CR_ACCT_TYPE: serviceTaxData?.CR_ACCT_TYPE,
              CR_ACCT_CD: serviceTaxData?.CR_ACCT_CD,
            };
          }
        },
      },
      {
        accessor: "CR_BRANCH_CD",
        columnName: "Cr. Branch Code",
        sequence: 6,
        alignment: "left",
        headerClass: "required",
        width: 120,
        minWidth: 150,
        maxWidth: 220,
        componentType: "autocomplete",
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Select a Cr. Branch Code"] }],
        },
        options: (data) => {
          return GeneralAPI.getBranchCodeList({
            COMP_CD: authState?.companyID || "",
          });
        },
        dependentFields: ["CHARGE_TYPE"],
        isReadOnly: (value, dependentFieldsValues, formState) => {
          // return value?.data?.CHARGE_TYPE !== "6";
          const chargeType = value?.data?.CHARGE_TYPE;
          return ["K", "S", "T", "C", "L"].includes(chargeType);
        },
        name: "CR_BRANCH_CD_ID",
      },
      {
        accessor: "CR_ACCT_TYPE",
        columnName: "Cr. Account Type",
        sequence: 6,
        alignment: "left",
        headerClass: "required",
        width: 120,
        minWidth: 150,
        maxWidth: 220,
        componentType: "autocomplete",
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Select a Cr. Account Type"] }],
        },
        options: () => {
          return GeneralAPI.get_Account_Type({
            COMP_CD: authState?.companyID,
            BRANCH_CD: authState?.user?.branchCode,
            USER_NAME: authState?.user?.id,
            DOC_CD: "",
          });
        },
        dependentFields: ["CHARGE_TYPE"],
        isReadOnly: (value, dependentFieldsValues, formState) => {
          // return value?.data?.CHARGE_TYPE !== "6";
          const chargeType = value?.data?.CHARGE_TYPE;
          return ["K", "S", "T", "C", "L"].includes(chargeType);
        },
        name: "CR_ACCT_TYPE_ID",
      },
      {
        accessor: "CR_ACCT_CD",
        columnName: "Cr. Account Code",
        sequence: 6,
        alignment: "left",
        headerClass: "required",
        width: 120,
        minWidth: 150,
        maxWidth: 220,
        componentType: "NumberFormat",
        FormatProps: {
          isNumber: true,
        },
        sortable: false,
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Select a Cr. Account Code"] }],
        },
        dependentFields: ["CHARGE_TYPE"],
        isReadOnly: (value, dependentFieldsValues, formState) => {
          const chargeType = value?.data?.CHARGE_TYPE;
          return ["K", "S", "T", "C", "L"].includes(chargeType);
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          formState: any
        ) =>
          handleBlurAccCode(
            value,
            node,
            api,
            field,
            onValueChange,
            formState,
            authState
          ),
      },
      {
        accessor: "CR_ACCT_NM",
        columnName: "Cr. A/C Name",
        sequence: 6,
        alignment: "left",
        headerClass: "required",
        width: 300,
        minWidth: 200,
        maxWidth: 400,
        componentType: "textField",
        sortable: false,
        singleClickEdit: true,
        isReadOnly: () => true,
      },
      {
        accessor: "CURRENCY_CD",
        columnName: "CCY",
        sequence: 6,
        alignment: "left",
        headerClass: "required",
        width: 120,
        minWidth: 150,
        maxWidth: 220,
        componentType: "textField",
        sortable: false,
        // defaultValue: "INR",
        displayComponentType: "DisplaySelectCell",
        singleClickEdit: true,
        name: "CURRENCY_CD",
        isReadOnly: () => true,
      },
      {
        accessor: "AMOUNT",
        columnName: "Amount",
        sequence: 3,
        alignment: "right",
        headerClass: "required",
        width: 130,
        minWidth: 180,
        maxWidth: 200,
        singleClickEdit: true,
        sortable: false,
        componentType: "amountField",
        displayComponentType: "DisplayCurrencyCell",
        cellClass: "currency",
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
        },
        dependentFields: ["CHARGE_TYPE"],
        isReadOnly: (value, dependentFieldsValues, formState) => {
          const chargeType = value?.data?.CHARGE_TYPE;
          return ["S", "K"].includes(chargeType);
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          const authState = context?.gridContext?.authState;

          const chargeType = node?.data?.CHARGE_TYPE;
          const amount = node?.data?.AMOUNT;

          const apiReq = {
            A_COMP_CD: authState?.companyID ?? "",
            A_BRANCH_CD: authState?.user?.branchCode ?? "",
            A_BRANCH_BASE: authState?.user?.baseBranchCode,
            A_ASON_DT: authState?.workingDate ?? "",
            A_AMOUNT: String(amount ?? 0),
            A_CONV_AMT: 0,
            A_BRANCH_CODE: "",
            A_ACCT_TYPE: "",
            A_ACCT_CD: "",
          };

          if (chargeType === "C") {
            const serviceTaxData = await getTFServiceTax(apiReq);

            const gridData = getGridRowData(
              context?.gridContext?.gridApiRef
            )?.filter((item) => item?.CHARGE_TYPE !== "S");

            context?.gridContext?.gridApiRef?.current?.setGridOption(
              "rowData",
              [...gridData, ...serviceTaxData]
            );
          } else if (chargeType === "3" || chargeType === "6") {
            return;
          }
        },
      },
      {
        accessor: "NARRATION",
        columnName: "Narration",
        sequence: 3,
        alignment: "right",
        headerClass: "required",
        width: 3000,
        minWidth: 180,
        maxWidth: 400,
        singleClickEdit: true,
        sortable: false,
        componentType: "textField",
        dependentFields: ["CHARGE_TYPE", "CHARGE_SR_CD"],
        isReadOnly: (value, dependentFieldsValues, formState) => {
          const chargeType = value?.data?.CHARGE_TYPE;
          return ["S", "K"].includes(chargeType);
        },
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["Enter a Narration"] }],
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Delete",
        sequence: 11,
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        sortable: false,
        cellClass: "numeric-cell-text-alignment",
        pinned: "right",
        isReadOnly: true,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
        },
        shouldExclude: (params) => {
          const chargeType = params?.data?.CHARGE_TYPE;
          if (chargeType === "S" || chargeType === "K") {
            return true;
          }
          return false;
        },
      },
    ];
  },
};
