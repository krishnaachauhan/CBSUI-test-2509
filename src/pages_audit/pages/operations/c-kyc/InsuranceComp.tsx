import React, {
  Fragment,
  useCallback,
  useState,
  useContext,
  useEffect,
} from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { Dialog } from "@mui/material";
import { insurance_grid_meta_data } from "./metadata";
import { useLocation } from "react-router-dom";
import {
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
} from "@acuteinfo/common-base";

const InsuranceComp = ({ open, onClose }) => {
  const { authState } = useContext(AuthContext);
  const { state: data }: any = useLocation();
  const [isCompOpen, setIsCompOpen] = useState(true);
  // console.log("{rowdataaa", data)
  const {
    data: insuranceData,
    isError: isInsuranceError,
    isFetching: isInsuranceFetching,
    isLoading: isInsuranceLoading,
    refetch: insuranceRefetch,
  } = useQuery<any, any>(["getInsuranceGridData", { data }], () =>
    API.getInsuranceGridData({
      COMP_CD: authState?.companyID ?? "",
      CUSTOMER_ID: data?.[0]?.id ?? "",
    })
  );
  // useEffect(() => {
  //     insuranceRefetch()
  // }, [])
  // useEffect(() => {
  //     if(!isInsuranceLoading && insuranceData) {
  //       // console.log("DeactivateCustomer data", inactivateCustData)
  //       setIsCompOpen(true)
  //     }
  // }, [insuranceData, isInsuranceLoading])

  // useEffect(() => {
  //     return () => {
  //         console.log("insurance comp unmount")
  //     }
  // }, [])

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
      {/* <p>asdasdasdasd</p> */}
      <GridWrapper
        key={`InsuranceGrid`}
        finalMetaData={insurance_grid_meta_data as GridMetaDataType}
        data={insuranceData ?? []}
        setData={() => null}
        loading={isInsuranceLoading || isInsuranceFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => insuranceRefetch()}
        // ref={myGridRef}
      />
    </Dialog>
  );
  // <Fragment>
  // </Fragment>
};

export default InsuranceComp;
