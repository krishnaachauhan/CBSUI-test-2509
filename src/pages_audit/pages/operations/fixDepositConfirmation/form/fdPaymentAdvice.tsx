import { Dialog } from "@mui/material";
import {
  LoaderPaperComponent,
  PDFViewer,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { printPaymentAdvice } from "../api";
import { AuthContext } from "pages_audit/auth";

export const FdPaymentAdvicePrint = ({
  closeDialog,
  requestData,
  setOpenAdvice,
  screenFlag,
}) => {
  const { authState } = useContext(AuthContext);
  const [fileBlobData, setFileBlobData]: any = useState(null);
  const { MessageBox, CloseMessageBox } = usePopupContext();

  const { data, isLoading, isFetching, refetch } = useQuery<any, any>(
    ["printPaymentAdvice", authState?.user?.branchCode],
    () => printPaymentAdvice(requestData),
    {
      onSuccess: async (data) => {
        if (data?.[0]?.STATUS === "999") {
          {
            await MessageBox({
              messageTitle: "ValidationFailed",
              message: data?.[0]?.MESSAGE ?? "",
              icon: "ERROR",
            });
          }
          setOpenAdvice(false);
        } else {
          let blobData = utilFunction.blobToFile(data, "");
          if (blobData) {
            setFileBlobData(blobData);
          }
        }
      },
      onError: async (error) => {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        setOpenAdvice(false);
      },
    }
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "printPaymentAdvice",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  const printFormFileName =
    screenFlag === "FDCONF"
      ? "Fix Deposit Confirmation" +
        `\u00A0\u00A0\u00A0\u00A0` +
        "FD No.:" +
        requestData?.FD_NO
      : "Fix Deposit Entry" +
        `\u00A0\u00A0\u00A0\u00A0` +
        "FD No.:" +
        requestData?.FD_NO;

  return (
    <>
      {isLoading || isFetching ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              overflow: "auto",
              padding: "10px",
              width: "100%",
              height: "100px",
            },
          }}
          maxWidth="xl"
        >
          <LoaderPaperComponent />
        </Dialog>
      ) : Boolean(fileBlobData && fileBlobData?.type?.includes("pdf")) ? (
        <Dialog
          open={true}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
              padding: "10px",
              height: "100%",
            },
          }}
          maxWidth="xl"
        >
          <PDFViewer
            blob={fileBlobData}
            fileName={`${printFormFileName}`}
            onClose={() => closeDialog()}
          />
        </Dialog>
      ) : null}
    </>
  );
};
