import { CustomTableMetadataType } from "../cashierExchangeEntry/tableComponent/type";

export const DenominationTableMetaData: CustomTableMetadataType = {
  key: "denoTableMetaData",
  Mainlabel: "Cash Remittance Payment",
  fields: [
    {
      name: "DENO_LABLE",
      label: "Denomination",
      componentType: "textField",
      isTotalWord: true,
      isExcess: true,
      align: "left",
      isReadOnly: true,
      isCalculation: true,
    },
    {
      name: "DENO_QTY",
      label: "Exchange Quantity",
      componentType: "numberFormat",
      align: "right",
      isReadOnly: false,
      maxLength: 10,
      __VIEW__: {
        isReadOnly: true,
      },
      dependentValue: ["DENO_VAL", "AVAIL_QTY"],
      onChange: async (
        currentFieldValue,
        rowData,
        dependentValues,
        setDependentValue,
        tableState,
        updateCurrentField
      ) => {
        const CurrentValue = parseFloat(currentFieldValue || 0);
        const DependentValue = parseFloat(dependentValues?.[0] || 0);
        const calculatedAmount = DependentValue * CurrentValue;
        if (!isNaN(calculatedAmount) && calculatedAmount) {
          setDependentValue("DENO_AMOUNT", calculatedAmount.toFixed(2));
        } else {
          setDependentValue("DENO_AMOUNT", "0.00");
        }
      },
      validation: async (
        currentFieldValue,
        rowData,
        dependentValues,
        setDependentValue,
        tableState,
        updateCurrentField,
        total,
        remaning,
        TableDatas
      ) => {
        const AvailableQty = dependentValues?.[1];
        const CurrentValue = parseFloat(currentFieldValue || 0);
        // const DependentValue = parseFloat(dependentValues?.[0] || 0);
        const MessageShow = tableState?.MessageBox;
        const FormRefData = await tableState?.FormRef?.current?.getFieldData();
        if (CurrentValue < 0 && AvailableQty === "0") {
          const CheckValidation = await MessageShow({
            messageTitle: "ValidationFailed",
            message: "DenominationshouldlessthanequalsBalanceAmount",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (CheckValidation === "Ok") {
            updateCurrentField?.("");
            setDependentValue("DENO_AMOUNT", "0.00");
          }
        } else if (currentFieldValue > 0) {
          if (Math.abs(currentFieldValue) > dependentValues?.[1]) {
            const Btn = await MessageShow({
              messageTitle: "ValidationFailed",
              message: `Denomination ${dependentValues?.[0]} should be less than or equal to Balance Amount.`,
              icon: "ERROR",
              buttonNames: ["Ok"],
            });
            if (Btn === "Ok") {
              updateCurrentField?.("");
              setDependentValue("DENO_AMOUNT", "0.00");
            }
          }
        }
        if (Boolean(CurrentValue) && remaning?.DENO_AMOUNT === 0) {
          const recordsWithDenoQty = TableDatas.filter(
            (record) =>
              record?.DENO_QTY &&
              record?.DENO_QTY !== "undefined" &&
              record?.DENO_QTY !== "" &&
              record?.DENO_QTY !== "0"
          );

          const TableDataMap = recordsWithDenoQty?.map((row) => ({
            DENO_TRAN_CD: row?.TRAN_CD || row?.DENO_TRAN_CD || "",
            DENO_QTY: row?.DENO_QTY ?? "",
            DENO_VAL: row?.DENO_VAL ?? "",
          }));
          const Request = {
            ENTERED_COMP_CD: tableState?.authState?.companyID ?? "",
            ENTERED_BRANCH_CD: tableState?.authState?.user?.branchCode ?? "",
            REMARKS: FormRefData?.REMARKS ?? "",
            DENO_DTL: [...TableDataMap],
            SCREEN_REF: tableState?.docCD ?? "",
          };
          const Check = await tableState?.MessageBox({
            message: "SaveData",
            messageTitle: "Confirmation",
            buttonNames: ["Yes", "No"],
            icon: "CONFIRM",
          });
          if (Check === "Yes") {
            let api = tableState?.currentRowData?.current?.api;
            let node = tableState?.currentRowData?.current?.node;
            node?.setData({
              ...node?.data,
              DENO_DTL: [...TableDataMap],
            });
            typeof tableState?.handleSave === "function" &&
              tableState?.handleSave(node, api);
            tableState?.handleClose();
            await api.setFocusedCell(node.rowIndex, "TO_BRANCH");
            await api.startEditingCell({
              rowIndex: node.rowIndex,
              colKey: "TO_BRANCH",
            });
          }
        }
      },
    },
    {
      name: "DENO_AMOUNT",
      label: "Exchange Amount",
      componentType: "amountField",
      dependentValue: ["DENO_QTY"],
      align: "right",
      isCurrency: true,
      isExcess: true,
      isCalculation: true,
      isReadOnly: true,
    },
    {
      name: "AVAIL_QTY",
      label: "Available Quantity",
      componentType: "numberFormat",
      align: "right",
      isReadOnly: true,
    },
    {
      name: "AVAIL_VAL",
      label: "Available Amount",
      isCurrency: true,
      isCalculation: true,
      componentType: "amountField",
      align: "right",
      isReadOnly: true,
    },
  ],
};
