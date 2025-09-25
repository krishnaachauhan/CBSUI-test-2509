import React, { Fragment, useCallback, useState, useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { offences_dtl_grid_meta_data } from "./metadata";
import { Dialog } from "@mui/material";
import { useLocation } from "react-router-dom";
import {
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";

const OffencesDTLComp = ({ open, onClose }) => {
  const { authState } = useContext(AuthContext);
  const { state: data } = useLocation();
  // console.log("{rowdataaa", data)
  const {
    data: offencesGridData,
    isError: isOffencesGridError,
    isFetching: isOffencesGridFetching,
    isLoading: isOffencesGridLoading,
    refetch: offencesGridRefetch,
  } = useQuery<any, any>(["getOffencesDTLGridData", { data }], () =>
    API.getOffencesDTLGridData({
      COMP_CD: authState?.companyID ?? "",
      CUSTOMER_ID: data?.[0]?.id ?? "",
    })
  );

  const actions: ActionTypes[] = [
    {
      actionName: "view-detail",
      actionLabel: "View Detail",
      multiple: false,
      rowDoubleClick: true,
    },
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ];

  const setCurrentAction = useCallback((data) => {
    if (data.name === "close") {
      onClose();
    }
  }, []);

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      PaperProps={{
        style: {
          minWidth: "60%",
          width: "60%",
        },
      }}
    >
      <GridWrapper
        key={`OffencesDetailsGrid`}
        finalMetaData={offences_dtl_grid_meta_data as GridMetaDataType}
        data={offencesGridData ?? []}
        setData={() => null}
        loading={isOffencesGridLoading || isOffencesGridFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => offencesGridRefetch()}
        // ref={myGridRef}
      />
    </Dialog>
  );
};

export default OffencesDTLComp;
