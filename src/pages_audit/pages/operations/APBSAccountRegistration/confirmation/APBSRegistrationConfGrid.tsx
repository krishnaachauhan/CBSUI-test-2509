import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import * as API from "../api";
import {
  Alert,
  GridWrapper,
  queryClient,
  ActionTypes,
  GridMetaDataType,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
import { ABPSAcctRegGridMetadata } from "../gridMetadata";
import { APBSAcctRegistrationFormWrapper } from "../form";
import { getdocCD } from "components/utilFunction/function";
import {
  DialogProvider,
  useDialogContext,
} from "../../payslip-issue-entry/DialogContext";
import { useEnter } from "components/custom/useEnter";
const Actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];

const APBSRegistrationConfGridMain = () => {
  const isDataChangedRef = useRef(false);
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [className, setClassName] = useState<any>("main");
  const { commonClass, trackDialogClass, dialogClassNames } =
    useDialogContext();

  //For Enter key
  useEffect(() => {
    const newData =
      commonClass !== null
        ? commonClass
        : dialogClassNames
        ? `${dialogClassNames}`
        : "main";

    setClassName(newData);
  }, [commonClass, dialogClassNames]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    ["getABPSAcctRegistrationConformationData", authState?.user?.branchCode],
    () =>
      API.getAPBSAcctRegistrationData({
        A_LOG_COMP_CD: authState?.companyID ?? "",
        A_LOG_BRANCH_CD: authState?.user?.branchCode ?? "",
        A_BASE_BRANCH: authState?.user?.baseBranchCode ?? "",
        WORKING_DATE: authState?.workingDate ?? "",
        A_FROM_DT: authState?.workingDate ?? "",
        A_TO_DT: authState?.workingDate ?? "",
        A_SCREEN_REF: docCD ?? "",
      })
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getABPSAcctRegistrationConformationData",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "view-details") {
        trackDialogClass("formDlg");
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const handleDialogClose = useCallback(() => {
    trackDialogClass("main");
    navigate(".");
    if (isDataChangedRef.current === true) {
      refetch();
      isDataChangedRef.current = false;
    }
  }, [navigate]);

  useEnter(`${className}`);

  return (
    <>
      {isError && (
        <Alert
          severity="error"
          errorMsg={error?.error_msg ?? "Something went to wrong.."}
          errorDetail={error?.error_detail}
          color="error"
        />
      )}
      <GridWrapper
        key={`ABPSRegistrationConfGridMetadata`}
        finalMetaData={ABPSAcctRegGridMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => {}}
        loading={isLoading || isFetching}
        actions={Actions}
        setAction={setCurrentAction}
        refetchData={() => refetch()}
      />
      <Routes>
        <Route
          path="view-details/*"
          element={
            <APBSAcctRegistrationFormWrapper
              isDataChangedRef={isDataChangedRef}
              closeDialog={handleDialogClose}
              defaultView={"view"}
              screenFlag={"APBSCONF"}
            />
          }
        />
      </Routes>
    </>
  );
};

export const APBSRegistrationConfGrid = () => {
  return (
    <ClearCacheProvider>
      <DialogProvider>
        <div className="main">
          <APBSRegistrationConfGridMain />
        </div>
      </DialogProvider>
    </ClearCacheProvider>
  );
};
