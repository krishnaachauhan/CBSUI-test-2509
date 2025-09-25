import { useContext, useState } from "react";
import { useMutation } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { Dialog } from "@mui/material";
import {
  usePopupContext,
  FileUploadControl,
  GradientButton,
  FormWrapper,
  MetaDataType,
  SubmitFnType,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { selectConfigGridMetaData } from "../metaData";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { AuthContext } from "pages_audit/auth";

export default function ImportData({
  CloseFileUpload,
  refetchData,
  fromRef,
  selectedDatas,
}) {
  const { authState } = useContext(AuthContext);
  const [isFileUploadopen, setFileUpload] = useState(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [fileData, setFileData] = useState<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const uploadFileData = useMutation(API.uploadFileData, {
    onError: (error: any) => {
      let errorMsg = "UnknownErrorOccured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      MessageBox({
        messageTitle: "Alert",
        message: errorMsg,
        icon: "ERROR",
      });
      CloseFileUpload();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("dataImportedSuccessfully"), {
        variant: "success",
      });
      selectedDatas(data);
      refetchData();
      CloseFileUpload();
      CloseMessageBox();
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    setFileUpload(true);
    setFileData(data);
  };
  return (
    <div>
      <Dialog fullWidth maxWidth="sm" open={true}>
        <FormWrapper
          key={"importData"}
          metaData={selectConfigGridMetaData as MetaDataType}
          onSubmitHandler={onSubmitHandler}
          // initialValues={}
          formStyle={{
            background: "white",
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Save");
                }}
                disabled={isSubmitting}
                color={"primary"}
              >
                {t("Ok")}
              </GradientButton>
              <GradientButton onClick={CloseFileUpload} color={"primary"}>
                {t("Close")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      </Dialog>
      <Dialog fullWidth maxWidth="md" open={isFileUploadopen}>
        <FileUploadControl
          key={"BankMasterFileUploadData"}
          onClose={() => {
            CloseFileUpload();
          }}
          editableFileName={false}
          defaultFileData={[]}
          onUpload={async (
            formDataObj,
            proccessFunc,
            ResultFunc,
            base64Object,
            result
          ) => {
            const btnName = await MessageBox({
              message: "AreYouSureToInsertTheFileData",
              messageTitle: "Confirmation",
              icon: "CONFIRM",
              buttonNames: ["Yes", "No"],
              loadingBtnName: ["Yes"],
            });
            if (btnName === "Yes") {
              const FILE_TYPE = fileData?.DESCRIPTION.split(",")[0];
              const TRAN_CD = fileData?.DESCRIPTION.split(",")[1];
              const FILEBLOB = base64Object;
              const resolvedRef = await fromRef;
              uploadFileData.mutate({
                FILE_TYPE,
                TRAN_CD,
                FILEBLOB,
                COMP_CD: authState?.companyID ?? "",
                BRANCH_CD: authState?.user?.branchCode ?? "",
                AC_BRANCH_CD: resolvedRef?.BRANCH_CD ?? "",
                ACCT_CD: resolvedRef?.ACCT_CD ?? "XX",
                ACCT_TYPE: resolvedRef?.ACCT_TYPE ?? "XX",
                CHEQUE_NO: "",
                AMOUNT: resolvedRef?.AMOUNT ?? "",
                SCROLL_NO: "",
                REMARKS: "",
                DEF_TRAN_CD: resolvedRef?.DEF_TRAN_CD ?? "",
                ENTRY_TYPE: resolvedRef?.ENTRY_TYPE ?? "",
                TABLE_NM: "RTGS_NEFT_TRN_DTL",
                SCREEN_REF: docCD,
              });
            } else if (btnName === "No") {
              CloseFileUpload();
            }
          }}
          gridProps={{}}
          maxAllowedSize={1024 * 1204 * 10}
          allowedExtensions={
            fileData?.DESCRIPTION.split(",")[0] === "L"
              ? ["xlsx", "xls"]
              : fileData?.DESCRIPTION.split(",")[0] === "T"
              ? ["txt"]
              : fileData?.DESCRIPTION.split(",")[0] === "E"
              ? ["csv"]
              : []
          }
          onUpdateFileData={(files) => {}}
          allowMultipleFilesSelection={false}
        />
      </Dialog>
    </div>
  );
}
