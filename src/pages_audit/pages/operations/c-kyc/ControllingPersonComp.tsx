import React, { Fragment, useCallback, useState, useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { Dialog } from "@mui/material";
import { controlling_person_dtl_grid_meta_data } from "./metadata";
import { useLocation } from "react-router-dom";
import {
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";

const ControllingPersonComp = ({ open, onClose }) => {
  const { authState } = useContext(AuthContext);
  const { state: data }: any = useLocation();
  // console.log("{rowdataaa", {data})
  const {
    data: contrPersonData,
    isError: isContrPersonDataError,
    isFetching: isContrPersonDataFetching,
    isLoading: isContrPersonDataLoading,
    refetch: contrPersonDataRefetch,
  } = useQuery<any, any>(["getControllingPersonDTLGridData", { data }], () =>
    API.getControllingPersonDTLGridData({
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
          minWidth: "70%",
          maxWidth: "80%",
        },
      }}
    >
      <GridWrapper
        key={`ControllingPersonGrid`}
        finalMetaData={
          controlling_person_dtl_grid_meta_data as GridMetaDataType
        }
        data={contrPersonData ?? []}
        setData={() => null}
        loading={isContrPersonDataLoading || isContrPersonDataFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => contrPersonDataRefetch()}
        // ref={myGridRef}
      />
    </Dialog>
  );
};

export default ControllingPersonComp;
