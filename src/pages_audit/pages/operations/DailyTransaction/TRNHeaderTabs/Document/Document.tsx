import { Box, CircularProgress } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { enqueueSnackbar } from "notistack";
import { AuthContext } from "pages_audit/auth";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { DocumentGridMetaData } from "./gridMetadata";
import { useTranslation } from "react-i18next";

import {
  ActionTypes,
  Alert,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  ImageViewer,
  LoaderPaperComponent,
  NoPreview,
  PDFViewer,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { t } from "i18next";

type DocumentProps = {
  reqData: any;
  handleDialogClose?: any;
  isDisplayClose?: any;
};

export const Document: React.FC<DocumentProps> = ({
  reqData,
  handleDialogClose,
  isDisplayClose,
}) => {
  const [dataRow, setDataRow] = useState<any>({});
  const imgUrl = useRef<any | null>(null);
  const blobDataRef = useRef<any>(null);
  const { authState } = useContext(AuthContext);
  const [detailViewDialog, setDetailViewDialog] = useState<boolean>(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [loadingFlag, setLoadingFlag] = useState<boolean>(false);
  const [fileBlob, setFileBlob] = useState<any>(null);
  const [openPrint, setOpenPrint] = useState<boolean>(false);
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );
  let imgBase = "";
  const { t } = useTranslation();

  const actions: ActionTypes[] = [
    {
      actionName: "view-detail",
      actionLabel: "ViewDetails",
      multiple: false,
      rowDoubleClick: true,
      alwaysAvailable: false,
    },
    ...(isDisplayClose
      ? [
          {
            actionName: "close",
            actionLabel: "Close",
            multiple: undefined,
            alwaysAvailable: true,
          },
        ]
      : []),
  ];

  // const getDocView = useMutation(API.getDocView, {
  //   onSuccess: async (res) => {
  //     if (res?.ERROR_MSG) {
  //       await MessageBox({
  //         messageTitle: "ValidationFailed",
  //         message: res?.ERROR_MSG ?? "",
  //         icon: "ERROR",
  //       });
  //     } else {
  //       imgBase = res?.DOC_IMAGE;
  //       handleImgProcess();
  //     }
  //   },
  //   onError: (error: any) => {
  //     let errorMsg = "Unknownerroroccured";
  //     if (typeof error === "object") {
  //       errorMsg = error?.error_msg ?? errorMsg;
  //     }
  //     enqueueSnackbar(errorMsg, {
  //       variant: "error",
  //     });
  //     CloseMessageBox();
  //   },
  // });

  const getDocView = useMutation(API.getDocView, {
    onMutate: () => {
      setLoadingFlag(true);
    },
    onSuccess: async (res) => {
      setLoadingFlag(false);
      if (res?.ERROR_MSG) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: res?.ERROR_MSG ?? "",
          icon: "ERROR",
        });
      } else {
        blobDataRef.current = res;
        const blobData =
          res?.IMG_TYPE?.toUpperCase() === "PDF"
            ? utilFunction.base64toBlob(res?.DOC_IMAGE, "application/pdf")
            : res?.IMG_TYPE.toUpperCase() === "JPEG" || "JPG" || "PNG" || "TIFF"
            ? utilFunction.base64toBlob(
                res?.DOC_IMAGE,
                "image/" + res?.IMG_TYPE
              )
            : "";

        if (blobData) {
          setFileBlob(blobData);
          setOpenPrint(true);
        }
      }
    },
    onError: (error: any) => {
      setLoadingFlag(false);
      let errorMsg = "Unknownerroroccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
  });

  const setCurrentAction = useCallback((data) => {
    let row = data?.rows?.[0]?.data;
    setDataRow(row);
    if (data?.name === "view-detail") {
      getDocView?.mutate(row);
    }
    if (data?.name === "close") {
      handleDialogClose();
    }
  }, []);

  // const handleImgProcess = async () => {
  //   let blob = utilFunction.base64toBlob(imgBase, "image/png");
  //   imgUrl.current =
  //     typeof blob === "object" && Boolean(blob)
  //       ? await URL.createObjectURL(blob as any)
  //       : null;
  //   imgUrl?.current && setDetailViewDialog(true);
  // };

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getDocTemplateList", { reqData }],
    () => API.getDocTemplateList(reqData),
    {
      enabled: hasRequiredFields,
    }
  );
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };

  //Grid Header title
  const memoizedMetadata = useMemo(() => {
    DocumentGridMetaData.gridConfig.gridLabel = reqData?.custHeader
      ? `Document of A/c No.: ${reqData?.BRANCH_CD?.trim() ?? ""}-${
          reqData?.ACCT_TYPE?.trim() ?? ""
        }-${reqData?.ACCT_CD?.trim() ?? ""} ${reqData?.ACCT_NM?.trim() ?? ""}`
      : reqData?.TAB_DISPL_NAME ?? "Documents";

    return DocumentGridMetaData;
  }, [data]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries([
        "getDocTemplateList",
        authState?.user?.branchCode,
      ]);
    };
  }, []);

  return (
    <>
      {loadingFlag ? (
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
      <GridWrapper
        key={`DocumentGridMetaData`}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        refetchData={handleRefetch}
        actions={actions}
        setAction={setCurrentAction}
      />

      {/* <Dialog
        maxWidth="xl"
        open={detailViewDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingRight: "24px",
            }}
          >
            <DialogTitle id="customized-dialog-title">
              {dataRow?.DESCRIPTION}
            </DialogTitle>
            <GradientButton onClick={() => setDetailViewDialog(false)}>
              {t("Close")}
            </GradientButton>
          </Box>

          <DialogContent>
            {imgUrl?.current ? (
              <img src={imgUrl?.current ?? ""} />
            ) : (
              <CircularProgress color="secondary" />
            )}
          </DialogContent>
        </>
      </Dialog> */}

      {openPrint ? (
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
          {blobDataRef?.current?.DOC_IMAGE ? (
            blobDataRef?.current?.IMG_TYPE?.toUpperCase() === "PDF" ? (
              <PDFViewer
                blob={fileBlob}
                fileName={`Customer ID: ${
                  dataRow?.CUSTOMER_ID ?? ""
                }\u00A0\u00A0||\u00A0\u00A0Document Name: ${
                  dataRow?.TEMPLATE_CD ?? ""
                }`}
                onClose={() => setOpenPrint(false)}
              />
            ) : (
              <ImageViewer
                blob={fileBlob}
                fileName={
                  dataRow?.DOC_TYPE === "KYC"
                    ? `Customer ID: ${dataRow?.CUSTOMER_ID ?? ""}`
                    : dataRow?.DOC_TYPE === "ACCT"
                    ? `A/c No.: ${dataRow?.COMP_CD?.trim() ?? ""}-${
                        dataRow?.BRANCH_CD?.trim() ?? ""
                      }-${dataRow?.ACCT_TYPE?.trim() ?? ""}-${
                        dataRow?.ACCT_CD?.trim() ?? ""
                      } || Document Name: ${dataRow?.DESCRIPTION ?? ""}`
                    : ""
                }
                onClose={() => {
                  setOpenPrint(false);
                }}
              />
            )
          ) : (
            <NoPreview
              fileName={
                dataRow?.DOC_TYPE === "KYC"
                  ? `Customer ID: ${dataRow?.CUSTOMER_ID ?? ""}`
                  : dataRow?.DOC_TYPE === "ACCT"
                  ? `A/c No.: ${dataRow?.COMP_CD?.trim() ?? ""}-${
                      dataRow?.BRANCH_CD?.trim() ?? ""
                    }-${dataRow?.ACCT_TYPE?.trim() ?? ""}-${
                      dataRow?.ACCT_CD?.trim() ?? ""
                    } || Document Name: ${dataRow?.DESCRIPTION ?? ""}`
                  : ""
              }
              message={t("NoImageFound")}
              onClose={() => {
                setOpenPrint(false);
              }}
            />
          )}
        </Dialog>
      ) : null}
    </>
  );
};
