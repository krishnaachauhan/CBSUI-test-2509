import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useContext, useEffect, useState } from "react";
import { RecurringContext } from "./context/recurringPaymentContext";
import { useQuery } from "react-query";
import * as API from "./api";
import { useTranslation } from "react-i18next";
import {
  LoaderPaperComponent,
  PDFViewer,
  utilFunction,
  usePopupContext,
  queryClient,
} from "@acuteinfo/common-base";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";

const ClosingAdvice = ({ closeDialog }) => {
  const { authState } = useContext(AuthContext);
  const { rpState } = useContext(RecurringContext);
  const { t } = useTranslation();
  let currentPath = useLocation().pathname;
  const docCD = getdocCD(currentPath, authState?.menulistdata);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [fileBlobData, setFileBlobData]: any = useState(null);

  const { data, isLoading, isFetching, refetch } = useQuery<any, any>(
    ["getRucurPmtAdviceDtlJasper"],
    () =>
      API?.getRucurPmtAdviceDtlJasper({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: rpState?.dataForJasperParam?.BRANCH_CD ?? "",
        ACCT_TYPE: rpState?.dataForJasperParam?.ACCT_TYPE ?? "",
        ACCT_CD: rpState?.dataForJasperParam?.ACCT_CD ?? "",
        INT_RATE: rpState?.dataForJasperParam?.INT_RATE ?? "",
        INT_AMOUNT: rpState?.dataForJasperParam?.INT_AMOUNT ?? "",
        REC_PENALTY_AMT: rpState?.dataForJasperParam?.REC_PENALTY_AMT ?? "",
        PENAL_RATE: rpState?.dataForJasperParam?.PENAL_RATE ?? "",
        PAYMENT_TYPE: rpState?.dataForJasperParam?.PAYMENT_TYPE ?? "",
        TRAN_CD: rpState?.dataForJasperParam?.TRAN_CD ?? "",
        SCREEN_REF: docCD ?? "",
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
          icon: "ERROR",
          buttonNames: ["Ok"],
          defFocusBtnName: "Ok",
        });
        if (btnName === "Ok") {
          closeDialog();
          CloseMessageBox();
        }
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getRucurPmtAdviceDtlJasper"]);
    };
  }, []);

  //Close Advice details
  const handleCloseAdviceDetails = () => {
    closeDialog();
  };

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
          >
            <PDFViewer
              blob={fileBlobData}
              fileName={`${t("RecurringClosingAdvice")} of A/c No.: ${
                authState?.companyID?.trim() ?? ""
              }-${rpState?.dataForJasperParam?.BRANCH_CD?.trim() ?? ""}-${
                rpState?.dataForJasperParam?.ACCT_TYPE?.trim() ?? ""
              }-${rpState?.dataForJasperParam?.ACCT_CD?.trim() ?? ""}`}
              onClose={handleCloseAdviceDetails}
            />
          </Dialog>
        )
      ) : null}
    </>
  );
};

export default ClosingAdvice;
