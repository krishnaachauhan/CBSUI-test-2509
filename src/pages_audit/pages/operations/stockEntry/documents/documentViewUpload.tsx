import {
  AppBar,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { stockViewEditMSTMetaData } from "./documentMetadata";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { uploadDocument, viewDocument } from "../api";
import { enqueueSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { cloneDeep } from "lodash";
import {
  MasterDetailsMetaData,
  LoaderPaperComponent,
  Alert,
  MasterDetailsForm,
  transformFileObject,
  utilFunction,
  queryClient,
  GradientButton,
} from "@acuteinfo/common-base";
import { getdocCD } from "components/utilFunction/function";
import { PreviewScan, useScan } from "components/common/custom/scan/useScan";
import { useDialogContext } from "../../payslip-issue-entry/DialogContext";

export const StockEditViewWrapper = ({ navigate, stockEntryGridData }) => {
  const [isopenImgViewer, setOpenImgViewer] = useState<boolean>(false);
  const [scanImage, setScanImage] = useState<any>();
  const { previewScan, handleScan, setPreviewScan, thumbnails } = useScan();
  const { state: rows }: any = useLocation();
  const myImgRef = useRef<any>(null);
  const myRef = useRef<any>(null);
  const { t } = useTranslation();
  const { trackDialogClass } = useDialogContext();
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  let newInitialData = {
    ...rows?.[0]?.data,
    DRAWING_POWER:
      rows?.[0]?.data?.DRAWING_POWER &&
      parseFloat(rows?.[0]?.data?.DRAWING_POWER).toFixed(2),
    NET_VALUE:
      rows?.[0]?.data?.NET_VALUE &&
      parseFloat(rows?.[0]?.data?.NET_VALUE).toFixed(2),
    STOCK_VALUE:
      rows?.[0]?.data?.STOCK_VALUE &&
      parseFloat(rows?.[0]?.data?.STOCK_VALUE).toFixed(2),
  };

  const viewDocuments = useQuery<any, any>(["viewDocument"], () =>
    viewDocument({
      COMP_CD: rows?.[0]?.data?.COMP_CD,
      BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
      REF_TRAN_CD: rows?.[0]?.data?.TRAN_CD,
    })
  );

  const uploadDocuments: any = useMutation("uploadDocument", uploadDocument, {
    onSuccess: () => {
      navigate(".");
      stockEntryGridData.mutate({
        COMP_CD: rows?.[0]?.data?.COMP_CD,
        BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
        ACCT_CD: rows?.[0]?.data?.ACCT_CD,
        ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
        A_USER_LEVEL: authState?.role,
        A_GD_DATE: authState?.workingDate,
      });
      enqueueSnackbar(t("DataSaveSuccessfully"), {
        variant: "success",
      });
    },
  });

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["viewDocument"]);
      queryClient.removeQueries(["uploadDocument"]);
    };
  }, []);

  const AddNewRow = async () => {
    myRef.current?.addNewRow(true, {
      COMP_CD: rows?.[0]?.data?.COMP_CD,
      BRANCH_CD: rows?.[0]?.data?.BRANCH_CD,
      ACCT_TYPE: rows?.[0]?.data?.ACCT_TYPE,
      ACCT_CD: rows?.[0]?.data?.ACCT_CD,
      ENTERED_COMP_CD: rows?.[0]?.data?.ENTERED_COMP_CD,
      ENTERED_BRANCH_CD: rows?.[0]?.data?.ENTERED_BRANCH_CD,
      REF_TRAN_CD: rows?.[0]?.data?.TRAN_CD,
      DOC_CD: docCD,
      ACTIVE: "Y",
    });
  };

  const onSubmitHandler = ({
    data,
    resultValueObj,
    resultDisplayValueObj,
    endSubmit,
  }) => {
    const { isNewRow, isUpdatedRow } = data?.DETAILS_DATA || {};

    if (isNewRow?.length || isUpdatedRow?.length) {
      [isNewRow, isUpdatedRow].forEach((rows) => {
        if (rows) {
          rows.forEach(
            (item) => (item.ACTIVE = Boolean(item.ACTIVE) ? "Y" : "N")
          );
        }
      });
      const apiReq = {
        ENTERED_COMP_CD: data?.ENTERED_COMP_CD,
        ENTERED_BRANCH_CD: data?.ENTERED_BRANCH_CD,
        TRAN_CD: data?.TRAN_CD,
        ACCT_TYPE: data?.ACCT_TYPE,
        ACCT_CD: data?.ACCT_CD,
        DETAILS_DATA: data?.DETAILS_DATA,
      };
      uploadDocuments.mutate(apiReq);
    }
    //@ts-ignore
    endSubmit(true);
  };

  // for download document
  const handleDownloadImage = (DOC_DATA) => {
    const imageData = DOC_DATA;
    const byteCharacters = atob(imageData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "image.jpg";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  //for upload document
  const customTransformFileObj = (currentObj) => {
    return transformFileObject({})(currentObj);
  };

  const handleImageChange = async (e) => {
    const files = e.target.files;
    const filesArray = Array.from(files);
    if (filesArray.length > 0) {
      let resdata = filesArray.map((one) => customTransformFileObj(one));
      if (resdata.length > 0) {
        let filesObj: any = await Promise.all(resdata);
        let base64 = await utilFunction.convertBlobToBase64(
          filesObj?.[0]?.blob
        );
        myRef.current.setGridData((old) => {
          let gridData: any = [];
          gridData = old.map((row) => {
            if (row.SR_CD === myImgRef.current.SR_CD) {
              return {
                ...row,
                DOC_DATA: base64?.[1],
              };
            } else {
              return { ...row };
            }
          });
          return [...gridData];
        });
      }
    }
  };

  useEffect(() => {
    if (scanImage) {
      myRef.current.setGridData((old) => {
        let gridData: any = [];
        gridData = old.map((row) => {
          if (row.SR_CD === myImgRef.current.SR_CD) {
            return {
              ...row,
              DOC_DATA: scanImage,
            };
          } else {
            return { ...row };
          }
        });
        return [...gridData];
      });
    }
  }, [scanImage]);

  //for open local file-manager
  const openFilePicker = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    fileInput.addEventListener("change", handleImageChange);
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  let metadata = cloneDeep(stockViewEditMSTMetaData) as MasterDetailsMetaData;

  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        className="view-upload"
        PaperProps={{
          style: {
            maxWidth: "1250px",
          },
        }}
      >
        <>
          {viewDocuments?.isError || uploadDocuments?.isError ? (
            <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={
                    viewDocuments?.error?.error_msg ??
                    uploadDocuments?.error?.error_msg ??
                    "Unknow Error"
                  }
                  errorDetail={
                    viewDocuments?.error?.error_detail ??
                    uploadDocuments?.error?.error_detail ??
                    ""
                  }
                  color="error"
                />
              </AppBar>
            </div>
          ) : null}

          {viewDocuments.isLoading ? (
            <div style={{ margin: "2rem" }}>
              <LoaderPaperComponent />
            </div>
          ) : (
            <MasterDetailsForm
              key={"stockEntryUploadDOC" + viewDocuments.isSuccess}
              metaData={metadata}
              initialData={{
                _isNewRow: false,
                ...newInitialData,
                DETAILS_DATA: viewDocuments?.data,
              }}
              subHeaderLabel={`\u00A0\u00A0
          ${(
            rows?.[0]?.data?.COMP_CD +
            "-" +
            rows?.[0]?.data?.BRANCH_CD +
            "-" +
            rows?.[0]?.data?.ACCT_TYPE +
            "-" +
            rows?.[0]?.data?.ACCT_CD
          ).replace(/\s/g, "")} — ${rows?.[0]?.data?.ACCT_NM} `}
              onSubmitData={onSubmitHandler}
              isLoading={uploadDocuments?.isLoading}
              isNewRow={false}
              onClickActionEvent={(index, id, data) => {
                if (id === "VIEW_DOC") {
                  if (data?.DOC_DATA) {
                    myImgRef.current = data;
                    trackDialogClass("viewDoc");
                    setOpenImgViewer(true);
                  }
                }
                if (id === "UPLOAD_DOC") {
                  myImgRef.current = data;
                  openFilePicker();
                }
                if (id === "DOWNLOAD") {
                  handleDownloadImage(data?.DOC_DATA);
                }
                if (id === "SCAN") {
                  myImgRef.current = data;
                  handleScan();
                  trackDialogClass("scan");
                }
              }}
              ref={myRef}
              formStyle={{}}
            >
              {({ isSubmitting, handleSubmit }) => {
                return (
                  <>
                    <GradientButton onClick={AddNewRow} color={"primary"}>
                      {t("AddNewDocument")}
                    </GradientButton>

                    <GradientButton
                      onClick={handleSubmit}
                      // disabled={isSubmitting}
                      endIcon={
                        isSubmitting ? <CircularProgress size={20} /> : null
                      }
                      color={"primary"}
                    >
                      {t("Save")}
                    </GradientButton>
                    <GradientButton
                      onClick={() => {
                        trackDialogClass("main");
                        navigate(".");
                      }}
                      // disabled={isSubmitting}
                      color={"primary"}
                    >
                      {t("Close")}
                    </GradientButton>
                  </>
                );
              }}
            </MasterDetailsForm>
          )}
        </>
      </Dialog>

      {isopenImgViewer ? (
        <ImgaeViewerandUpdate
          title={t("DocumentImage")}
          onClose={() => {
            trackDialogClass("view-upload");
            setOpenImgViewer(false);
          }}
          filedata={myImgRef.current.DOC_DATA}
        />
      ) : null}
      {previewScan ? (
        <PreviewScan
          previewScan={previewScan}
          imageData={thumbnails}
          setPreviewScan={setPreviewScan}
          setScanImage={setScanImage}
        />
      ) : null}
    </>
  );
};

const ImgaeViewerandUpdate = ({ title, onClose, filedata }) => {
  const fileURL = useRef<any | null>(null);
  const [filecnt, setFilecnt] = useState(0);

  const setImageURL = async (filedata) => {
    if (filedata) {
      let blob = utilFunction.base64toBlob(filedata, "image/png");
      fileURL.current =
        typeof blob === "object" && Boolean(blob)
          ? await URL.createObjectURL(blob as any)
          : null;
      setFilecnt(filecnt + 1);
    } else {
      fileURL.current = "";
      setFilecnt(filecnt + 1);
    }
  };
  useEffect(() => {
    setImageURL(filedata);
  }, []);

  return (
    <Dialog
      open={true}
      //@ts-ignore
      // fullWidth
      maxWidth={false}
      className="viewDoc"
    >
      <DialogActions
        sx={{
          padding: "0 20px 0 0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <GradientButton onClick={onClose}>{t("Close")}</GradientButton>{" "}
      </DialogActions>
      <DialogContent
        key={"div" + filecnt}
        style={{
          margin: "0 15px 15px 15px",
          padding: "0",
          alignSelf: "center",
          minHeight: "150px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src={Boolean(fileURL.current) ? fileURL.current : ""}
          onDoubleClick={() => onClose()}
        />
        <input
          name="fileselect"
          type="file"
          style={{ display: "none" }}
          accept=".png,.jpg,.jpeg"
          onClick={(e) => {
            //@ts-ignore
            e.target.value = "";
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
