import React, { useEffect } from "react";
import { cardRateMstColumn } from "../cardRateMstColumn";
import {
  displayNumber,
  usePropertiesConfigContext,
} from "@acuteinfo/common-base";
import { valueOrDefault } from "chart.js/dist/helpers/helpers.core";

const useCardRate = ({
  gridApi,
  formState,
  authState,
  defaultView,
  data,
  getCardRateData,
  setCurrentRowIndex,
}) => {
  const updatePinnedBottomRow = async () => {
    if (!gridApi) return;
    const formdata = await formState.current?.getFieldData();
  };

  const agGridProps = {
    id: "card-rate-master-table",
    columnDefs: cardRateMstColumn.columns(
      {
        formState,
        authState,
      },
      setCurrentRowIndex,
      defaultView
    ),
    rowData: data,
    onCellValueChanged: updatePinnedBottomRow,
  };

  return {
    updatePinnedBottomRow,
    agGridProps,
  };
};

export default useCardRate;
