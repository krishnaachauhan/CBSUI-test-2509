import React, { Fragment, useCallback, useState, useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { bank_dtl_grid_meta_data } from "./metadata";
import { Dialog } from "@mui/material";
import { useLocation } from "react-router-dom";
import {
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";

const BankDTLComp = ({ open, onClose }) => {
  const { authState } = useContext(AuthContext);
  const { state: data }: any = useLocation();
  // console.log("{rowdataaa", data)
  const {
    data: bankdtlData,
    isError: isBankDTLError,
    isFetching: isBankDTLFetching,
    isLoading: isBankDTLLoading,
    refetch: bankDTLRefetch,
  } = useQuery<any, any>(["getBankDTLGridData", { data }], () =>
    API.getBankDTLGridData({
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
          width: "80%",
        },
      }}
    >
      <GridWrapper
        key={`BankDetailsGrid`}
        finalMetaData={bank_dtl_grid_meta_data as GridMetaDataType}
        data={bankdtlData ?? []}
        setData={() => null}
        loading={isBankDTLLoading || isBankDTLFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => bankDTLRefetch()}
        // ref={myGridRef}
      />
    </Dialog>
  );
};

export default BankDTLComp;
