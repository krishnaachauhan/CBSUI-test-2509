import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { getDocumentImagesList } from "../../api";
import { Dialog } from "@mui/material";
import UploadImageDialogue from "pages_audit/pages/operations/positivePayEntry/form/uploadImage";
import {
  ImageViewer,
  PDFViewer,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import {
  displayCommonErrorOnSubmit,
  getGridRowData,
} from "components/agGridTable/utils/helper";
import { AcctModalGridUploadMetaData } from "./AcctModalGridUploadMetaData";
import { PreviewScan, useScan } from "components/common/custom/scan/useScan";
import { AuthContext } from "pages_audit/auth";
import { t } from "i18next";
import { AcctMSTContext } from "../../AcctMSTContext";
import AgGridTableWrapper from "components/AgGridTableWrapper";

const AcctModalGridUpload = ({
  onClose,
  currentRowData,
  isOpen,
  displayMode,
  validateDocuments,
  flag,
  AcctMSTState,
}) => {
  const [isFileViewOpen, setIsFileViewOpen] = useState<any>(false);
  const myRef = useRef<any>(null);
  const [openImage, setOpenImage] = useState(false);
  const [currentRowDatas, setCurrentRowDatas] = useState<any>({});
  const [files, setFiles] = useState<any>(null);
  const [scanImage, setScanImage] = useState<any>();
  const { previewScan, handleScan, setPreviewScan, thumbnails } = useScan();
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();

  const handleCloseModal = () => {
    const rowData = getGridRowData(myRef);
    const savedData = rowData?.filter((item) => item?.saved);
    myRef.current?.api?.setRowData(savedData);
    onClose();
  };

  useEffect(() => {
    if (scanImage && currentRowDatas) {
      currentRowDatas?.node?.setData({
        ...currentRowDatas?.node?.data,
        DOC_IMAGE: scanImage,
        IMG_TYPE: "jpeg",
        FILE_NAME: "scanImage",
      });
    }
  }, [scanImage]);

  const mutationRet: any = useMutation(getDocumentImagesList, {
    onSuccess: async (data) => {},
    onError: (error: any) => {},
  });

  const SumbitHandler = async () => {
    const editingCells = myRef.current?.getEditingCells()?.[0];
    if (editingCells) {
      await myRef.current.startEditingCell({
        rowIndex: editingCells.rowIndex,
        colKey: editingCells?.column?.colId,
      });
      await myRef.current.api?.stopEditing(true);
      await myRef.current?.tabToNextCell();
    }
    setTimeout(async () => {
      const data = getGridRowData(myRef);
      for (let index = 0; index < data?.length; index++) {
        const row = data[index];
        if (!row.hasOwnProperty("VALID_UPTO") || !row.VALID_UPTO?.trim()) {
          await MessageBox({
            messageTitle: "ValidationFailed",
            message: t("ValiUptoValidationInDocumentUpload", {
              row: index + 1,
            }),
            icon: "ERROR",
          });
          return;
        }
        if (!row.hasOwnProperty("PAGE_NO") || !row.PAGE_NO) {
          await MessageBox({
            messageTitle: "ValidationFailed",
            message: t("PageNumberValidationInDocumentUpload", {
              row: index + 1,
            }),
            icon: "ERROR",
          });
          return;
        }
        if (!row.hasOwnProperty("DOC_IMAGE") || !row.DOC_IMAGE?.trim()) {
          await MessageBox({
            messageTitle: "ValidationFailed",
            message: t("ScanUplaodImageValidationInDocumentUpload", {
              row: index + 1,
            }),
            icon: "ERROR",
          });
          return;
        }
      }
      if (data.some((row) => row.errors && row.errors.length > 0)) {
        displayCommonErrorOnSubmit(myRef, MessageBox);
        return;
      } else {
        const savedData = data?.map(({ ...item }) => ({
          ...item,
          saved: true,
        }));
        currentRowData?.node?.setData({
          ...currentRowData?.node?.data,
          payload: savedData,
        });
        onClose();
      }
    }, 100);
  };

  const agGridProps = {
    id: `UploadDocuments`,
    columnDefs: AcctModalGridUploadMetaData.columns({
      setOpenImage,
      setCurrentRowDatas,
      setIsFileViewOpen,
      currentRowData,
      handleScan,
      authState,
      AcctMSTState,
      validateDocuments,
      flag,
    }),
    rowData: currentRowData?.node?.data?.payload
      ? currentRowData?.node?.data?.payload
      : mutationRet?.data,
  };

  useEffect(() => {
    if (
      currentRowDatas?.node &&
      Boolean(currentRowDatas?.node?.data?.DOC_IMAGE) &&
      openImage
    ) {
      const fileBlob: any = utilFunction.blobToFile(
        utilFunction.base64toBlob(
          currentRowDatas?.node?.data?.DOC_IMAGE,
          currentRowDatas?.node?.data?.IMG_TYPE?.includes("pdf")
            ? "application/pdf"
            : "image/" + currentRowDatas?.node?.data?.IMG_TYPE
        ),
        currentRowDatas?.node?.data?.FILE_NAME ?? "image"
      );
      setFiles({
        blob: fileBlob,
        name: `${currentRowDatas?.node?.data?.FILE_NAME ?? "doc"}.${
          currentRowDatas?.node?.data?.IMG_TYPE
        }`,
      });
    } else {
      setFiles(null);
    }
  }, [openImage]);

  const handleAddNewRow = () => {
    const rowData = getGridRowData(myRef);
    const lastRow = rowData?.[rowData?.length - 1] || [];
    const allHaveDocImage = rowData.every(
      (item) => !!item.DOC_IMAGE || !!item.SCAN_IMAGE
    );
    if (AcctMSTState?.isFreshEntryctx) {
      if (allHaveDocImage) {
        myRef.current?.applyTransaction?.({
          add: [
            {
              PAGE_NO: 1,
              newRow: true,
            },
          ],
        });
      }
    } else {
      if (
        lastRow &&
        (lastRow?.SCAN_IMPORT === "Y" ||
          (lastRow?.newRow && allHaveDocImage) ||
          lastRow?.length === 0)
      ) {
        myRef.current?.applyTransaction?.({
          add: [
            {
              PAGE_NO: 1,
              newRow: true,
            },
          ],
        });
      }
    }
  };
  let retrieveValue = AcctMSTState.retrieveFormDataApiRes?.MAIN_DETAIL;

  let acountNum = () => {
    return `${authState?.companyID?.trim()} ${
      AcctMSTState?.isFreshEntryctx
        ? authState?.user?.branchCode?.trim() ?? ""
        : retrieveValue?.BRANCH_CD?.trim() ?? ""
    } ${
      AcctMSTState?.isFreshEntryctx
        ? AcctMSTState?.accTypeValuectx?.trim()
          ? AcctMSTState?.accTypeValuectx?.trim() ?? ""
          : " — "
        : retrieveValue?.ACCT_TYPE?.trim() ?? ""
    } ${
      AcctMSTState?.isFreshEntryctx
        ? AcctMSTState?.acctNumberctx?.trim()
          ? AcctMSTState?.acctNumberctx?.trim() ?? ""
          : " — "
        : retrieveValue?.ACCT_CD?.trim() ?? ""
    }`;
  };
  const CustomerID = AcctMSTState?.isFreshEntryctx
    ? AcctMSTState?.customerIDctx?.trim()
      ? AcctMSTState?.customerIDctx?.trim() ?? ""
      : " — "
    : retrieveValue?.CUSTOMER_ID?.trim() ||
      AcctMSTState?.customerIDctx?.trim() ||
      "";

  AcctModalGridUploadMetaData.GridMetaDataType.gridLabel =
    currentRowData?.data?.DOC_TYPE === "KYC"
      ? `${t("KYCDocumentScanViewCustomerId")} : ${CustomerID}
       \u00A0\u00A0  -  ${t("Document")} : ( ${
          currentRowData?.data?.DISPLAY_TEMPLATE_CD
            ? currentRowData?.data?.DISPLAY_TEMPLATE_CD
            : ""
        })`
      : `${t("KYCDocumentScanViewAccountNo")} :(${acountNum()})
       \u00A0\u00A0  -  ${t("Document")} : ( ${
          currentRowData?.data?.DISPLAY_TEMPLATE_CD
            ? currentRowData?.data?.DISPLAY_TEMPLATE_CD
            : ""
        })`;

  return (
    <Fragment>
      <Dialog
        open={isOpen}
        PaperProps={{
          style: {
            width: "100%",
          },
        }}
        maxWidth="md"
      >
        <AgGridTableWrapper
          agGridProps={agGridProps}
          gridConfig={AcctModalGridUploadMetaData.GridMetaDataType}
          getGridApi={myRef}
          autoSelectFirst={true}
          defaultView={"new"}
          height={"calc(100vh - 75vh)"}
          buttons={[
            {
              label: "Save",
              onClick: SumbitHandler,
              disabled:
                (flag === "AcctDocuments" &&
                  currentRowData?.node?.data?.DOC_TYPE === "KYC") ||
                displayMode === "view",
            },
            { label: "Close", onClick: handleCloseModal },
          ]}
          gridContext={{ authState, mode: displayMode }}
          isNewButtonVisible={
            !(
              displayMode === "view" ||
              (flag === "AcctDocuments" &&
                currentRowData?.node?.data?.DOC_TYPE === "KYC")
            )
          }
          handleAddNewRow={handleAddNewRow}
        />
      </Dialog>

      {Boolean(isFileViewOpen) || Boolean(openImage) ? (
        <Dialog
          open={isFileViewOpen || openImage}
          PaperProps={{
            style: {
              width: "95%",
              overflow: "auto",
              height: "80%",
            },
          }}
          maxWidth="lg"
          className="imgDlg"
        >
          {openImage &&
            (currentRowDatas?.node?.data?.IMG_TYPE?.toUpperCase()?.includes(
              "PDF"
            ) ? (
              <PDFViewer
                blob={files?.blob}
                fileName={files?.name}
                onClose={() => setOpenImage(false)}
              />
            ) : (
              <ImageViewer
                blob={files?.blob}
                fileName={files?.name ?? "doc"}
                onClose={() => setOpenImage(false)}
                hideFilename={true}
              />
            ))}

          {isFileViewOpen && (
            <UploadImageDialogue
              onClose={() => {
                setIsFileViewOpen(false);
              }}
              onUpload={(data) => {
                if (Boolean(data)) {
                  currentRowDatas?.node?.setData({
                    ...currentRowDatas?.node?.data,
                    DOC_IMAGE: data?.[0]?.blob,
                    IMG_TYPE: data?.[0]?.fileExt,
                    FILE_NAME: data?.[0]?.name,
                  });
                }
              }}
            />
          )}
        </Dialog>
      ) : null}
      {previewScan ? (
        <PreviewScan
          previewScan={previewScan}
          imageData={thumbnails}
          setPreviewScan={setPreviewScan}
          setScanImage={setScanImage}
        />
      ) : null}
    </Fragment>
  );
};
export default AcctModalGridUpload;
