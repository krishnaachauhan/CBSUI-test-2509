import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ClearingBankMstGridMetaData } from "./gridMetadata";
import * as API from "./api";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import { AddBranchGrid } from "./branch/addBranchGrid";
import { ClearingBankMstFormWrapper } from "./form";
import { enqueueSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

import {
  usePopupContext,
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  ClearCacheContext,
} from "@acuteinfo/common-base";
import { useEnter } from "components/custom/useEnter";

const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "view-details",
    actionLabel: "View Details",
    multiple: false,
    rowDoubleClick: true,
  },
  {
    actionName: "delete",
    actionLabel: "Delete",
    multiple: false,
    rowDoubleClick: false,
  },
];

export const ClearingBankMstGrid = () => {
  const isDeleteDataRef = useRef<any>(null);
  const isDataChangedRef = useRef(false);
  const { authState } = useContext(AuthContext);
  const { getEntries } = useContext(ClearCacheContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [className, setClassName] = useState<string>("main");

  useEffect(() => {
    if (authState?.user?.baseBranchCode === authState?.user?.branchCode) {
      actions.push({
        actionName: "add-branch",
        actionLabel: "AddBranch",
        multiple: false,
        rowDoubleClick: false,
      });
    }
    return () => {
      actions.length = 0;
      actions.push(
        {
          actionName: "add",
          actionLabel: "Add",
          multiple: undefined,
          rowDoubleClick: false,
          alwaysAvailable: true,
        },
        {
          actionName: "view-details",
          actionLabel: "ViewDetails",
          multiple: false,
          rowDoubleClick: true,
        },
        {
          actionName: "delete",
          actionLabel: "Delete",
          multiple: false,
          rowDoubleClick: false,
        }
      );
    };
  }, []);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "delete") {
        isDeleteDataRef.current = data?.rows?.[0];
        const btnName = await MessageBox({
          message: "DeleteData",
          messageTitle: "Confirmation",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (btnName === "Yes") {
          deleteMutation.mutate({
            ...isDeleteDataRef.current?.data,
            _isDeleteRow: true,
          });
        }
      } else if (data?.name === "add") {
        setClassName("clearBankMstDlg");
        navigate(data?.name, {
          state: [],
        });
      } else {
        setClassName("clearBankMstDlg");
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getClearingBankMasterData", authState?.user?.branchCode], () =>
    API.getClearingBankMasterData({
      branchCode: authState?.user?.branchCode ?? "",
      companyID: authState?.companyID ?? "",
    })
  );

  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries([
        "getClearingBankMasterData",
        authState?.user?.branchCode,
      ]);
    };
  }, [getEntries]);

  const deleteMutation = useMutation(API.clearingBankMasterDataDML, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("RecordRemovedMsg"), {
        variant: "success",
      });
      CloseMessageBox();
      refetch();
    },
  });

  const handleDialogClose = useCallback(() => {
    setClassName("main");
    navigate(".");
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
  }, [navigate]);

  useEnter(`${className}`);

  return (
    <div className="main">
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`clearingBankMstGrid` + actions.length}
        finalMetaData={ClearingBankMstGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
        enableExport={true}
      />
      <Routes>
        <Route
          path="view-details/*"
          element={
            <ClearingBankMstFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"view"}
              gridData={data}
            />
          }
        />
        <Route
          path="add/*"
          element={
            <ClearingBankMstFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"new"}
              gridData={data}
            />
          }
        />
        <Route
          path="add-branch/*"
          element={<AddBranchGrid handleDialogClose={handleDialogClose} />}
        />
      </Routes>
    </div>
  );
};
