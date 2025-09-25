import {
  useRef,
  Fragment,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { ParameterConfirmGridMetaData } from "./gridMetadata";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import {
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  Alert,
  ClearCacheContext,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
const actions: ActionTypes[] = [
  {
    actionName: "accept",
    actionLabel: "Accept",
    multiple: false,
    rowDoubleClick: false,
  },
  {
    actionName: "reject",
    actionLabel: "Reject",
    multiple: false,
    rowDoubleClick: false,
  },
];

const ParameterConfirmGridWrapper = () => {
  const { enqueueSnackbar } = useSnackbar();
  const myGridRef = useRef<any>(null);
  const { getEntries } = useContext(ClearCacheContext);
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const setCurrentAction = useCallback(
    async (data) => {
      let check = data?.rows[0]?.data?.LAST_ENTERED_BY;
      if (data.name === "accept") {
        if (
          (check || "").toLowerCase() ===
          (authState?.user?.id || "").toLowerCase()
        ) {
          enqueueSnackbar("You can not accept your own entry.", {
            variant: "warning",
          });
        } else {
          const Accept = await MessageBox({
            messageTitle: "Confirmation",
            message: "DoyouwantConfirmParameter",
            icon: "CONFIRM",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
          });
          if (Accept === "Yes") {
            result.mutate({
              confirmed: "Y",
              comp_cd: data?.rows?.[0]?.data?.COMP_CD ?? "",
              remarks: data?.rows?.[0]?.data?.REMARKS ?? "",
              para_cd: data?.rows?.[0]?.data?.PARA_CD ?? "",
              branch_cd: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
            });
          }
        }
      } else if (data.name === "reject") {
        if (
          (check || "").toLowerCase() ===
          (authState?.user?.id || "").toLowerCase()
        ) {
          enqueueSnackbar("You can not reject your own entry.", {
            variant: "warning",
          });
        } else {
          const Accept = await MessageBox({
            messageTitle: "Confirmation",
            message: "AreYouSureToReject",
            icon: "CONFIRM",
            buttonNames: ["Yes", "No"],
            loadingBtnName: ["Yes"],
          });
          if (Accept === "Yes") {
            result.mutate({
              confirmed: "R",
              comp_cd: data?.rows?.[0]?.data?.COMP_CD ?? "",
              remarks: data?.rows?.[0]?.data?.REMARKS ?? "",
              para_cd: data?.rows?.[0]?.data?.PARA_CD ?? "",
              branch_cd: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
            });
          }
        }
      } else {
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
  >(["getParameterConfirm"], () => {
    if (authState?.role < "4") {
      return null;
    } else {
      return API.getParameterConfirm({
        comp_cd: authState.companyID,
        branch_cd: authState?.user?.branchCode,
      });
    }
  });
  const result = useMutation(API.confirmStatus, {
    onSuccess: (response: any) => {
      enqueueSnackbar(response, { variant: "success" });
      refetch();
      CloseMessageBox();
    },
    onError: (error: any) => {
      enqueueSnackbar(error?.error_msg ?? "error", { variant: "error" });
      CloseMessageBox();
    },
    onSettled: () => {
      CloseMessageBox();
    },
  });
  useEffect(() => {
    return () => {
      let entries = getEntries() as any[];
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach((one) => {
          queryClient.removeQueries(one);
        });
      }
      queryClient.removeQueries(["getParameterConfirm"]);
    };
  }, [getEntries]);
  return (
    <Fragment>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`parameterConfirmGrid`}
        finalMetaData={ParameterConfirmGridMetaData as GridMetaDataType}
        data={data ?? []}
        actions={actions}
        setData={() => null}
        enableExport={true}
        setAction={setCurrentAction}
        loading={isLoading || isFetching}
        refetchData={() => refetch()}
        ref={myGridRef}
      />
    </Fragment>
  );
};

export default ParameterConfirmGridWrapper;
