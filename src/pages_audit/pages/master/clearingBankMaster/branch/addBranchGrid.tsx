import { AddBranchGridMetaData } from "./gridMetaData";
import { AppBar, Dialog } from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  Alert,
  usePopupContext,
  ClearCacheContext,
  queryClient,
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
} from "@acuteinfo/common-base";

export const AddBranchGrid = ({ handleDialogClose }) => {
  const { getEntries } = useContext(ClearCacheContext);
  const { state: rows }: any = useLocation();
  const { authState } = useContext(AuthContext);
  const [updatedData, setUpdatedData] = useState([]);
  const myref = useRef<any>(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [actions, setActions] = useState<ActionTypes[]>([
    {
      actionName: "close",
      actionLabel: "Close",
      multiple: undefined,
      rowDoubleClick: false,
      alwaysAvailable: true,
    },
  ]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getAddBranchData"], () =>
    API.getAddBranchData({
      bankCd: rows?.[0]?.data?.BANK_CD,
    })
  );

  useEffect(() => {
    setUpdatedData(data);
  }, [data]);

  const mutation = useMutation(API.updateAddBranchData, {
    onError: (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(data, {
        variant: "success",
      });
      CloseMessageBox();
      handleDialogClose();
    },
  });

  useEffect(() => {
    if (Boolean(isError) || Boolean(mutation?.isError)) {
      setActions([
        {
          actionName: "close",
          actionLabel: "Close",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
      ]);
    } else {
      setActions([
        {
          actionName: "ok",
          actionLabel: "Ok",
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
      ]);
    }
  }, [isError, mutation?.isError]);

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      handleDialogClose();
    } else if (data?.name === "ok") {
      const cleanedData = myref.current?.cleanData?.();
      const gridData = cleanedData?.filter((row) => {
        return (
          row?._isTouchedCol?.CHECK_BOX === true &&
          row?._oldData?.CHECK_BOX === false &&
          (row?.CHECK_BOX === true || row?.CHECK_BOX === "Y")
        );
      });
      if (gridData?.length > 0) {
        const gridId = gridData.map((item) => item?.BRANCH_CD.trim()).join();
        let res = await MessageBox({
          messageTitle: "confirmation",
          message: "AreYouSureToProceed",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (res === "Yes") {
          mutation.mutate({
            FLAG: "I",
            FOR: "I",
            TABLE_NM: "BANK_MST",
            BRANCH_CD: authState?.user?.branchCode?.trim(),
            COLUMN: cleanedData[0]?.KEY_COL?.trim(),
            VALUE: cleanedData[0]?.KEY_VAL?.trim(),
            TYPE: cleanedData[0]?.KEY_TYPE?.trim(),
            ENTER_IN: gridId,
          });
        }
      } else {
        await MessageBox({
          messageTitle: "Alert",
          message: "AtleastOneBranchShouldBeSelected",
          buttonNames: ["Ok"],
          icon: "WARNING",
        });
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getAddBranchData"]);
    };
  }, [getEntries]);

  return (
    <>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "60%",
            overflow: "auto",
            padding: "10px",
          },
        }}
        maxWidth="md"
        className="clearBankMstDlg"
      >
        {(isError || mutation?.isError) && (
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={
                (error?.error_msg || mutation?.error?.error_msg) ??
                "Something went to wrong.."
              }
              errorDetail={
                (error?.error_detail || mutation?.error?.error_detail) ?? ""
              }
              color="error"
            />
          </AppBar>
        )}
        <GridWrapper
          key={`addBranchGrid` + actions}
          finalMetaData={AddBranchGridMetaData as GridMetaDataType}
          data={updatedData ?? []}
          setData={setUpdatedData}
          loading={isLoading || isFetching}
          actions={actions}
          setAction={setCurrentAction}
          refetchData={() => refetch()}
          ref={myref}
        />
      </Dialog>
    </>
  );
};
