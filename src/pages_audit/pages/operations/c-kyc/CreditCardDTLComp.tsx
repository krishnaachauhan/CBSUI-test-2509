import React, { Fragment, useCallback, useState, useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import {
  ActionTypes,
  GridMetaDataType,
  GridWrapper,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { credit_card_dtl_grid_meta_data } from "./metadata";
import { useLocation } from "react-router-dom";

const CreditCardDTLComp = ({ open, onClose }) => {
  const { authState } = useContext(AuthContext);
  const { state: data } = useLocation();
  // console.log("{rowdataaa", data)
  const {
    data: creditCardData,
    isError: isCreditCardDataError,
    isFetching: isCreditCardDataFetching,
    isLoading: isCreditCardDataLoading,
    refetch: reditCardDataRefetch,
  } = useQuery<any, any>(["getCreditCardDTLGridData", { data }], () =>
    API.getCreditCardDTLGridData({
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
        key={`CreditCardGrid`}
        finalMetaData={credit_card_dtl_grid_meta_data as GridMetaDataType}
        data={creditCardData ?? []}
        setData={() => null}
        loading={isCreditCardDataLoading || isCreditCardDataFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => reditCardDataRefetch()}
        // ref={myGridRef}
      />
    </Dialog>
  );
};

export default CreditCardDTLComp;
