import { Box, Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "react-query";
import { updateFDInterestPayment } from "../FDInterestPayment/api";
import * as API from "./api";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { FdInterestPaymentconfFormMetaData } from "./FdInterestPaymentConfmMetaData";
import {
  LoaderPaperComponent,
  FormWrapper,
  MetaDataType,
  SubmitFnType,
  GradientButton,
  Transition,
  usePopupContext,
  queryClient,
} from "@acuteinfo/common-base";
const FdInterestPaymentconfForm = ({
  closeDialog,
  fdDetails,
  loader,
  rowsData,
}) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0); // Index for navigation
  const deleteFDInterestPaymentEntry: any = useMutation(
    "updateFDInterestPayment",
    updateFDInterestPayment,
    {
      onSuccess: async (data) => {
        const btnName = await MessageBox({
          messageTitle: "Success",
          message: "RecordReject",
          buttonNames: ["Ok"],
          icon: "SUCCESS",
        });
        queryClient.invalidateQueries([
          "getFDPaymentInstruConfAcctDtl",
          authState?.user?.branchCode ?? "",
        ]);
        CloseMessageBox();
        closeDialog();
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
    }
  );
  const doFDPaymentInstruEntryConfm: any = useMutation(
    "doFDPaymentInstruEntryConfm",
    API.doFDPaymentInstruEntryConfm,
    {
      onSuccess: async (data) => {
        const btnName = await MessageBox({
          messageTitle: "Success",
          message: "confirmMsg",
          buttonNames: ["Ok"],
          icon: "SUCCESS",
        });
        queryClient.invalidateQueries([
          "getFDPaymentInstruConfAcctDtl",
          authState?.user?.branchCode ?? "",
        ]);
        CloseMessageBox();
        closeDialog();
      },
      onError: async (error: any) => {
        const btnName = await MessageBox({
          messageTitle: "ValidationFailed",
          message: error?.error_msg ?? "",
          icon: "ERROR",
        });
        CloseMessageBox();
      },
    }
  );

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData: any,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    if (actionFlag === "Confirm") {
      if (authState?.user?.id === rowsData?.[0]?.data?.LAST_ENTERED_BY) {
        const btnName = await MessageBox({
          messageTitle: "InvalidConfirmation",
          message: "ConfirmRestrictMsg",
          icon: "ERROR",
        });
      } else {
        const btnName = await MessageBox({
          messageTitle: "Confirmation",
          message: "ConfirmMsg",
          buttonNames: ["Yes", "No"],
          loadingBtnName: ["Yes"],
          icon: "CONFIRM",
        });
        if (btnName === "Yes") {
          doFDPaymentInstruEntryConfm?.mutate({
            DETAIL_DATA: {
              isNewRow: [],
              isDeleteRow: [],
              isUpdateRow: fdDetails,
            },
          });
        }
      }
    } else if (actionFlag === "Reject") {
      const btnName = await MessageBox({
        messageTitle: "Confirmation",
        message: "ConfirmReject",
        buttonNames: ["Yes", "No"],
        loadingBtnName: ["Yes"],
        icon: "CONFIRM",
      });
      if (btnName === "Yes") {
        deleteFDInterestPaymentEntry?.mutate({
          DETAILS_DATA: {
            isDeleteRow: fdDetails,
            isUpdatedRow: [],
            isNewRow: [],
          },
        });
      }
    }
  };

  const changeIndex = (direction) => {
    setCurrentIndex((prevIndex) => {
      const nextIndex =
        direction === "next"
          ? (prevIndex + 1) % fdDetails?.length
          : (prevIndex - 1 + fdDetails?.length) % fdDetails?.length;
      return nextIndex;
    });
  };

  const metaData: any = useMemo(() => {
    return {
      ...FdInterestPaymentconfFormMetaData,
      fields: FdInterestPaymentconfFormMetaData?.fields.map((field) =>
        field?.render?.componentType === "arrayField"
          ? {
              ...field,
              isDisplayCount: false,
              fixedRows: true,
            }
          : field?.name === "FD_CONFM_ROW_COUNT"
          ? {
              ...field,
              label: `Rows ${currentIndex + 1} of ${fdDetails?.length} `,
            }
          : field
      ),
    };
  }, [fdDetails, currentIndex]);
  const initialValue = useMemo(() => {
    if (!fdDetails || fdDetails.length === 0) return { FDINTPAYDTL: [] };

    return {
      BRANCH_CD: rowsData?.[0]?.data?.BRANCH_CD ?? "",
      ACCT_TYPE: rowsData?.[0]?.data?.ACCT_TYPE ?? "",
      ACCT_CD: rowsData?.[0]?.data?.ACCT_CD ?? "",
      ACCT_NM: rowsData?.[0]?.data?.ACCT_NM ?? "",
      TOTAL_DEPOSIT_AMOUNT: fdDetails.reduce(
        (acc, item) => acc + (Number(item?.TOT_AMT) || 0),
        0
      ),
      TOTAL_MATURITY_AMOUNT: fdDetails.reduce(
        (acc, item) => acc + (Number(item?.MATURITY_AMT) || 0),
        0
      ),
      FDINTPAYDTL: [
        {
          ...(fdDetails?.[currentIndex] ?? {}),
        },
      ],
    };
  }, [fdDetails, currentIndex, rowsData]);

  return (
    <>
      {loader ? (
        <LoaderPaperComponent />
      ) : (
        <FormWrapper
          key={"FdInterestPaymentConfmMetaData" + currentIndex}
          metaData={metaData as MetaDataType}
          onSubmitHandler={onSubmitHandler}
          initialValues={initialValue}
          formState={{ fdDetails: fdDetails }}
          displayMode={"view"}
          formStyle={{
            background: "white",
            margin: "10px 0",
            minHeight: "45vh",
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              <GradientButton
                startIcon={<ArrowBackIosNewIcon />}
                disabled={1 === currentIndex + 1}
                onClick={() => changeIndex("previous")}
                color={"primary"}
              >
                {t("Prev")}
              </GradientButton>
              <GradientButton
                endIcon={<ArrowForwardIosIcon />}
                disabled={currentIndex + 1 === fdDetails.length}
                onClick={() => changeIndex("next")}
                color={"primary"}
              >
                {t("Next")}
              </GradientButton>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Confirm");
                }}
                disabled={rowsData?.[0]?.data?.ALLOW_CONFIRM === "N"}
                color={"primary"}
              >
                {t("Confirm")}
              </GradientButton>
              <GradientButton
                onClick={(event) => {
                  handleSubmit(event, "Reject");
                }}
                color={"primary"}
              >
                {t("Reject")}
              </GradientButton>
              <GradientButton onClick={closeDialog} color={"primary"}>
                {t("Close")}
              </GradientButton>
            </>
          )}
        </FormWrapper>
      )}
    </>
  );
};

export const FdInterestPaymentConfDetail = ({
  closeDialog,
  fdDetails,
  loader,
  rowsData,
}) => {
  return (
    <>
      {fdDetails ? (
        <FdInterestPaymentconfForm
          closeDialog={closeDialog}
          fdDetails={fdDetails}
          loader={loader}
          rowsData={rowsData}
        />
      ) : (
        <LoaderPaperComponent />
      )}
    </>
  );
};
