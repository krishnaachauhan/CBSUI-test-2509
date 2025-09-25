import {
  getAgGridSRNo,
  handleDeleteButtonClick,
  updateNodeDataAndFocus,
} from "components/agGridTable/utils/helper";
import { getCustDocumentOpDtl } from "pages_audit/pages/operations/c-kyc/api";
import * as API from "../../../../api";
import { t } from "i18next";
import { handleDisplayMessages } from "components/utilFunction/function";
export const controllingPersonAgGridMetadata = {
  GridMetaDataType: {
    gridLabel: "",
  },
  columns: ({ authState, formState, isModal }) => {
    return [
      {
        accessor: "CONFIRMED",
        isVisible: false,
      },
      {
        columnName: "Sr.",
        alignment: "left",
        width: 50,
        minWidth: 50,
        maxWidth: 50,
        displayComponentType: getAgGridSRNo,
        isReadOnly: true,
        sortable: false,
      },
      {
        name: "DISPLY_RELATED_PERSON_TYPE",
        accessor: "RELATED_PERSON_TYPE",
        columnName: "Type*",
        headerTooltip: "Type",
        headerClass: "required",
        componentType: "autocomplete",
        alignment: "left",
        minWidth: 200,
        maxWidth: 300,
        singleClickEdit: true,
        displayComponentType: "DisplaySelectCell",
        isReadOnly: (params) => {
          if (
            (params?.node?.data?.ACTIVE === false ||
              params?.node?.data?.CONFIRMED === true) &&
            params?.node?.data?.ROW_EXIST === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          if (!value?.value) return;

          if (formState?.BIRTH_DT === "") {
            const buttonName = await formState?.MessageBox({
              messageTitle: "ValidationFailed",
              message: "PleaseEnterInceptionDate",
              buttonNames: ["Ok"],
              icon: "ERROR",
            });
            if (buttonName === "Ok") {
              updateNodeDataAndFocus(
                node,
                { RELATED_PERSON_TYPE: "", DISPLY_RELATED_PERSON_TYPE: "" },
                api,
                { focusedAccessor: "RELATED_PERSON_TYPE", isFieldFocused: true }
              );
            }
          }
        },
        isOption: true,
        schemaValidation: {
          type: "string",
          rules: [
            { name: "required", params: ["RelatedPersonTypeIsRequired"] },
          ],
        },
        options: async () =>
          await API.getPMISCData("CKYC_RELAT_PERS", { CUST_TYPE: "C" }),
      },
      {
        accessor: "REF_CUST_ID",
        columnName: "RefCustID",
        headerTooltip: "RefCustID",
        alignment: "right",
        minWidth: 100,
        maxWidth: 200,
        singleClickEdit: true,
        componentType: "NumberFormat",
        displayComponentType: "DisplayCell",
        schemaValidation: {
          type: "string",
          rules: [{ name: "required", params: ["RefCustIDIsRequired"] }],
        },
        isReadOnly: (params) => {
          if (
            (params?.node?.data?.ACTIVE === false ||
              params?.node?.data?.CONFIRMED === true) &&
            params?.node?.data?.ROW_EXIST === "Y"
          ) {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossAccessorValues: async (
          value: any,
          node: any,
          api: any,
          field: any,
          onValueChange: any,
          context: any
        ) => {
          if (value) {
            const rowData: any[] = [];
            api.forEachNode((rowNode: any) => {
              if (rowNode.id === node.id) {
                return;
              }
              rowData.push({
                REF_CUST_ID: rowNode.data?.REF_CUST_ID ?? "",
                ACTIVE: Boolean(rowNode.data?.ACTIVE) ? "Y" : "N",
              });
            });
            const relatedPersonTypeValue = node?.data?.RELATED_PERSON_TYPE;
            if (!Boolean(relatedPersonTypeValue)) {
              let buttonName = await context?.MessageBox({
                messageTitle: t("ValidationFailed"),
                message: t("PleaseSelectRelatedPerson"),
                buttonNames: ["Ok"],
                icon: "ERROR",
              });

              if (buttonName === "Ok") {
                node.setData({
                  ...node.data,
                  REF_CUST_ID: "",
                });
              }
              return;
            }
            formState?.handleButtonDisable(true);
            const gstApiData = await API.getCkycRefCusDtl({
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              CUSTOMER_ID: formState?.state?.customerIDctx ?? "",
              REF_CUST_ID: value ?? "",
              WORKING_DATE: authState?.workingDate ?? "",
              USERNAME: authState?.user?.name ?? "",
              REF_CUST_DTL: rowData ?? [],
            });
            formState?.handleButtonDisable(false);

            if (gstApiData?.status === "999") {
              const btnName = await context.MessageBox({
                messageTitle: "ValidationFailed",
                message: gstApiData?.messageDetails ?? "",
                icon: "ERROR",
                buttonNames: ["Ok"],
              });

              if (btnName === "Ok") {
                await onValueChange("");
                await updateNodeDataAndFocus(
                  node,
                  { [field]: "", REF_CUSTOMER_TYPE: "", REF_CUST_NM: "" },
                  api,
                  {
                    isFieldFocused: true,
                    focusedAccessor: field,
                  }
                );
              }
              return;
            }

            const messages = gstApiData?.[0]?.MSG ?? [];
            let returnVal;
            if (messages?.length > 0) {
              const response = await handleDisplayMessages(
                messages,
                context?.MessageBox
              );

              if (Object.keys(response).length > 0) {
                returnVal = gstApiData;
              } else {
                returnVal = "";
              }
            }
            if (!returnVal) {
              await onValueChange("");
              await updateNodeDataAndFocus(
                node,
                { [field]: "", REF_CUSTOMER_TYPE: "", REF_CUST_NM: "" },
                api,
                {
                  isFieldFocused: true,
                  focusedAccessor: field,
                }
              );
            } else {
              await updateNodeDataAndFocus(node, {
                REF_CUSTOMER_TYPE: gstApiData?.[0]?.CUSTOMER_TYPE,
                REF_CUST_NM: gstApiData?.[0]?.REF_ACCT_NM,
              });
            }
          }
        },
        FormatProps: {
          isNumber: true,
          allowNegative: false,
          allowLeadingZeros: false,
          allowDecimal: false,
          isAllowed: (values) => {
            return !Boolean(
              values.value.startsWith("0") || values?.value?.length > 12
            );
          },
        },
      },
      {
        accessor: "REF_CUST_NM",
        columnName: "Ref Cust Name",
        alignment: "left",
        width: 250,
        minWidth: 200,
        maxWidth: 280,
        componentType: "NumberFormat",
        singleClickEdit: true,
        displayComponentType: "DisplayCell",
        isReadOnly: true,
        FormatProps: {
          allowAlphaNumeric: true,
        },
      },
      {
        isCheckBox: true,
        accessor: "ACTIVE",
        columnName: "",
        headerTooltip: "Active",
        alignment: "center",
        minWidth: 40,
        maxWidth: 40,
        singleClickEdit: true,
        componentType: "agCheckboxCellEditor",
        displayComponentType: "agCheckboxCellRenderer",
        shouldExclude: (params) => {
          if (params.node.data.ROW_EXIST === "Y") {
            return false;
          } else {
            return true;
          }
        },
        isReadOnly: (params) => {
          if (
            params?.node?.data?.ACTIVE !== true ||
            params.context?.gridContext?.mode === "view"
          ) {
            return true;
          } else {
            return false;
          }
        },
        postValidationSetCrossAccessorValues: async ({
          newValue,
          node,
          api,
          context,
        }) => {
          if (newValue === false || newValue === "N") {
            let buttonName = await context?.MessageBox({
              messageTitle: "Confirmation",
              message: "RelatedPersonInActiveConfmMessage",
              buttonNames: ["Yes", "No"],
              icon: "CONFIRM",
            });
            if (buttonName === "Yes") {
              node.setData({
                ...node.data,
                ACTIVE: false,
              });
              node.setDataValue("REMARKS", "Inactive");
            }
            if (buttonName === "No") {
              node.setData({
                ...node.data,
                ACTIVE: true,
              });
            }
          }
        },
      },
      {
        accessor: "REMARKS",
        columnName: "Active",
        headerTooltip: "",
        minWidth: 120,
        maxWidth: 120,
        isReadOnly: true,
        shouldExclude: (params) => {
          if (params.node?.data?.ROW_EXIST === "Y") {
            return false;
          } else {
            return true;
          }
        },
      },

      {
        accessor: "VIEW_CUST_DTK",
        columnName: "",
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 150,
        minWidth: 170,
        maxWidth: 180,
        sortable: false,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        cellRendererParams: {
          buttonName: "View Customer Details",
          disabled: (params) => {
            if (
              formState?.state?.formmodectx === "view" ||
              !params?.node?.data?.REF_CUSTOMER_TYPE
            ) {
              return true;
            } else {
              return false;
            }
          },
          handleButtonClick: (params) => {
            const customEvent = new CustomEvent("my-global-event", {
              detail: {
                message: "Button clicked in deep component",
                value: params?.node?.data,
              },
            });

            window.dispatchEvent(customEvent);
          },
        },
      },
      {
        accessor: "DELETE_ROW",
        columnName: "Delete",
        alignment: "center",
        displayComponentType: "CustomButtonCellEditor",
        width: 150,
        minWidth: 120,
        maxWidth: 180,
        sortable: false,
        cellClass: "numeric-cell-text-alignment",
        isReadOnly: true,
        cellRendererParams: {
          buttonName: "Remove",
          handleButtonClick: handleDeleteButtonClick,
        },

        shouldExclude: (params) => {
          if (
            formState?.state?.formmodectx === "view" ||
            params?.node?.data?.ROW_EXIST === "Y"
          ) {
            return true;
          }
          return false;
        },
      },
    ];
  },
};
