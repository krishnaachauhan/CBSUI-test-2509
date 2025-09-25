import React, { Fragment, useCallback, useState, useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { asset_dtl_grid_meta_data, bank_dtl_grid_meta_data } from "./metadata";
import { Dialog } from "@mui/material";
import { useLocation } from "react-router-dom";
import {
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";

const AssetDTLComp = ({ open, onClose }) => {
  const { authState } = useContext(AuthContext);
  const { state: data }: any = useLocation();
  // console.log("{rowdataaa", data)
  const {
    data: assetdtlData,
    isError: isAssetDTLError,
    isFetching: isAssetDTLFetching,
    isLoading: isAssetDTLLoading,
    refetch: assetDTLRefetch,
  } = useQuery<any, any>(["getAssetDTLGridData", { data }], () =>
    API.getAssetDTLGridData({
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
          minWidth: "50%",
          width: "60%",
        },
      }}
    >
      <GridWrapper
        key={`AssetDTLGrid`}
        finalMetaData={asset_dtl_grid_meta_data as GridMetaDataType}
        data={assetdtlData ?? []}
        setData={() => null}
        loading={isAssetDTLLoading || isAssetDTLFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => assetDTLRefetch()}
        // ref={myGridRef}
      />
    </Dialog>
  );
};

export default AssetDTLComp;
