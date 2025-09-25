import { useContext, useRef, useState } from "react";
import { StandingInstructionMainMetaData } from "./metaData/metaData";
import { AuthContext } from "pages_audit/auth";
import { CircularProgress, Dialog } from "@mui/material";
import {
  GradientButton,
  usePopupContext,
  extractMetaData,
  utilFunction,
  MetaDataType,
  FormWrapper,
  Alert,
} from "@acuteinfo/common-base";
import { useMutation } from "react-query";

import * as API from "./api";
import { SubmitFnType } from "@acuteinfo/common-base";
import { format } from "date-fns/esm";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { GeneralAPI } from "registry/fns/functions";
import { getdocCD } from "components/utilFunction/function";
import { useLocation } from "react-router-dom";
import { PaperComponent } from "../DailyTransaction/TRN001/components";
const StandingInstruction = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  data,
}) => {
  const { authState } = useContext(AuthContext);
  const [formMode, setFormMode] = useState(defaultView);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const shrtctKeysRef = useRef<any>(null);
  const [siDetails, setSiDetails] = useState<any>({
    SI_SDT: [{ COMP_CD: authState?.companyID }],
  });
  const isErrorFuncRef = useRef<any>(null);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const validDataMutation = useMutation(API.validateStandingInstructionData, {
    onSuccess: async (data) => {
      if (data?.[0]?.O_STATUS === "0") {
        const btnName = await MessageBox({
          message: t("SaveData"),
          messageTitle: t("Confirmation"),
          buttonNames: ["Yes", "No"],
          icon: "CONFIRM",
          loadingBtnName: ["Yes"],
        });
        if (btnName === "Yes") {
          mutation.mutate({
            ...isErrorFuncRef.current?.data,
          });
        }
        // }
      } else if (data?.[0]?.O_STATUS === "999") {
        const messages = data.map((item) => item.O_MESSAGE).join("\n");
        MessageBox({
          messageTitle: t("ValidationFailed"),
          message: messages,
          icon: "ERROR",
        });
      }
    },
    onError: (error: any) => {},
  });

  const mutation = useMutation(API.addStandingInstructionTemplate, {
    onError: (error: any) => {
      let errorMsg = t("Unknownerroroccured");
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
      CloseMessageBox();
    },
    onSuccess: (data) => {
      enqueueSnackbar(t("doneSuccess"), {
        variant: "success",
      });
      isDataChangedRef.current = true;
      CloseMessageBox();
      closeDialog();
    },
  });

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError
  ) => {
    endSubmit(true);

    const newData = data.SI_SDT;
    const oldData = [];
    const updatedNewData = newData
      ? newData.map((item) => {
          const validUpto = new Date(item?.VALID_UPTO);
          const selectedDate = new Date(item?.VALID_UPTO);
          selectedDate.setHours(new Date().getHours());
          selectedDate.setMinutes(new Date().getMinutes());
          selectedDate.setSeconds(new Date().getSeconds());
          const formattedDate = format(selectedDate, "dd/MM/yyyy HH:mm:ss");

          return {
            ...item,
            COMP_CD: authState?.companyID,
            VALID_UPTO: formattedDate,
          };
        })
      : [];

    let updPara2 = utilFunction.transformDetailDataForDML(
      oldData ? oldData : [],
      updatedNewData ? updatedNewData : [],
      ["TRAN_CD"]
    );

    isErrorFuncRef.current = {
      data: {
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        DEF_TRAN_CD: data.COMM_TYPE_DESC,
        DESCRIPTION: data.DESCRIPTION,
        _isNewRow: defaultView === "new" ? true : false,
        SI_SDT: {
          ...updPara2,
        },
      },
      displayData,
      endSubmit,
      setFieldError,
    };

    validDataMutation.mutate({
      START_DT: format(new Date(data.SI_SDT[0].START_DT), "dd/MMM/yyyy") ?? "",
      EXECUTE_DAY: data.SI_SDT[0].EXECUTE_DAY ?? "",
      SI_AMOUNT: data.SI_SDT[0].SI_AMOUNT ?? "",
      VALID_UPTO:
        format(new Date(data.SI_SDT[0].VALID_UPTO), "dd/MMM/yyyy") ?? "",
      WORKING_DATE: authState?.workingDate ?? "",
      USERNAME: authState?.user?.id ?? "",
      USERROLE: authState?.role ?? "",
    });
  };
  return (
    <>
      {validDataMutation?.error && (
        <Alert
          severity="error"
          errorMsg={
            validDataMutation?.error?.error_msg ?? t("Somethingwenttowrong")
          }
          errorDetail={validDataMutation?.error?.error_detail ?? ""}
          color="error"
        />
      )}
      <FormWrapper
        key={"standingInstructionForm" + formMode}
        metaData={
          extractMetaData(
            StandingInstructionMainMetaData,
            formMode
          ) as MetaDataType
        }
        subHeaderLabel={`${t("EnteredBy")} : ${authState?.user?.id}`}
        displayMode={formMode}
        onSubmitHandler={onSubmitHandler}
        // setDataOnFieldChange={(action, payload) => {
        //   if (
        //     action === "SHORTCUTKEY_REQPARA" ||
        //     action === "SHORTCUTKEY_REQPARA2"
        //   ) {
        //     shrtctKeysRef.current = payload;
        //   }
        // }}
        initialValues={
          // data ?? {} ,
          formMode === "new"
            ? {
                ...siDetails,
              }
            : { ...siDetails?.[0]?.data }
        }
        formStyle={{
          background: "white",
        }}
        formState={{
          MessageBox: MessageBox,
          docCd: docCD,
          authState: authState,
          acctDtlReqPara: {
            CR_ACCT_CD: {
              ACCT_TYPE: "SI_SDT.CR_ACCT_TYPE",
              BRANCH_CD: "SI_SDT.CR_BRANCH_CD",
              SCREEN_REF: docCD,
            },
            DR_ACCT_CD: {
              ACCT_TYPE: "SI_SDT.DR_ACCT_TYPE",
              BRANCH_CD: "SI_SDT.BRANCH_CD",
              SCREEN_REF: docCD,
            },
          },
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            <GradientButton
              onClick={(event) => {
                handleSubmit(event, "Save");
              }}
              disabled={isSubmitting}
              endIcon={
                validDataMutation.isLoading ? (
                  <CircularProgress size={20} />
                ) : null
              }
              color={"primary"}
            >
              Save
            </GradientButton>
            <GradientButton onClick={closeDialog} color={"primary"}>
              Close
            </GradientButton>
          </>
        )}
      </FormWrapper>
    </>
  );
};

export const StandingInstructionFormWrapper = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  data,
}) => {
  return (
    <Dialog
      open={true}
      PaperProps={{
        style: {
          width: "100%",
          overflow: "auto",
        },
      }}
      PaperComponent={PaperComponent}
      id="draggable-dialog-title"
      maxWidth="lg"
    >
      <div id="draggable-dialog-title" style={{ cursor: "move" }}>
        <StandingInstruction
          closeDialog={closeDialog}
          defaultView={defaultView}
          data={data}
          isDataChangedRef={isDataChangedRef}
        />
      </div>
    </Dialog>
  );
};
