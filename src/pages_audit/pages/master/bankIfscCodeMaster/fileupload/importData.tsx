import { useState } from "react";
import { useMutation } from "react-query";
import * as API from "../api";
import { enqueueSnackbar } from "notistack";
import { Dialog } from "@mui/material";
import {
  usePopupContext,
  ActionTypes,
  FileUploadControl,
  GradientButton,
  FormWrapper,
  MetaDataType,
  SubmitFnType,
} from "@acuteinfo/common-base";
import { selectConfigGridMetaData } from "../viewDetails/metaData";
import { t } from "i18next";
const actions: ActionTypes[] = [
  {
    actionName: "upload",
    actionLabel: "Upload",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
  {
    actionName: "close",
    actionLabel: "Close",
    multiple: undefined,
    rowDoubleClick: false,
    alwaysAvailable: true,
  },
];

export default function ImportData({ CloseFileUpload, refetchData }) {
  const [isFileUpload, setIsFileUpload] = useState(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [fileData, setFileData] = useState<any>(null);

  const mutation = useMutation(API.uploadFileData, {
    onError: (error: any) => {
      let errorMsg = "Unknown Error occured";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
      CloseFileUpload();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("dataImportedSuccessfully"), {
        variant: "success",
      });
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
    setIsFileUpload(true);
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
      <Dialog fullWidth maxWidth="md" open={isFileUpload}>
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
              message: "Are you sure to Insert the File Data ?",
              messageTitle: "Confirmation",
              buttonNames: ["Yes", "No"],
              loadingBtnName: ["Yes"],
            });

            if (btnName === "Yes") {
              const FILE_FORMAT = fileData?.DESCRIPTION.split(",")[0];
              const TRAN_CD = fileData?.DESCRIPTION.split(",")[1];
              const FILEBLOB = base64Object;
              mutation.mutate({
                FILE_FORMAT,
                TRAN_CD,
                FILEBLOB,
                ACCT_CD: "XX",
                ACCT_TYPE: "XX",
                SCROLL_NO: "",
                CHEQUE_NO: "",
                REMARKS: "",
                TABLE_NM: "RTGS_IFSCCODE_MST",
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
