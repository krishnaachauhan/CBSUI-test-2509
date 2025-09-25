import {
  ActionTypes,
  ClearCacheProvider,
  GridMetaDataType,
  GridWrapper,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { AuthContext } from "pages_audit/auth";
import { useCallback, useContext, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Fragment } from "react/jsx-runtime";
import * as API from "./api";
import { retrieveGridMetaData } from "./gridMetadata";
import CanvasImageViewer from "components/common/ImageSection/canvasImageViewer";
import { Dialog, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { getdocCD } from "components/utilFunction/function";

const actions: ActionTypes[] = [
  {
    actionName: "confirmReject",
    actionLabel: "confirmReject",
    multiple: undefined,
    rowDoubleClick: true,
  },
];
const AcctCardScaningConfirm = () => {
  const { authState } = useContext(AuthContext);
  const [selectedImageUrl, setSelectedImageUrl] = useState<any>("");
  const [isImgPhotoOpen, setIsImagePhotoOpen] = useState<any>(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [rowData, setRowData] = useState<any>({});
  const navigate = useNavigate();
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const setCurrentAction = useCallback(
    async (data) => {
      if (data?.name === "confirmReject") {
        const btnName = await MessageBox({
          message: "Proceed",
          messageTitle: "Proceed",
          buttonNames: ["Confirm", "Reject", "Cancel"],
          loadingBtnName: ["Confirm", "Reject"],
          icon: "CONFIRM",
        });
        const reqData = data?.rows[0]?.data;

        const payload = {
          BRANCH_CD: reqData?.BRANCH_CD,
          COMP_CD: reqData?.COMP_CD,
          //@ts-ignore
          SCREEN_REF: docCD,
          ACCT_TYPE: reqData?.ACCT_TYPE,
          ACCT_CD: reqData?.ACCT_CD,
          SR_CD: reqData?.SR_CD,
          J_TYPE: reqData?.J_TYPE,
        };
        if (btnName === "Confirm") {
          confRejectMutation.mutate({
            ...payload,
            FLAG: "C",
          });
        } else if (btnName === "Reject") {
          confRejectMutation.mutate({
            ...payload,
            FLAG: "R",
          });
        } else if (btnName === "Cancel") {
          CloseMessageBox();
        }
      }

      navigate(data?.name, {
        state: data?.rows,
      });
    },
    [navigate]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
    any,
    any
  >(["getAcctScaningRetrieveData"], () =>
    API.getAcctScaningRetrieveData({
      BRANCH_CD: authState?.user?.branchCode,
      COMP_CD: authState?.companyID,
    })
  );
  const confRejectMutation = useMutation(
    "doPhotoSignEntryConfirm",
    API.doPhotoSignEntryConfirm,
    {
      onSuccess: async (data) => {
        enqueueSnackbar("success", {
          variant: "success",
        });
        refetch();
        CloseMessageBox();
      },

      onError: async (error: any) => {
        MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
    }
  );
  return (
    <Fragment>
      <GridWrapper
        key={"modeMasterGrid"}
        finalMetaData={retrieveGridMetaData as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        actions={actions}
        loading={isLoading || isFetching}
        onClickActionEvent={(index, id, currentData) => {
          setRowData(currentData);
          if (id === "NEW_SIGN_VIEW") {
            setSelectedImageUrl(
              URL.createObjectURL(
                utilFunction.base64toBlob(currentData?.NEW_SIGN)
              )
            );
            setIsImagePhotoOpen(true);
          }
          if (id === "NEW_PHOTO_VIEW") {
            setSelectedImageUrl(
              URL.createObjectURL(
                utilFunction.base64toBlob(currentData?.NEW_PHOTO)
              )
            );
            setIsImagePhotoOpen(true);
          }
          if (id === "OLD_SIGN_VIEW") {
            setSelectedImageUrl(
              URL.createObjectURL(
                utilFunction.base64toBlob(currentData?.OLD_SIGN)
              )
            );
            setIsImagePhotoOpen(true);
          }
          if (id === "OLD_PHOTO_VIEW") {
            setSelectedImageUrl(
              URL.createObjectURL(
                utilFunction.base64toBlob(currentData?.OLD_PHOTO)
              )
            );
            setIsImagePhotoOpen(true);
          }
        }}
        refetchData={() => refetch()}
        setAction={setCurrentAction}
        variant="contained"
      />
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
          headerContent={
            rowData
              ? `
            A/c Number : ${rowData?.COMP_CD}${rowData?.BRANCH_CD}${rowData?.ACCT_TYPE}${rowData?.ACCT_CD} Name :${rowData?.ACCT_NM}
            `
              : ""
          }
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
    </Fragment>
  );
};
export const AcctCardScaningConfirmMain = () => {
  return (
    <Fragment>
      <ClearCacheProvider>
        <AcctCardScaningConfirm />
      </ClearCacheProvider>
    </Fragment>
  );
};
