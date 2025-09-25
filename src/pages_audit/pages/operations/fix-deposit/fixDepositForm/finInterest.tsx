import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useTranslation } from "react-i18next";
import * as API from "../api";
import {
  LoaderPaperComponent,
  PDFViewer,
  utilFunction,
  usePopupContext,
  queryClient,
} from "@acuteinfo/common-base";
import { FDContext } from "../context/fdContext";
import { format } from "date-fns";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

const FinInterest = ({ closeDialog }) => {
  const { FDState } = useContext(FDContext);
  const { authState } = useContext(AuthContext);
  const { t } = useTranslation();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [fileBlobData, setFileBlobData]: any = useState(null);
  const { BRANCH_CD, ACCT_TYPE, ACCT_CD } = FDState?.retrieveFormData;
  const { trackDialogClass } = useDialogContext();

  // API to fetch FD Fin interest Report data
  const { data, isLoading, isFetching, refetch } = useQuery<any, any>(
    ["finInterestJasper"],
    () =>
      API?.finInterestJasper({
        TRAN_TYPE: FDState?.fdParaDetailData?.TDS_METHOD ?? "",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: BRANCH_CD ?? "",
        ACCT_TYPE: ACCT_TYPE ?? "",
        ACCT_CD: ACCT_CD ?? "",
        CUSTOMER_ID: FDState?.acctNoData?.CUSTOMER_ID ?? "",
        FROM_DT: FDState?.fdParaDetailData?.FROM_TRAN_DT
          ? format(
              new Date(FDState?.fdParaDetailData?.FROM_TRAN_DT),
              "dd/MMM/yyyy"
            )
          : "",
        TO_DT: FDState?.fdParaDetailData?.TO_TRAN_DT
          ? format(
              new Date(FDState?.fdParaDetailData?.TO_TRAN_DT),
              "dd/MMM/yyyy"
            )
          : "",
      }),
    {
      onSuccess: async (data) => {
        let blobData = utilFunction.blobToFile(data, "");
        if (blobData) {
          setFileBlobData(blobData);
        }
      },
      onError: async (error) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          buttonNames: ["Ok"],
          icon: "ERROR",
          defFocusBtnName: "Ok",
        });
        if (btnName === "Ok") {
          trackDialogClass("main");
          closeDialog();
          CloseMessageBox();
        }
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["finInterestJasper"]);
    };
  }, []);

  return (
    <>
      {isLoading || isFetching ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
        >
          <LoaderPaperComponent />
        </Dialog>
      ) : Boolean(fileBlobData) ? (
        Boolean(fileBlobData && fileBlobData?.type?.includes("pdf")) && (
          <Dialog
            open={true}
            PaperProps={{
              style: {
                width: "100%",
                height: "100%",
              },
            }}
            maxWidth="xl"
            onKeyUp={(event) => {
              if (event.key === "Escape") {
                closeDialog();
              }
            }}
          >
            <PDFViewer
              blob={fileBlobData}
              fileName={`${t("FinInterestDetail")} of A/c No.: ${
                authState?.companyID?.trim() ?? ""
              }-${BRANCH_CD?.trim() ?? ""}-${ACCT_TYPE?.trim() ?? ""}-${
                ACCT_CD?.trim() ?? ""
              }`}
              onClose={closeDialog}
            />
          </Dialog>
        )
      ) : null}
    </>
  );
};

export default FinInterest;
