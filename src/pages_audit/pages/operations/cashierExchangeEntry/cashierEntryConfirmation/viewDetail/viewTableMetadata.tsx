import { CustomTableMetadataType } from "../../tableComponent/type";

export const CashierConfirmationMetaData: CustomTableMetadataType = {
  key: "CashierEntryMetaDataArrayField",
  Mainlabel: "Cashier Exchange Entry",
  fields: [
    {
      name: "DENO_LABEL",
      label: "Denomination",
      componentType: "numberFormat",
      isReadOnly: true,
    },
    {
      name: "DENO_VALUE",
      label: "Value",
      componentType: "amountField",
      isCurrency: true,
      isReadOnly: true,
      isTotalWord: true,
      isCalculation: true,
      align: "right",
    },
    {
      name: "DENO_QTY",
      label: "Quantity",
      componentType: "numberFormat",
      isReadOnly: true,
      align: "right",
    },
    {
      name: "AMOUNT",
      label: "Amount",
      isCurrency: true,
      isCalculation: true,
      componentType: "amountField",
      isReadOnly: true,
      align: "right",
    },
  ],
};
