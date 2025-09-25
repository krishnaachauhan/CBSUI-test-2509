import { AppBar, Dialog } from "@mui/material";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { AuthContext } from "pages_audit/auth";
import {
  Alert,
  GridWrapper,
  ActionTypes,
  GridMetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { getCurrentTabButtonsData, updateCurrentTabButtonData } from "../api";

import { AcctMSTContext } from "../AcctMSTContext";
import {
  PriorityGridMetadata,
  PTSGridMetadata,
} from "../buttonMetadata/currentTabBtnsGridMetadata";
import { format } from "date-fns";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";

const actions: ActionTypes[] = [
  {
    actionName: "save",
    actionLabel: "Save",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "cancel",
    actionLabel: "Cancel",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export const CurrentTabButtons = ({ handleDialogClose, columnName }) => {
  const { authState } = useContext(AuthContext);
  const { AcctMSTState } = useContext(AcctMSTContext);
  const myref = useRef<any>(null);
  const [gridData, setGridData] = useState([]);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(
    [
      "getCurrentTabButtonsData",
      columnName,
      AcctMSTState?.rowBranchCodectx,
      AcctMSTState?.accTypeValuectx,
      AcctMSTState?.acctNumberctx,
    ],
    () =>
      getCurrentTabButtonsData({
        companyID: authState?.companyID ?? "",
        branchCode: AcctMSTState?.rowBranchCodectx ?? "",
        accountType: AcctMSTState?.accTypeValuectx ?? "",
        accountCode: AcctMSTState?.acctNumberctx ?? "",
        columnName: columnName ?? "",
        workingDate: authState?.workingDate ?? "",
      }),
    {
      enabled: Boolean(columnName),
    }
  );

  const mutation = useMutation(updateCurrentTabButtonData, {
    onError: (error: any) => {
      CloseMessageBox();
    },
    onSuccess: async (data) => {
      let buttonName = await MessageBox({
        messageTitle: "Information",
        message: "DataSuccessfullySaved",
        buttonNames: ["Ok"],
        icon: "INFO",
      });
      if (buttonName === "Ok") {
        CloseMessageBox();
        handleDialogClose();
        refetch();
      }
    },
  });

  useEffect(() => {
    setGridData(data);
  }, [data]);

  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "cancel") {
      handleDialogClose();
    } else if (data?.name === "save") {
      const cleanedData = myref.current?.cleanData?.();
      const requestData = cleanedData.map((item) => {
        const updatedColumns =
          item._isTouchedCol && typeof item._isTouchedCol === "object"
            ? Object.keys(item._isTouchedCol).filter(
                (key) => item._isTouchedCol[key]
              )
            : [];
        const oldData = item._oldData ?? {};
        const filteredOldData = Object.fromEntries(
          Object.entries(oldData).filter(
            ([key, value]) => !(item.DOC_STATUS === "Y" && value === "Y")
          )
        );
        const reqestPara = {
          _UPDATEDCOLUMNS: updatedColumns,
          _OLDROWVALUE: filteredOldData ?? {},
          COMP_CD: item.COMP_CD ?? "",
          BRANCH_CD: item.BRANCH_CD ?? "",
          ACCT_TYPE: item.ACCT_TYPE ?? "",
          ACCT_CD: item.ACCT_CD ?? "",
          COLUMN_NM: item.COLUMN_NM ?? "",
          TRAN_DT: Boolean(item.TRAN_DT)
            ? format(utilFunction.getParsedDate(item.TRAN_DT), "dd/MMM/yyyy")
            : "",
          REMARKS: item.REMARKS ?? "",
          DOC_STATUS: item.DOC_STATUS ?? "",
        };
        return reqestPara;
      });
      const filterupdatedColumn = requestData.filter(
        (item) => item._UPDATEDCOLUMNS.length > 0
      );
      const checkDocStatus = requestData.some(
        (item) => item.DOC_STATUS === "Y"
      );
      if (filterupdatedColumn?.length > 0 && !Boolean(checkDocStatus)) {
        let buttonName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: "AtleastOneRecordShouldBeActive",
          buttonNames: ["Ok"],
          icon: "ERROR",
        });
        if (buttonName === "Ok") {
          CloseMessageBox();
        }
      } else if (filterupdatedColumn?.length > 0 && Boolean(checkDocStatus)) {
        let buttonName = await MessageBox({
          messageTitle: "confirmation",
          message: "AreYouSureToSaveTheData",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (buttonName === "Yes") {
          mutation.mutate({ isUpdatedRow: requestData });
        }
        if (buttonName === "No") {
          handleDialogClose();
        }
      } else {
        handleDialogClose();
      }
    }
  }, []);

  PTSGridMetadata.columns[5].isVisible = columnName === "NPA_CD" ? true : false;
  PTSGridMetadata.gridConfig.footerNote = `${t("ActiveRecord")}: ${
    Boolean(gridData) ? gridData?.length : ""
  } `;
  PriorityGridMetadata.gridConfig.footerNote = `${t("ActiveRecord")}: ${
    Boolean(gridData) ? gridData?.length : ""
  } `;
  PTSGridMetadata.gridConfig.gridLabel =
    columnName === "PTS"
      ? `${t("PTSCodeEntry")}`
      : columnName === "PURPOSE_CD"
      ? `${t("PurposeCodeEntry")}`
      : columnName === "NPA_CD"
      ? `${t("NPACodeEntry")}`
      : columnName === "SECURITY_CD"
      ? `${t("SecurityCodeEntry")}`
      : "";

  return (
    <>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "75%",
            overflow: "auto",
            padding: "10px",
          },
        }}
        maxWidth="md"
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
          key={"PTSGrid" + gridData}
          finalMetaData={
            columnName === "PRIORITY_CD"
              ? PriorityGridMetadata
              : (PTSGridMetadata as GridMetaDataType)
          }
          data={gridData ?? []}
          setData={setGridData}
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

export default CurrentTabButtons;
