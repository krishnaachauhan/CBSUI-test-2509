import { Grid } from "@mui/material";
import _ from "lodash";
import TabNavigate from "../../TabNavigate";
import { mobileRegMetaData } from "./MobileRegMetaData";
import useMobileRegTab from "./Hook/useMobileRegTab";
import React from "react";
import AgGridTableWrapper from "components/AgGridTableWrapper";
const MobileRegTab = () => {
  const {
    agGridProps,
    gridApi,
    displayMode,
    docCD,
    handleAddNewRow,
    onFormSubmitHandler,
    AcctMSTState,
    isNextLoading,
  } = useMobileRegTab();
  return (
    <Grid>
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={mobileRegMetaData.GridMetaDataType}
        getGridApi={gridApi}
        gridContext={{ mode: displayMode, docCD }}
        defaultView={"new"}
        handleAddNewRow={handleAddNewRow}
        isNewButtonVisible={displayMode !== "view"}
      />
      <TabNavigate
        handleSave={onFormSubmitHandler}
        displayMode={AcctMSTState?.formmodectx ?? "new"}
        isNextLoading={isNextLoading}
      />
    </Grid>
  );
};

export default MobileRegTab;
