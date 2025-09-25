import { useEffect, useMemo } from "react";
import { usePopupContext } from "@acuteinfo/common-base";
import useAdvStockEntryGrid from "./hooks/useAdvStockEntryGrid";
import { entryGridMetadata } from "./gridMetadata/entryGridMetadata";
import { EntryGridProps } from "./types";
import AgGridTableWrapper from "components/AgGridTableWrapper";

const EntryGrid = ({
  formMode,
  securityCd,
  gridData,
  screenPara,
  gridApiRef,
}: EntryGridProps) => {
  const { MessageBox } = usePopupContext();

  const { authState, updatePinnedBottomRow } = useAdvStockEntryGrid({
    gridData,
    gridApiRef,
  });

  const rowData = useMemo(() => {
    if (!gridData) return [];
    if (formMode === "new") {
      return gridData
        .filter((item: any) => item.ROWFLAG === "D")
        .map((item: any) => ({
          ...item,
          SECURITY_CD: securityCd ?? "",
          // INSURANCE_TYPE_CD: item?.GOOD_SR_CD,
          // INSURANCE_TYPE_CD_VALUE: item?.INSURANCE_TYPE_CD ?? "",
        }));
    }

    return gridData;
  }, [gridData, formMode, securityCd]);

  useEffect(() => {
    if (gridApiRef?.current && rowData?.length >= 0) {
      gridApiRef.current.setGridOption("rowData", rowData);
    }
  }, [rowData, gridApiRef]);

  const agGridProps = {
    id: "transactionGrid",
    columnDefs: entryGridMetadata.columns({
      authState,
      formState: {
        MessageBox,
        workingDate: authState?.workingDate ?? "",
        securityCd,
        screenPara,
        formMode,
      },
      gridApiRef,
    }),
    rowData,
  };

  return (
    <AgGridTableWrapper
      agGridProps={agGridProps}
      gridConfig={entryGridMetadata.GridMetaDataType}
      getGridApi={gridApiRef}
      gridContext={{ mode: formMode, authState }}
      hideHeader={true}
      height="calc(100vh - 500px)"
      defaultView={formMode}
      isNewButtonVisible={formMode !== "view"}
      updatePinnedBottomRow={updatePinnedBottomRow}
      handleCustomCellKeyDown={() => true}
    />
  );
};

export default EntryGrid;
