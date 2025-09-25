import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect } from "react";
import { getStockValueTotal } from "../api";
import { getGridRowData } from "components/agGridTable/utils/helper";
import { requiredKeys } from "../advanceStockEntry";
import { usePopupContext } from "@acuteinfo/common-base";

const useAdvStockEntryGrid = ({ gridData, gridApiRef }) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const updatePinnedBottomRow = async () => {
    if (!gridApiRef?.current) return;

    let totalStockAmt = 0;
    let totalDpAmt = 0;

    const agGridData = getGridRowData(gridApiRef);

    agGridData.forEach((item) => {
      const stock_value = parseFloat(item?.STOCK_AMT ?? "0") || 0;
      const dpAmount = parseFloat(item?.DP_AMT ?? "0") || 0;

      totalStockAmt += stock_value;
      totalDpAmt += dpAmount;
    });

    const filteredGridData = Array.isArray(agGridData)
      ? agGridData.map((item) =>
          Object.fromEntries(
            requiredKeys.map((key) => {
              if (key === "INSURANCE_TYPE_CD") {
                return [key, item?.INSURANCE_TYPE_CD_VALUE ?? ""];
              }
              return [key, item?.[key] ?? ""];
            })
          )
        )
      : [];

    let apiRes: any = null;

    apiRes = await getStockValueTotal({
      COMP_CD: authState?.companyID,
      BRANCH_CD: authState?.user?.branchCode,
      WORKING_DATE: authState?.workingDate,
      STOCK_DTL: filteredGridData,
    });

    if (apiRes?.status === "999") {
      MessageBox({
        messageTitle: "ERROR",
        message: apiRes?.messageDetails ?? "",
        icon: "ERROR",
      });
    }

    gridApiRef.current.setGridOption("pinnedBottomRowData", [
      {
        STOCK_AMT: `Total Value: ${apiRes?.[0]?.STOCK_VALUE ?? ""}`,
        DP_AMT: `DP Arrived: ${apiRes?.[0]?.DRAWING_POWER ?? ""}`,
      },
    ]);
  };
  useEffect(() => {
    if (gridApiRef.current) {
      updatePinnedBottomRow();
    }
  }, [gridApiRef]);
  return {
    updatePinnedBottomRow,
    authState,
    gridApiRef,
  };
};

export default useAdvStockEntryGrid;
