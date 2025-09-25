import { useMutation, useQuery } from "react-query";
import { useEffect, useContext, useRef, useCallback, useState } from "react";
import * as API from "../api";
import { DynamicReportAccessRightsGridMData } from "./gridMetadata";
import { Dialog } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";
import {
  ActionTypes,
  Alert,
  ClearCacheContext,
  GridMetaDataType,
  GridWrapper,
  PopupMessageAPIWrapper,
  queryClient,
  useDialogStyles,
  utilFunction,
} from "@acuteinfo/common-base";

const actions: ActionTypes[] = [
  {
    actionName: "save",
    actionLabel: "Save",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const DynamicReportAccessRightsGrid = ({ closeDialog }) => {
  const [girdData, setGridData] = useState<any>([]);
  const [isOpenSave, setIsOpenSave] = useState(false);
  const { getEntries } = useContext(ClearCacheContext);
  const authController = useContext(AuthContext);
  const myGridRef = useRef<any>(null);
  const apiOldData = useRef<any>(null);
  const finalDataRef = useRef<any>(null);
  const classes = useDialogStyles();
  const { state: rows }: any = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const {
    data: dataRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<any, any>(
    [
      "getDynReportAccessRightsGridData",
      rows?.[0]?.data?.TRAN_CD,
      authController.authState.user.id,
    ],
    () =>
      API.getDynReportAccessRightsGridData(
        rows?.[0]?.data?.TRAN_CD,
        authController.authState.user.id
      )
  );

  const mutation = useMutation(API.updateUserAccessData, {
    onError: (error: any) => {
      onActionCancel();
    },
    onSuccess: (data) => {
      onActionCancel();
      enqueueSnackbar(t("Userrightsupdatedsuccessfully"), {
        variant: "success",
      });
      closeDialog();
    },
  });
  const onSaveRecord = useCallback(
    async (apiResponseData) => {
      let { hasError, data: dataold } = await myGridRef.current?.validate();
      if (hasError === true) {
        if (dataold) {
          setGridData(dataold);
        }
      } else {
        let result = myGridRef?.current?.cleanData?.();
        if (!Array.isArray(result)) {
          result = [result];
        }
        let finalResult = result.filter(
          (one) => !(Boolean(one?._hidden) && Boolean(one?._isNewRow))
        );

        if (finalResult.length === 0) {
          closeDialog();
        } else {
          let napiResponseData = apiResponseData.filter((item) => {
            return item["ACCESS_FLAG"] === "Y";
          });
          finalResult = finalResult.map((item) => {
            let { _displaySequence, ACCESS_FLAG, ...othersData } = item;

            if (typeof ACCESS_FLAG === "boolean") {
              return { ...othersData, ACCESS_FLAG: ACCESS_FLAG ? "Y" : "N" };
            } else {
              return { ...othersData, ACCESS_FLAG };
            }
          });
          finalResult = finalResult.filter((item) => {
            return item["ACCESS_FLAG"] === "Y";
          });
          finalResult = utilFunction.transformDetailDataForDML(
            napiResponseData,
            finalResult,
            ["USER_NAME"]
          );
          //finalResult = CreateDetailsRequestData(finalResult);
          finalResult["isUpdatedRow"] = [];
          if (
            finalResult?.isDeleteRow?.length === 0 &&
            finalResult?.isNewRow?.length === 0 &&
            finalResult?.isUpdatedRow?.length === 0
          ) {
            closeDialog();
          } else {
            finalDataRef.current = {
              _isNewRow: false,
              _UPDATEDCOLUMNS: [],
              _OLDROWVALUE: {},
              // ...reqDataRef.current,
              DETAILS_DATA: finalResult,
              COMP_CD: authController?.authState?.companyID,
              BRANCH_CD: authController?.authState?.user?.branchCode,
              TRAN_CD: rows?.[0]?.data?.TRAN_CD,
            };
            setIsOpenSave(true);
            //mutation.mutate({ data: reqData });
          }
        }
      }
    },
    [setGridData, closeDialog]
  );

  const setCurrentAction = useCallback(
    (dataAction) => {
      if (dataAction.name === "save") {
        onSaveRecord(apiOldData.current);
      } else {
        closeDialog();
      }
    },
    [apiOldData.current, onSaveRecord, closeDialog]
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getDynReportAccessRightsGridData",
        rows?.[0]?.data?.TRAN_CD,
        authController.authState.user.id,
      ]);
    };
  }, [getEntries]);

  useEffect(() => {
    if (Array.isArray(dataRes)) {
      setGridData(dataRes);
      apiOldData.current = dataRes;
    } else {
      setGridData([]);
      apiOldData.current = [];
    }
  }, [dataRes]);

  const onActionCancel = () => {
    setIsOpenSave(false);
  };
  const onPopupYes = (rowsData) => {
    mutation.mutate({ reqdata: rowsData });
  };

  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "60%",
        },
      }}
      maxWidth="md"
      classes={{
        scrollPaper: classes.topScrollPaper,
        paperScrollBody: classes.topPaperScrollBody,
      }}
    >
      <div style={{ padding: "10px" }}>
        {isError && (
          <Alert
            severity="error"
            errorMsg={error?.error_msg ?? "Somethingwenttowrong"}
            errorDetail={error?.error_detail}
            color="error"
          />
        )}
        {mutation.isError && (
          <Alert
            severity="error"
            errorMsg={mutation.error?.error_msg ?? "Somethingwenttowrong"}
            errorDetail={mutation.error?.error_detail}
            color="error"
          />
        )}
        <GridWrapper
          key={"dynRptAccessRightsGrid" + isError}
          finalMetaData={DynamicReportAccessRightsGridMData as GridMetaDataType}
          data={girdData}
          setData={setGridData}
          loading={isLoading || isFetching}
          actions={isError ? [actions?.[1]] : actions}
          setAction={(dataAction) => {
            setCurrentAction(dataAction);
          }}
          refetchData={() => refetch()}
          ref={myGridRef}
        />
        {isOpenSave ? (
          <PopupMessageAPIWrapper
            MessageTitle="Confirmation"
            Message={t("DoyouwanttosavethisRecord")}
            onActionYes={(rowVal) => onPopupYes(rowVal)}
            onActionNo={() => onActionCancel()}
            rows={finalDataRef.current}
            open={isOpenSave}
            loading={mutation.isLoading}
          />
        ) : null}
      </div>
    </Dialog>
  );
};
