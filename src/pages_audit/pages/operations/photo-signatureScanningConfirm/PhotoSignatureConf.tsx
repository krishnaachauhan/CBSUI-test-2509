import {
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  MetaDataType,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import * as API from "./api";
import { useMutation, useQuery } from "react-query";
import { useContext, useEffect, useState } from "react";
import { Dialog, Grid, Paper, Typography } from "@mui/material";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";
import { PhotoSignatureMetaData } from "./PhotoSignatureMetaData";
import { Box } from "@mui/system";
import CanvasImageViewer from "components/common/ImageSection/canvasImageViewer";

const PhotoSignatureConf = ({ closeDialog, result }) => {
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { state: rows }: any = useLocation();
  const rowsData = rows?.[0]?.data;
  let currentPath = useLocation().pathname;
  const EnteredBy = rowsData?.ENTERED_BY;
  const { authState } = useContext(AuthContext);

  const [selectedImageUrl, setSelectedImageUrl] = useState<any>("");
  const [isImgPhotoOpen, setIsImagePhotoOpen] = useState<any>(false);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getCustSignPhoto"], () =>
    API.getCustSignPhoto({
      COMP_CD: result?.data[0]?.COMP_CD ?? "",
      BRANCH_CD: authState?.user?.branchCode,
      ENTERED_BRANCH_CD: rowsData?.ENTERED_BRANCH_CD ?? "",
      CUSTOMER_ID: rowsData?.CUSTOMER_ID ?? "",
    })
  );

  const confirmMutation = useMutation(API.confirmationPhotoSignature, {
    onSuccess: async (data, variables) => {
      MessageBox({
        message: t(
          variables?.FLAG === "C" ? "DataConfirmMessage" : "DataRejectMessage"
        ),
        messageTitle: "Success",
        icon: "SUCCESS",
        buttonNames: ["Ok"],
      });
      closeDialog();
      await result.mutate({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        screenFlag: "photosignatureCFM",
      });
    },
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      CloseMessageBox();
    },
  });

  const handleConfirm = async () => {
    if (
      (EnteredBy || "").toLowerCase() ===
      (authState?.user?.id || "").toLowerCase()
    ) {
      MessageBox({
        message: "NotOwnConfirm",
        messageTitle: "Warning",
        icon: "WARNING",
        buttonNames: ["Ok"],
      });
    } else {
      confirmMutation?.mutate({
        COMP_CD: rowsData?.COMP_CD ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        CUSTOMER_ID: rowsData?.CUSTOMER_ID ?? "",
        SR_CD: rowsData?.SR_CD ?? "",
        FLAG: "C",
      });
    }
  };

  const handleReject = async () => {
    const Accept = await MessageBox({
      messageTitle: "Confirmation",
      message: "RejectRequest",
      icon: "CONFIRM",
      buttonNames: ["Yes", "No"],
      loadingBtnName: ["Yes"],
    });
    if (Accept === "Yes") {
      confirmMutation?.mutate({
        COMP_CD: rowsData?.COMP_CD ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        CUSTOMER_ID: rowsData?.CUSTOMER_ID ?? "",
        SR_CD: rowsData?.SR_CD ?? "",
        FLAG: "R",
      });
    }
    CloseMessageBox();
  };

  PhotoSignatureMetaData.form.label = utilFunction.getDynamicLabel(
    currentPath,
    authState?.menulistdata,
    true
  );

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getCustSignPhoto"]);
    };
  }, []);

  return (
    <>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            maxWidth: "1335px",
          },
        }}
      >
        <FormWrapper
          key={"photo_signature_MetaData"}
          metaData={PhotoSignatureMetaData as MetaDataType}
          initialValues={{ ...rowsData }}
          onSubmitHandler={() => {}}
          formStyle={{
            background: "white",
          }}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                <GradientButton onClick={handleConfirm} color="primary">
                  {t("Confirm")}
                </GradientButton>
                <GradientButton onClick={handleReject} color="primary">
                  {t("Reject")}
                </GradientButton>
                <GradientButton onClick={closeDialog}>
                  {" "}
                  {t("Close")}
                </GradientButton>
              </>
            );
          }}
        </FormWrapper>

        <Grid container spacing={2} padding={2}>
          <Grid item xs={6}>
            <Typography variant="h6" textAlign="center">
              New Sign.
            </Typography>
            {data?.[0]?.NEW_SIGN ? (
              <img
                src={`data:image/${data?.[0]?.NEW_SIGN_IMG_TYP};base64,${data?.[0]?.NEW_SIGN}`}
                alt="Customer Signature"
                style={{
                  width: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                }}
                onClick={() => {
                  setSelectedImageUrl(
                    URL.createObjectURL(
                      utilFunction.base64toBlob(
                        data?.[0]?.NEW_SIGN,
                        data?.[0]?.NEW_SIGN_IMG_TYP
                      )
                    )
                  );
                  setIsImagePhotoOpen(true);
                }}
              />
            ) : (
              <Box
                height="150px"
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px dashed grey"
                onClick={() => {
                  setSelectedImageUrl(
                    URL.createObjectURL(
                      utilFunction.base64toBlob(
                        data?.[0]?.NEW_SIGN,
                        data?.[0]?.NEW_SIGN_IMG_TYP
                      )
                    )
                  );
                  setIsImagePhotoOpen(true);
                }}
              >
                <Typography>No Sign. Available</Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" textAlign="center">
              New Photo
            </Typography>
            {data?.[0]?.NEW_PHOTO ? (
              <img
                src={`data:image/${data?.[0]?.NEW_PHOTO_IMG_TYP};base64,${data?.[0]?.NEW_PHOTO}`}
                alt="Customer Photo"
                style={{
                  width: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                }}
                onClick={() => {
                  setSelectedImageUrl(
                    URL.createObjectURL(
                      utilFunction.base64toBlob(
                        data?.[0]?.NEW_PHOTO,
                        data?.[0]?.NEW_PHOTO_IMG_TYP
                      )
                    )
                  );
                  setIsImagePhotoOpen(true);
                }}
              />
            ) : (
              <Box
                height="150px"
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px dashed grey"
                onClick={() => {
                  setSelectedImageUrl(
                    URL.createObjectURL(
                      utilFunction.base64toBlob(
                        data?.[0]?.NEW_PHOTO,
                        data?.[0]?.NEW_PHOTO_IMG_TYP
                      )
                    )
                  );
                  setIsImagePhotoOpen(true);
                }}
              >
                <Typography>No Photo Available</Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" textAlign="center">
              Old Sign.
            </Typography>
            {data?.[0]?.OLD_SIGN ? (
              <img
                src={`data:image/${data?.[0]?.OLD_SIGN_IMG_TYP};base64,${data?.[0]?.OLD_SIGN}`}
                alt="Customer Signature"
                style={{
                  width: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                }}
                onClick={() => {
                  setSelectedImageUrl(
                    URL.createObjectURL(
                      utilFunction.base64toBlob(
                        data?.[0]?.OLD_SIGN,
                        data?.[0]?.OLD_SIGN_IMG_TYP
                      )
                    )
                  );
                  setIsImagePhotoOpen(true);
                }}
              />
            ) : (
              <Box
                height="150px"
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px dashed grey"
                onClick={() => {
                  setSelectedImageUrl(
                    URL.createObjectURL(
                      utilFunction.base64toBlob(
                        data?.[0]?.OLD_SIGN,
                        data?.[0]?.OLD_SIGN_IMG_TYP
                      )
                    )
                  );
                  setIsImagePhotoOpen(true);
                }}
              >
                <Typography>No Signature Available</Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" textAlign="center">
              Old Photo
            </Typography>
            {data?.[0]?.OLD_PHOTO ? (
              <img
                src={`data:image/${data?.[0]?.OLD_PHOTO_IMG_TYP};base64,${data?.[0]?.OLD_PHOTO}`}
                alt="Customer Photo"
                style={{
                  width: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                }}
                onClick={() => {
                  setSelectedImageUrl(
                    URL.createObjectURL(
                      utilFunction.base64toBlob(
                        data?.[0]?.OLD_PHOTO,
                        data?.[0]?.OLD_PHOTO_IMG_TYP
                      )
                    )
                  );
                  setIsImagePhotoOpen(true);
                }}
              />
            ) : (
              <Box
                height="150px"
                width="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px dashed grey"
                onClick={() => {
                  setSelectedImageUrl(
                    URL.createObjectURL(
                      utilFunction.base64toBlob(
                        data?.[0]?.OLD_PHOTO,
                        data?.[0]?.OLD_PHOTO_IMG_TYP
                      )
                    )
                  );
                  setIsImagePhotoOpen(true);
                }}
              >
                <Typography>No Photo Available</Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        <Paper>
          <Typography
            sx={{
              padding: "5px",
              fontWeight: "bold",
              color: "red",
            }}
          >
            {t("DoubleClick")}
          </Typography>
        </Paper>
      </Dialog>

      <Dialog
        open={isImgPhotoOpen}
        onClose={() => setIsImagePhotoOpen(false)}
        PaperProps={{
          style: {
            width: "100%",
            overflow: "hidden",
          },
        }}
        maxWidth="lg"
      >
        <CanvasImageViewer
          imageUrl={selectedImageUrl}
          headerContent={`Customer ID : ${
            rowsData?.CUSTOMER_ID ?? ""
          } Customer Name: ${rowsData?.CUST_NM ?? ""}`}
          isOpen={isImgPhotoOpen}
          onClose={() => setIsImagePhotoOpen(false)}
          printContent={
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                margin: "20px 10px 10px 10px",
                "@media screen": {
                  display: "none !important",
                },
                "@media print": {
                  display: "block !important",
                },
              }}
            ></Typography>
          }
        />
      </Dialog>
    </>
  );
};

export const PhotoSignatureConfFormWrapper = ({ closeDialog, result }) => {
  return (
    <ClearCacheProvider>
      <PhotoSignatureConf closeDialog={closeDialog} result={result} />
    </ClearCacheProvider>
  );
};
