import {
  utilFunction,
  UploadTarget,
  FileObjectType,
  transformFileObject,
  ImageViewer,
  NoPreview,
  PDFViewer,
} from "@acuteinfo/common-base";
import { enqueueSnackbar } from "notistack";
// import { Fragment, useCallback, useEffect, useState } from "react";

import { Box, Button, Dialog, DialogTitle } from "@mui/material";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { AcctMSTContext } from "../../AcctMSTContext";
import { t } from "i18next";

const FilePreviewUpload = ({
  myRef,
  open,
  setOpen,
  detailsDataRef,
  filesGridData,
  // mainDocRow
}) => {
  const { AcctMSTState } = useContext(AcctMSTContext);
  const customTransformFileObj = (currentObj) => {
    return transformFileObject({})(currentObj);
  };

  const [allowUpdate, setAllowUpdate] = useState<boolean>(false);
  const [files, setFiles] = useState<any>(null);

  const onClose = () => {
    // setFiles(null)
    setOpen(false);
  };
  const validateFilesAndAddToListCB = useCallback(
    async (newFiles: File[], existingFiles: FileObjectType[] | undefined) => {
      // console.log("file change... new file ", newFiles)
      if (newFiles.length > 0) {
        let resdata = newFiles.map((one) => customTransformFileObj(one));
        if (resdata.length > 0) {
          let filesObj: any = await Promise.all(resdata);
          // console.log("file change... filesObj ", filesObj)
          let fileExt = filesObj?.[0]?.fileExt?.toUpperCase();
          if (
            fileExt === "JPG" ||
            fileExt === "JPEG" ||
            fileExt === "PNG" ||
            fileExt === "PDF"
          ) {
            let fileSize = filesObj?.[0]?.size;
            const maxAllowedSize = 1024 * 1024 * 3;
            if (fileSize <= maxAllowedSize) {
              setFiles(filesObj[0]);
            } else {
              enqueueSnackbar(t("ImageSizeShouldBeLessThan5MB"), {
                variant: "warning",
              });
            }
          } else {
            enqueueSnackbar(t("PleaseSelectValidFormat"), {
              variant: "warning",
            });
          }
        }
      }
    },
    [files, setFiles]
  );

  const onSave = async () => {
    let base64Data = "";
    let docImage = "";
    let imageType = "";
    if (Boolean(files) && Boolean(files.blob)) {
      base64Data = await utilFunction.convertBlobToBase64(files?.blob);
      if (Array.isArray(base64Data) && base64Data.length > 1) {
        docImage = base64Data[1];
        imageType = files?.blob?.type;
      }
    }
    myRef?.current.setGridData((old) => {
      let newGridArr = old;
      if (!Boolean(detailsDataRef.NEW_FLAG)) {
        newGridArr = old.map((gridRow) => {
          if (
            gridRow.LINE_ID === detailsDataRef.LINE_ID &&
            gridRow.DOC_IMAGE !== docImage
          ) {
            return {
              ...gridRow,
              DOC_IMAGE: docImage,
              IMG_TYPE: imageType,
            };
          } else {
            return gridRow;
          }
        });
      } else {
        newGridArr = old.map((gridRow) => {
          if (
            gridRow.LINE_ID === detailsDataRef.LINE_ID &&
            gridRow.DOC_IMAGE !== docImage
          ) {
            return {
              ...gridRow,
              DOC_IMAGE: docImage,
              IMG_TYPE: imageType,
              _isTouchedCol: {
                ...gridRow._isTouchedCol,
                DOC_IMAGE: true,
              },
            };
          } else {
            return gridRow;
          }
        });
      }
      return newGridArr;
    });
    setOpen(false);
  };
  const onSave2 = async () => {
    let base64Data = "";
    let docImage = "";
    let imageType = "";
    if (Boolean(files) && Boolean(files.blob)) {
      base64Data = await utilFunction.convertBlobToBase64(files?.blob);
      if (Array.isArray(base64Data) && base64Data.length > 1) {
        docImage = base64Data[1];
        imageType = files?.blob?.type;
      }
    }
    myRef?.current.setGridData((old) => {
      let newGridArr = old;
      if (!Boolean(detailsDataRef.NEW_FLAG)) {
        newGridArr = old.map((gridRow) => {
          if (
            gridRow.LINE_CD === detailsDataRef.LINE_CD &&
            gridRow.DOC_IMAGE !== docImage
          ) {
            return {
              ...gridRow,
              DOC_IMAGE: docImage,
              IMG_TYPE: imageType,
            };
          } else {
            return gridRow;
          }
        });
      } else {
        newGridArr = old.map((gridRow) => {
          if (
            gridRow.LINE_CD === detailsDataRef.LINE_CD &&
            gridRow.DOC_IMAGE !== docImage
          ) {
            return {
              ...gridRow,
              DOC_IMAGE: docImage,
              IMG_TYPE: imageType,
              _isTouchedCol: {
                ...gridRow._isTouchedCol,
                DOC_IMAGE: true,
              },
            };
          } else {
            return gridRow;
          }
        });
      }
      return newGridArr;
    });
    setOpen(false);
  };

  // check for allowing to update
  useEffect(() => {
    if (AcctMSTState?.isFreshEntryctx) {
      setAllowUpdate(true);
    } else {
      if (Boolean(detailsDataRef && detailsDataRef.NEW_FLAG)) {
        if (detailsDataRef.NEW_FLAG === "N") {
          setAllowUpdate(false);
        } else {
          setAllowUpdate(true);
        }
      } else {
        setAllowUpdate(true);
      }
    }
  }, []);

  useEffect(() => {
    // console.log("wehfiuwqefhwiuefhweihfiuwehfu detailsDataRef", detailsDataRef)
    if (detailsDataRef && Boolean(detailsDataRef?.DOC_IMAGE)) {
      const fileBlob = utilFunction.blobToFile(
        utilFunction.base64toBlob(
          detailsDataRef?.DOC_IMAGE,
          detailsDataRef?.IMG_TYPE?.includes("pdf")
            ? "application/pdf"
            : "image/" + detailsDataRef?.IMG_TYPE
        ),
        // ,rows?.FILE_NAME
        ""
      );
      setFiles({ blob: fileBlob });
    } else {
      setFiles(null);
    }
  }, []);
  return (
    <Fragment>
      <Dialog
        open={open}
        maxWidth="md"
        PaperProps={{
          style: {
            minWidth: "70%",
            width: "80%",
            // maxWidth: "90%",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--theme-color3)",
            color: "var(--theme-color2)",
            letterSpacing: "1.3px",
            margin: "10px",
            boxShadow:
              "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;",
            fontWeight: 500,
            borderRadius: "inherit",
            minWidth: "450px",
            p: 1,
          }}
          id="responsive-dialog-title"
        >
          {t("File")}
          <Box>
            {allowUpdate && <Button onClick={onSave}> {t("Save")}</Button>}
            <Button onClick={onClose}>{t("Close")}</Button>
          </Box>
        </DialogTitle>

        {allowUpdate && (
          <UploadTarget
            existingFiles={files}
            onDrop={validateFilesAndAddToListCB}
            disabled={false}
            accept={[
              "png",
              "PNG",
              "jpeg",
              "JPEG",
              "jpg",
              "JPG",
              "tiff",
              "TIFF",
              "gif",
              "GIF",
              "bmp",
              "BMP",
              "pdf",
              "PDF",
            ]}
          />
        )}
        {files &&
        (files?._mimeType?.includes("pdf") ||
          files?.blob?.type?.includes("pdf")) ? (
          <PDFViewer
            blob={files?.blob}
            fileName={files?.name}
            onClose={() => {
              if (allowUpdate) {
                setFiles(null);
              }
            }}
            // onClose={() => setAction(null)}
          />
        ) : files &&
          (files?._mimeType?.includes("image") ||
            files?.blob?.type?.includes("image")) ? (
          <ImageViewer
            blob={files?.blob}
            fileName={files?.name}
            onClose={() => {
              if (allowUpdate) {
                setFiles(null);
              }
            }}
            // onClose={() => setAction(null)}
          />
        ) : files ? (
          <NoPreview
            fileName={files?.name}
            onClose={() => {
              if (allowUpdate) {
                setFiles(null);
              }
            }}
            // onClose={() => setAction(null)}
            message={"NoPreviewAvailableForTheFile"}
          />
        ) : null}
      </Dialog>
    </Fragment>
  );
};

export default FilePreviewUpload;
