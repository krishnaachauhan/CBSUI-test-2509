import React, { useCallback } from "react";
import { GstOutwardColumn } from "./gstOutwardColumn";
import useGridGstOutward from "../Hooks/useGridGstOutward";
import AgGridTableWrapper from "components/AgGridTableWrapper";

interface GstOutWardTableDetailsProps {
  myRef?: React.RefObject<any>;
  authState?: any;
  dilogueOpen?: any;
  gridApi?: any;
  defaultView?: any;
  setSaveButton?: any;
  isLoading?: any;
  data?: any;
  dateData?: any;
}

const GstOutWardTableDetails: React.FC<GstOutWardTableDetailsProps> =
  React.memo(
    ({
      myRef,
      authState,
      dilogueOpen,
      gridApi,
      defaultView,
      setSaveButton,
      isLoading,
      data,
      dateData,
    }) => {
      const { updatePinnedBottomRow } = useGridGstOutward({
        gridApi,
        dilogueOpen,
      });

      const agGridProps = {
        id: "gst-outward-table",
        columnDefs: GstOutwardColumn.columns(
          authState,
          myRef,
          setSaveButton,
          defaultView
        ),
        rowData: data || [{}],
        pinnedBottomRowData: [],
        onCellValueChanged: updatePinnedBottomRow,
      };

      return (
        <AgGridTableWrapper
          agGridProps={agGridProps}
          gridConfig={GstOutwardColumn.gridConfig}
          getGridApi={gridApi}
          autoSelectFirst={true}
          defaultView={defaultView}
          loading={isLoading}
          updatePinnedBottomRow={updatePinnedBottomRow}
          gridContext={{
            dateData: dateData,
          }}
          isNewButtonVisible={defaultView === "new"}
        />
      );
    }
  );

export default GstOutWardTableDetails;
