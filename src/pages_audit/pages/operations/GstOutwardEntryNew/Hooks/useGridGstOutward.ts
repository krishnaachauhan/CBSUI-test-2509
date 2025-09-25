import { displayNumber } from "@acuteinfo/common-base";
import { isNumber } from "lodash";
import React, { useEffect } from "react";

const useGridGstOutward = ({ gridApi, dilogueOpen }) => {
  //* Function to update pinned row dynamically
  const updatePinnedBottomRow = () => {
    if (!gridApi) return;

    let totalChargeAmount = 0;
    let totalTaxAmount = 0;

    gridApi.current.forEachNode((node) => {
      totalChargeAmount += parseFloat(node.data?.TAXABLE_VALUE ?? 0);
      totalTaxAmount += parseFloat(node.data?.TAX_AMOUNT ?? 0);
    });

    const totalFinalAmount = totalChargeAmount + totalTaxAmount;
    console.log({ totalChargeAmount: isNumber(totalChargeAmount) });
    gridApi.current.setGridOption("pinnedBottomRowData", [
      {
        TEMP_DISP: "Total",
        TAXABLE_VALUE: displayNumber(totalChargeAmount),
        TAX_AMOUNT: displayNumber(totalTaxAmount),
        REMARKS: displayNumber(totalFinalAmount),
      },
    ]);
  };

  useEffect(() => {
    if (gridApi && dilogueOpen) {
      updatePinnedBottomRow();
    }
  }, [gridApi, dilogueOpen]);

  return {
    updatePinnedBottomRow,
  };
};

export default useGridGstOutward;
