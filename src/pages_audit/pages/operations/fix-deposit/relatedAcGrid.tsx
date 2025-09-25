import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FDContext } from "./context/fdContext";
import { AuthContext } from "pages_audit/auth";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import {
  Alert,
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  usePopupContext,
  LoaderPaperComponent,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { Dialog } from "@mui/material";
import { RelatedAcGridMetaData } from "./relatedAcGridMetaData";
import { useCommonFunctions } from "./function";
import { cloneDeep } from "lodash";

// List of actions to be displayed as buttons in the header
const actions: ActionTypes[] = [
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    alwaysAvailable: true,
  },
  {
    actionName: "update_data",
    actionLabel: "",
    multiple: undefined,
    rowDoubleClick: true,
  },
];

export const RelatedAcGrid = ({ handleDialogClose }) => {
  const { t } = useTranslation();
  const { FDState } = useContext(FDContext);
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const submitRef = useRef<any>(null);
  const [gridData, setGridData] = useState<any[]>([]);
  const { BRANCH_CD, ACCT_TYPE, ACCT_CD, ACCT_NM } =
    FDState?.retrieveFormData || {};

  // API call to fetch Related account data
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getFDRelatedAcDtl"], () =>
    API.getFDRelatedAcDtl({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: BRANCH_CD ?? "",
      ACCT_TYPE: ACCT_TYPE ?? "",
      ACCT_CD: ACCT_CD ?? "",
    })
  );

  // Update the grid data when new submitted data is received (on double-click)
  useEffect(() => {
    if (data?.length > 0) {
      setGridData(data);
    }
  }, [data]);

  // Remove cached data for the API query to ensure fresh data is fetched
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getFDRelatedAcDtl"]);
    };
  }, []);

  // Mutation to validate the details of the related account
  const validateFDRelatedAcMutation = useMutation(API.validateFDRelatedAc, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: () => {},
  });

  // Mutation to entry of the related account
  const doFDRelatedAcEntryMutation = useMutation(API.doFDRelatedAcEntry, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      const btnName = await MessageBox({
        messageTitle: "New Account is Open",
        message: `New Account Number is : ${data?.[0]?.new_acct_cd ?? ""}`,
        buttonNames: ["Ok"],
        defFocusBtnName: "Ok",
        icon: "SUCCESS",
      });
      if (btnName === "Ok") {
        refetch();
      }
      CloseMessageBox();
    },
  });

  // Function to handle actions when a button is clicked
  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "close") {
      handleDialogClose();
    }
    if (data?.name === "update_data") {
      submitRef?.current?.cleanData();
      const rowdata = data?.rows?.[0]?.data;
      if (!rowdata?.NEW_ACCT_TYPE) {
        await MessageBox({
          messageTitle: "Alert",
          message: "PleaseSelectAcType",
          icon: "WARNING",
        });
        return;
      } else {
        validateFDRelatedAcMutation.mutate(
          {
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            NEW_ACCT_TYPE: rowdata?.NEW_ACCT_TYPE ?? "",
            STATUS: rowdata?.STATUS ?? "",
            USERROLE: authState?.role ?? "",
          },

          {
            onSuccess: async (data) => {
              for (const obj of data ?? []) {
                if (
                  obj?.O_STATUS === "999" ||
                  obj?.O_STATUS === "99" ||
                  obj?.O_STATUS === "9"
                ) {
                  const buttonName = await MessageBox({
                    messageTitle: obj?.O_MSG_TITLE?.length
                      ? obj?.O_MSG_TITLE
                      : obj?.O_STATUS === "9"
                      ? "Alert"
                      : obj?.O_STATUS === "99"
                      ? "Confirmation"
                      : "ValidationFailed",
                    message: obj?.O_MESSAGE ?? "",
                    buttonNames:
                      obj?.O_STATUS === "99" ? ["Yes", "No"] : ["Ok"],
                    loadingBtnName: ["Yes"],
                    defFocusBtnName:
                      obj?.O_STATUS === "9" || obj?.O_STATUS === "999"
                        ? "Ok"
                        : "Yes",
                    icon:
                      obj?.O_STATUS === "999"
                        ? "ERROR"
                        : obj?.O_STATUS === "99"
                        ? "CONFIRM"
                        : obj?.O_STATUS === "9"
                        ? "WARNING"
                        : "INFO",
                  });
                  if (
                    (obj?.O_STATUS === "99" && buttonName === "No") ||
                    obj?.O_STATUS === "999"
                  ) {
                    break;
                  }
                } else if (obj?.O_STATUS === "0") {
                  doFDRelatedAcEntryMutation.mutate({
                    COMP_CD: rowdata?.COMP_CD ?? "",
                    BRANCH_CD: rowdata?.BRANCH_CD ?? "",
                    ACCT_TYPE: rowdata?.ACCT_TYPE ?? "",
                    ACCT_CD: rowdata?.ACCT_CD ?? "",
                    NEW_COMP: authState?.companyID ?? "",
                    NEW_BRANCH: authState?.user?.branchCode ?? "",
                    NEW_TYPE: rowdata?.NEW_ACCT_TYPE ?? "",
                    ENTERED_BY: authState?.user?.name ?? "",
                  });
                }
              }
            },
          }
        );
      }
    }
  }, []);

  // Set the header title for the grid, dynamically generating it based on account details
  const memoizedMetadata = useMemo(() => {
    const cloned = cloneDeep(RelatedAcGridMetaData);
    cloned.gridConfig.gridLabel = `Related A/c Detail of A/c No.: ${
      BRANCH_CD?.trim() ?? ""
    }-${ACCT_TYPE?.trim() ?? ""}-${ACCT_CD?.trim() ?? ""} ${
      ACCT_NM?.trim() ?? ""
    }`;
    return cloned;
  }, [BRANCH_CD, ACCT_TYPE, ACCT_CD]);

  return (
    <>
      {validateFDRelatedAcMutation?.isLoading && (
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
        >
          <LoaderPaperComponent />
        </Dialog>
      )}
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            width: "100%",
            padding: "8px",
          },
        }}
        maxWidth="xl"
        onKeyUp={(event) => {
          if (event.key === "Escape") {
            handleDialogClose();
          }
        }}
        className="fdCommDlg"
      >
        {(isError ||
          validateFDRelatedAcMutation?.isError ||
          doFDRelatedAcEntryMutation?.isError) && (
          <Alert
            severity="error"
            errorMsg={
              error?.error_msg ||
              validateFDRelatedAcMutation?.error?.error_msg ||
              doFDRelatedAcEntryMutation?.error?.error_msg ||
              t("Somethingwenttowrong")
            }
            errorDetail={
              error?.error_detail ||
              validateFDRelatedAcMutation?.error?.error_detail ||
              doFDRelatedAcEntryMutation?.error?.error_detail ||
              ""
            }
            color="error"
          />
        )}
        <GridWrapper
          key={"RelatedAcGrid"}
          finalMetaData={memoizedMetadata as GridMetaDataType}
          data={gridData ?? []}
          setData={setGridData}
          actions={actions}
          loading={isLoading || isFetching}
          setAction={setCurrentAction}
          enableExport={true}
          refetchData={() => refetch()}
          ref={submitRef}
        />
      </Dialog>
    </>
  );
};
