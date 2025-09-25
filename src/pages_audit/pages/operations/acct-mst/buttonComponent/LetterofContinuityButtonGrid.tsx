import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";

import {
  GridWrapper,
  GridMetaDataType,
  ActionTypes,
  queryClient,
  ClearCacheContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { LetterOfContinuityBtnForm } from "./LetterOfContinuityButtonForm";
import { LetterOfContinuityGridMetadata } from "../buttonMetadata/letterOfContBtnGridMetadata";
import { useQuery } from "react-query";
import { getLetterOfCntGridData } from "../api";
import { AcctMSTContext } from "../AcctMSTContext";
const actions: ActionTypes[] = [
  {
    actionName: "add",
    actionLabel: "Add",
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
  {
    actionName: "add",
    actionLabel: "viewdetail",
    multiple: false,
    rowDoubleClick: true,
    alwaysAvailable: false,
  },
];

export const LetterOfContinuityButtonGrid = ({ handleDialogClose }) => {
  const { AcctMSTState } = useContext(AcctMSTContext);
  const { authState } = useContext(AuthContext);
  const { getEntries } = useContext(ClearCacheContext);
  const [openLOCForm, setOpenLOCForm] = useState<Boolean>(false);
  const [gridData, setGridData] = useState<any[]>([]);
  const [initialData, setInitialData] = useState({});
  const { t } = useTranslation();

  const navigate = useNavigate();
  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "add") {
        setInitialData(data?.rows?.[0]?.data);
        setOpenLOCForm(true);
      } else if (data?.name === "close") {
        handleDialogClose();
      } else {
        navigate(data?.name, {
          state: data?.rows,
        });
      }
    },
    [navigate]
  );

  const { isLoading, isFetching, isError, error, refetch } = useQuery<any, any>(
    ["getLetterOfCntGridData", authState?.user?.branchCode],
    () =>
      getLetterOfCntGridData({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
        ACCT_CD: AcctMSTState?.acctNumberctx ?? "",
      }),
    {
      onSuccess: (data) => {
        setGridData(data);
      },
    }
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
        "getLienReasonMstData",
        authState?.user?.branchCode,
      ]);
    };
  }, [getEntries]);

  return (
    <>
      <Dialog
        open={true}
        PaperProps={{
          style: {
            width: "70%",
            overflow: "auto",
            padding: "10px",
          },
        }}
        maxWidth="md"
      >
        <GridWrapper
          key={`LetterOfContinuityGridMetadata` + gridData}
          finalMetaData={LetterOfContinuityGridMetadata as GridMetaDataType}
          data={gridData ?? []}
          setData={setGridData}
          loading={isLoading || isFetching}
          actions={actions}
          setAction={setCurrentAction}
          refetchData={() => refetch()}
        />
        {openLOCForm && (
          <LetterOfContinuityBtnForm
            closeDialog={() => setOpenLOCForm(false)}
            initialData={initialData}
            setGridData={setGridData}
          />
        )}
      </Dialog>
    </>
  );
};
