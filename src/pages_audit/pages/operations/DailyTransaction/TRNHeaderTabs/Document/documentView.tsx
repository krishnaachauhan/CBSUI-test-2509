import { Dialog } from "@mui/material";
import { useQuery } from "react-query";
import { getDocView } from "./api";
import {
  Alert,
  ImageViewer,
  LoaderPaperComponent,
  NoPreview,
  PDFViewer,
  utilFunction,
} from "@acuteinfo/common-base";
import { useEffect, useState } from "react";
import { t } from "i18next";

export const DocumentViewer = ({ isOpen, rowsData, handleClose }) => {
  const [fileBlob, setFileBlob] = useState<any>(null);

  const { data, isLoading, isFetching, error, isError } = useQuery<any, any>(
    ["getDocView", { rowsData }],
    () => {
      return getDocView(rowsData);
    }
  );

  useEffect(() => {
    const runAsync = async () => {
      if (data) {
        if (!data?.ERROR_MSG) {
          let blobData: any = "";
          const imgType = data?.IMG_TYPE?.toUpperCase();

          if (imgType === "PDF") {
            blobData = utilFunction.base64toBlob(
              data?.DOC_IMAGE,
              "application/pdf"
            );
          } else if (["JPEG", "JPG", "PNG", "TIFF"].includes(imgType)) {
            blobData = utilFunction.base64toBlob(
              data?.DOC_IMAGE,
              "image/" + imgType.toLowerCase()
            );
          }
          if (blobData) {
            setFileBlob(blobData);
          }
        }
      }
    };
    runAsync();
  }, [data]);

  // Extract fileName for PDFViewer
  const pdfFileName = `Customer ID: ${
    rowsData?.CUSTOMER_ID ?? ""
  }\u00A0\u00A0||\u00A0\u00A0Document Name: ${rowsData?.TEMPLATE_CD ?? ""}`;

  // Extract fileName for ImageViewer and NoPreview
  let imageFileName = "";
  if (rowsData?.DOC_TYPE === "KYC") {
    imageFileName = `Customer ID: ${rowsData?.CUSTOMER_ID ?? ""}`;
  } else if (rowsData?.DOC_TYPE === "ACCT") {
    imageFileName = `A/c No.: ${rowsData?.COMP_CD?.trim() ?? ""}-${
      rowsData?.BRANCH_CD?.trim() ?? ""
    }-${rowsData?.ACCT_TYPE?.trim() ?? ""}-${
      rowsData?.ACCT_CD?.trim() ?? ""
    } || Document Name: ${rowsData?.DESCRIPTION ?? ""}`;
  }

  return (
    <Dialog
      open={isOpen}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
          padding: "10px",
          height: "100%",
        },
      }}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          handleClose();
        }
      }}
      maxWidth="xl"
    >
      {isLoading || isFetching ? (
        <Dialog open={true} fullWidth={true}>
          <LoaderPaperComponent size={30} />
        </Dialog>
      ) : null}
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      {(() => {
        if (data?.ERROR_MSG) {
          return (
            <NoPreview
              fileName={imageFileName}
              message={data?.ERROR_MSG ?? ""}
              onClose={() => {
                handleClose();
              }}
            />
          );
        } else if (data?.DOC_IMAGE) {
          if (data?.IMG_TYPE?.toUpperCase() === "PDF") {
            return (
              <PDFViewer
                blob={fileBlob}
                fileName={pdfFileName}
                onClose={() => handleClose()}
              />
            );
          } else {
            return (
              <ImageViewer
                blob={fileBlob}
                fileName={imageFileName}
                onClose={() => {
                  handleClose();
                }}
              />
            );
          }
        } else {
          return (
            <NoPreview
              fileName={imageFileName}
              message={t("NoImageFound")}
              onClose={() => {
                handleClose();
              }}
            />
          );
        }
      })()}
    </Dialog>
  );
};
