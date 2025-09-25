import { Grid } from "@mui/material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { enqueueSnackbar } from "notistack";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { AuthContext } from "pages_audit/auth";
import {
  CreateDetailsRequestData,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
} from "@acuteinfo/common-base";
import { PersonlizationQuickGridMetaData } from "./Metadata/personalizeQuick";
import { PersonlizationDashboardGridData } from "./Metadata/personalizeDashboard";
export const PersonalizeDash = () => {
  const [quickGridData, setQuickGridData] = useState<any>([]);
  const [dashGridData, setDashGridData] = useState([]);
  const dashGridRef = useRef<any>(null);
  const quickGridRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const Dashactions: ActionTypes[] = [
    {
      actionName: "dashSave",
      actionLabel: "Save",
      multiple: false,
      rowDoubleClick: false,
      actionTextColor: "var(--theme-color2)",
      actionBackground: "var(--theme-color3)",
      alwaysAvailable: true,
      startsIcon: "Save",
      rotateIcon: "scale(1.4)",
    },
  ];

  const Quickactions: ActionTypes[] = [
    {
      actionName: "quickSave",
      actionLabel: "Save",
      multiple: false,
      rowDoubleClick: false,
      actionTextColor: "var(--theme-color2)",
      actionBackground: "var(--theme-color3)",
      alwaysAvailable: true,
      startsIcon: "Save",
      rotateIcon: "scale(1.4)",
    },
  ];

  const quickViewUsrData = useQuery<any, any, any>(
    ["GETUSRQUICKVIEW"],
    () =>
      API.getquickView({
        userID: authState?.user?.id,
        COMP_CD: authState?.companyID ?? "",
      }),
    {
      onSuccess: (data) => {
        setQuickGridData(data);
      },
    }
  );

  // useEffect(() => {
  //   setQuickGridData((old) => {

  //     if (Array.isArray(old) && old?.length) {
  //       old?.map((item) => {
  //         if (item._error) {
  //           item._error.DOC_CD = "OPTION ALREADT";
  //         }
  //       });
  //       return old;
  //     } else {
  //       return old;
  //     }
  //   });
  // }, [quickGridData]);

  const dashboxUserData = useQuery<any, any, any>(
    ["GETUSRDASHBOX"],
    () =>
      API.getdashUserboxData({
        userID: authState?.user?.id,
        COMP_CD: authState?.companyID ?? "",
      }),
    {
      onSuccess: (data) => {
        setDashGridData(data);
      },
    }
  );

  const saveQuickData: any = useMutation(
    "updateQuickViewData",
    API.updateQuickViewData,
    {
      onSuccess: () => {
        enqueueSnackbar("Record save successfully", {
          variant: "success",
        });
        quickViewUsrData.refetch();
      },
    }
  );

  const saveDashData: any = useMutation(
    "updateDashboxData",
    API.updateDashboxData,
    {
      onSuccess: () => {
        enqueueSnackbar("Record save successfully", {
          variant: "success",
        });
        dashboxUserData.refetch();
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["GETUSRQUICKVIEW"]);
      queryClient.removeQueries(["GETUSRDASHBOX"]);
      queryClient.removeQueries(["updateDashboxData"]);
      queryClient.removeQueries(["updateQuickViewData"]);
    };
  }, []);

  const setCurrentAction = useCallback((data) => {
    if (data?.name === "quickSave") {
      async function quick() {
        const { hasError, data } = await quickGridRef.current?.validate(true);
        const isError = data.some((item) => item._error.DOC_CD.length > 0);
        if (!isError) {
          let result = quickGridRef?.current?.cleanData?.();
          let newData = result
            .map((item) => {
              const newItem = {
                ...item,
                BRANCH_CD: authState?.user?.branchCode,
                USER_TYPE: "USER",
                _hidden: item.IS_DATA === "Y" && item.DOC_CD === "",
                _isNewRow: item.IS_DATA === "N" && item.DOC_CD?.length > 0,
              };
              if (item.DOC_CD === item?._oldData?.DOC_CD) {
                return { ...item, _markedForRemoval: true };
              }
              return newItem;
            })
            .filter((item) => !item._markedForRemoval);
          newData = CreateDetailsRequestData(newData);
          if (newData.isNewRow) {
            newData.isNewRow.forEach((item) => {
              delete item.TRAN_CD;
              delete item.LAST_ENTERED_DATE;
            });
          }
          let quickDMLdata = Object.values(newData).every(
            (array) => Array.isArray(array) && array.length === 0
          );
          if (!quickDMLdata) {
            saveQuickData.mutate({ DETAILS_DATA: newData });
          }
        }
      }
      quick();
    } else if (data?.name === "dashSave") {
      async function dashBox() {
        const { hasError, data } = await dashGridRef.current?.validate(true);
        const isError = data.some(
          (item) => item._error.DASH_TRAN_CD.length > 5
        );
        if (!isError) {
          let result = dashGridRef?.current?.cleanData?.();
          let newData = result
            .map((item) => {
              const newItem = {
                ...item,
                USER_TYPE: "USER",
                APP_TRAN_CD: "51",
                _hidden: item.IS_DATA === "Y" && item.DASH_TRAN_CD === "",
                _isNewRow:
                  item.IS_DATA === "N" && parseInt(item.DASH_TRAN_CD) > 0,
              };
              if (item.DASH_TRAN_CD === item?._oldData?.DASH_TRAN_CD) {
                return { ...item, _markedForRemoval: true };
              }
              return newItem;
            })
            .filter((item) => !item._markedForRemoval);
          newData = CreateDetailsRequestData(newData);
          newData.isNewRow?.forEach((item) => delete item.TRAN_CD);

          let dashDMLdata = Object.values(newData).every(
            (array) => Array.isArray(array) && array.length === 0
          );
          if (!dashDMLdata) {
            saveDashData.mutate({ DETAILS_DATA: newData });
          }
        }
      }
      dashBox();
    }
  }, []);

  return (
    <>
      <Grid
        container
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          height: "fit-content",
        }}
      >
        <Grid
          item
          xs={5.9}
          md={5.9}
          sx={{
            boxShadow:
              "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
          }}
        >
          {saveQuickData?.isError || quickViewUsrData?.isError ? (
            <Alert
              severity="error"
              errorMsg={
                saveQuickData.error?.error_msg ??
                quickViewUsrData.error?.error_msg ??
                "Unknown Error occured"
              }
              errorDetail={
                saveQuickData.error?.error_detail ??
                quickViewUsrData.error?.error_detail ??
                ""
              }
            />
          ) : null}
          <GridWrapper
            key={`personalizeQuickView`}
            finalMetaData={PersonlizationQuickGridMetaData as GridMetaDataType}
            data={quickGridData ?? []}
            setData={setQuickGridData}
            loading={quickViewUsrData.isLoading || saveQuickData?.isLoading}
            actions={Quickactions}
            setAction={setCurrentAction}
            headerToolbarStyle={{
              background: "var(--theme-color2)",
              color: "black",
            }}
            ref={quickGridRef}
          />
        </Grid>
        <Grid
          item
          xs={5.9}
          md={5.9}
          sx={{
            boxShadow:
              "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
          }}
        >
          {saveDashData?.isError || dashboxUserData?.isError ? (
            <Alert
              severity="error"
              errorMsg={
                saveDashData.error?.error_msg ??
                dashboxUserData?.error?.error_msg ??
                "Unknown Error occured"
              }
              errorDetail={
                saveDashData.error?.error_detail ??
                dashboxUserData.error?.error_detail ??
                ""
              }
            />
          ) : null}
          <GridWrapper
            key={`personalizeDashboardData`}
            finalMetaData={PersonlizationDashboardGridData as GridMetaDataType}
            data={dashGridData ?? []}
            headerToolbarStyle={{
              background: "var(--theme-color2)",
              color: "black",
            }}
            setData={setDashGridData}
            loading={dashboxUserData.isLoading || saveDashData?.isLoading}
            actions={Dashactions}
            setAction={setCurrentAction}
            ref={dashGridRef}
          />
        </Grid>
      </Grid>
    </>
  );
};
