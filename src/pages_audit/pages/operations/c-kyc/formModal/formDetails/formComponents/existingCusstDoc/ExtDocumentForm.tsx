import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Dialog } from "@mui/material";
import _, { cloneDeep } from "lodash";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { ExtDocumentFormMetadata } from "./extDocumentFormMetadata";
import {
  FileObjectType,
  UploadTarget,
  MetaDataType,
  FormWrapper,
  extractMetaData,
  utilFunction,
  InitialValuesType,
  SubmitFnType,
  useDialogStyles,
} from "@acuteinfo/common-base";
import {
  transformFileObject,
  validateFilesAndAddToList,
} from "@acuteinfo/common-base";

import { ImageViewer, NoPreview, PDFViewer } from "@acuteinfo/common-base";
import { useSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import * as API from "../../../../api";
import { CkycContext } from "../../../../CkycContext";
import { t } from "i18next";

const ExtDocumentForm = ({
  ClosedEventCall,
  isDataChangedRef,
  formMode,
  afterFormSubmit,
  open,
  onClose,
  defaultFileData = [],
  allowedExtensions = ["pdf"],
  maxAllowedSize = 1024 * 1024 * 3,
  gridData,
  rowsData,
}) => {
  const classes = useDialogStyles();
  const myImgRef = useRef<any>(null);
  const myRef = useRef<any>(null);
  const [isopenImgViewer, setOpenImgViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any>(defaultFileData);
  const fileRef = useRef<any[]>(defaultFileData);
  const { enqueueSnackbar } = useSnackbar();
  const { authState } = useContext(AuthContext);
  const { state: rows }: any = useLocation();
  const { state } = useContext(CkycContext);
  // const updateOperatorMasterDetailsDataWrapperFn =
  // (updateMasterData) =>
  // async ({ data }: updateOperatorMasterDetailsDataType) => {
  //   return updateMasterData(data);
  // };
  // const mutationRet: any = useMutation(
  //   updateOperatorMasterDetailsDataWrapperFn(API.getOperatorDetailGridData)
  // );
  useEffect(() => {
    fileRef.current = files;
    // console.log("filessss", files);
  }, [files]);

  // API.getCustDocumentOpDtl(authState?.companyID, authState?.user?.branchCode)

  const customTransformFileObj = (currentObj) => {
    return transformFileObject({})(currentObj);
  };

  const validateFilesAndAddToListCB = useCallback(
    async (newFiles: File[], existingFiles: FileObjectType[] | undefined) => {
      if (newFiles.length > 0) {
        let resdata = newFiles.map((one) => customTransformFileObj(one));
        if (resdata.length > 0) {
          let filesObj: any = await Promise.all(resdata);

          let fileExt = filesObj?.[0]?.fileExt?.toUpperCase();
          if (
            fileExt === "JPG" ||
            fileExt === "JPEG" ||
            fileExt === "PNG" ||
            fileExt === "PDF"
          ) {
            let fileSize = filesObj?.[0]?.size;

            if (fileSize <= maxAllowedSize) {
              setFiles(filesObj);
              //   fileURL.current =
              //     typeof filesObj?.[0]?.blob === "object" &&
              //     Boolean(filesObj?.[0]?.blob)
              //       ? await URL.createObjectURL(filesObj?.[0]?.blob as any)
              //       : null;
              //   setImageData(filesObj?.[0]?.blob);

              //   fileName.current = filesObj?.[0]?.blob?.name;
              //   //submitBtnRef.current?.click?.();
              //   setFilecnt(filecnt + 1);
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
    [files, setFiles, maxAllowedSize, allowedExtensions]
  );

  // useEffect(() => {
  //   if (files && files.length > 0) {
  //     console.log(
  //       "fwefewqdqw",
  //       files[0]?._mimeType,
  //       files[0]?.blob,
  //       files[0]?.name
  //     );
  //   }
  // }, [files]);

  const AddNewRow = () => {
    myRef.current?.addNewRow(true);
  };

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    if (data) {
      // console.log("wadqwdwq. doc formsubmit", data)
      let filteredData = _.pick(data, [
        "DOC_DESCRIPTION",
        "DOC_IMAGE",
        "DOC_NO",
        "SR_CD",
        "SUBMIT",
        "TEMPLATE_CD",
        "TRAN_CD",
        "VALID_UPTO",
      ]);
      // console.log(fileRef.current, "sfhweiufhwieufh", files);
      if (fileRef.current && fileRef.current.length > 0) {
        if (fileRef.current[0].blob) {
          let blob = fileRef.current[0].blob;
          let base64 = await utilFunction.convertBlobToBase64(blob);
          if (base64) {
            // console.log("sfhweiufhwieufh --aft", base64);
            let newData = {
              ...filteredData,
              DOC_IMAGE: base64?.[1],
              DOC_OBJ: fileRef.current,
            };
            afterFormSubmit(newData, formMode);
          }
        }
      } else {
        let newData = { ...filteredData, DOC_IMAGE: "", DOC_OBJ: "" };
        afterFormSubmit(newData, formMode);
      }
    }
    endSubmit(true);
    //@ts-ignore
    // endSubmit(true);
  };

  useEffect(() => {
    // rowsData?.[0]?.data
    // console.log("sdfjwioefwef", rowsData?.[0]?.data);
    if (rowsData && rowsData.length > 0) {
      // if(rowsData?.[0]?.data.)
      const docFile = rowsData?.[0]?.data?.DOC_OBJ;
      if (docFile) {
        setFiles(docFile);
      }
    }
  }, [rowsData]);

  // getDocumentTypes
  const {
    data: DocTypes,
    isError,
    isLoading: isKYCGridDocLoading,
    error,
    refetch,
  } = useQuery<any, any>(
    [
      "getKYCDocumentGridData",
      // {
      //   COMP_CD: authState?.companyID ?? "",
      //   BRANCH_CD: authState?.user?.branchCode ?? "",
      //   CUST_TYPE: state?.entityTypectx,
      //   CONSTITUTION_TYPE: state?.constitutionValuectx
      // }, {enabled: !!state?.entityTypectx}
    ],
    () =>
      API.getDocumentTypes({
        TRAN_CD: authState?.companyID ?? "",
        SR_CD: state?.entityTypectx,
        DOC_TYPE: state?.constitutionValuectx,
      })
  );

  const formMemo = useMemo(() => {
    return (
      <FormWrapper
        key={"MobileAppReviewGridMetaData" + rowsData + formMode}
        // metaData={MobileAppReviewMetaData}
        // metaData={
        //   extractMetaData(
        //     KYCDocumentMasterMetaData,
        //     formMode === "add" ? "new" : "edit"
        //   ) as MetaDataType
        // }
        metaData={
          extractMetaData(
            ExtDocumentFormMetadata,
            formMode
            // formMode === "view"
          ) as MetaDataType
        }
        // metadata={formMetadata}
        initialValues={rowsData?.[0]?.data as InitialValuesType}
        onSubmitHandler={onSubmitHandler}
        //@ts-ignore
        displayMode={formMode}
        formState={{ gridData, rowsData }}
        formStyle={{
          background: "white",
          // height: "30vh",
          // overflowY: "auto",
          // overflowX: "hidden",
        }}
      >
        {({ isSubmitting, handleSubmit }) => {
          // console.log("q3qwedqwe", isSubmitting);
          return (
            <>
              {(formMode === "edit" || formMode === "new") && (
                <Button
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  color={"primary"}
                >
                  Save
                </Button>
              )}
              <Button onClick={onClose} color={"primary"}>
                Cancel
              </Button>
            </>
          );
        }}
      </FormWrapper>
    );
  }, [rowsData, formMode]);

  return (
    <Dialog
      open={open}
      //@ts-ignore
      // TransitionComponent={Transition}
      PaperProps={{
        style: {
          minWidth: "70%",
          width: "80%",
        },
      }}
      maxWidth="lg"
      classes={{
        scrollPaper: classes.topScrollPaper,
        paperScrollBody: classes.topPaperScrollBody,
      }}
    >
      {formMemo}
      <UploadTarget
        existingFiles={files}
        onDrop={validateFilesAndAddToListCB}
        disabled={loading}
      />
      {files && files.length > 0 && files[0]?._mimeType?.includes("pdf") ? (
        <PDFViewer
          blob={files[0]?.blob}
          fileName={files[0]?.name}
          onClose={() => {
            setFiles([]);
          }}
          // onClose={() => setAction(null)}
        />
      ) : files &&
        files.length > 0 &&
        files[0]?._mimeType?.includes("image") ? (
        <ImageViewer
          blob={files[0]?.blob}
          fileName={files[0]?.name}
          onClose={() => {
            setFiles([]);
          }}
          // onClose={() => setAction(null)}
        />
      ) : files && files.length > 0 ? (
        <NoPreview
          fileName={files[0]?.name}
          onClose={() => {
            setFiles([]);
          }}
          // onClose={() => setAction(null)}
          message={"NoPreviewAvailableForTheFile"}
        />
      ) : null}
    </Dialog>
  );
};

export default ExtDocumentForm;
