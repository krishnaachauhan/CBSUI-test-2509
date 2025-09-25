import { CustomTableMetadataType } from "./tableComponent/type";
export const CashierMetaData: CustomTableMetadataType = {
  key: "CashierEntryMetaDataArrayField",
  Mainlabel: "Cashier Exchange Entry",
  fields: [
    {
      name: "DENO_LABLE",
      label: "Denomination",
      componentType: "textField",
      isReadOnly: true,
      isTotalWord: true,
      isCalculation: true,
    },
    {
      name: "AVAIL_QTY",
      label: "Available Quantity",
      componentType: "numberFormat",
      isReadOnly: true,
      align: "right",
    },
    {
      name: "AVAIL_VAL",
      label: "Available Amount",
      isCurrency: true,
      isCalculation: true,
      componentType: "amountField",
      isReadOnly: true,
      align: "right",
    },
    {
      name: "DENO_VAL",
      label: "Denomination Value",
      componentType: "amountField",
      isReadOnly: true,
      isCurrency: true,
      align: "right",
    },
    {
      name: "DENO_QTY",
      label: "Exchange Quantity",
      componentType: "numberFormat",
      isReadOnly: false,
      maxLength: 10,
      dependentValue: ["DENO_VAL", "AVAIL_QTY"],
      align: "right",
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
        updateCurrentField
      ) => {
        const AvailableQty = dependentValues?.[1];
        const CurrentValue = parseFloat(currentFieldValue || 0);
        const MessageShow = tableState?.MessageBox;
        if (CurrentValue < 0) {
          const CheckValidation = await MessageShow({
            messageTitle: "ValidationFailed",
            message: "DenominationshouldlessthanequalsDebitCashier",
            icon: "ERROR",
            buttonNames: ["Ok"],
          });
          if (CheckValidation === "Ok") {
            updateCurrentField?.("");
            setDependentValue("DENO_AMOUNT", "0.00");
          }
        } else if (CurrentValue > AvailableQty) {
          const CheckValidation = await MessageShow({
            messageTitle: "ValidationFailed",
            message: "DenominationshouldlessthanequalsDebitCashier",
            buttonNames: ["Ok"],
          });
          if (CheckValidation === "Ok") {
            updateCurrentField?.("");
            setDependentValue("DENO_AMOUNT", "0.00");
          }
        }
      },
    },
    {
      name: "DENO_AMOUNT",
      label: "Exchange Amount",
      componentType: "amountField",
      dependentValue: ["DENO_QTY"],
      isCurrency: true,
      isCalculation: true,
      isReadOnly: true,
      align: "right",
    },
  ],
};
