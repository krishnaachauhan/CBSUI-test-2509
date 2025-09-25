import {
  Alert,
  ClearCacheProvider,
  extractMetaData,
  FormWrapper,
  GradientButton,
  MetaDataType,
  RemarksAPIWrapper,
} from "@acuteinfo/common-base";
import { Dialog, Grid } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import { t } from "i18next";
import { formMetadata } from "./formMetadata";
import { usePmbyRegForm } from "./hooks/usePmbyRegistrationForm";
import { format } from "date-fns";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import { PaperComponent } from "pages_audit/pages/operations/DailyTransaction/TRN001/components";
import JointDetails from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs/JointDetails";
import { PmbyList } from "./pmbyList";
import { AuthContext } from "pages_audit/auth";

const PmbyRegForm = ({
  isDataChangedRef,
  closeDialog,
  defaultView,
  screenType,
}) => {
  const formref = useRef<any>(null);
  const [isPhotoSign, setIsPhotoSign] = useState(false);
  const [isJointDtl, setIsJointDtl] = useState(false);
  const [reqData, setReqData] = useState<boolean>(false);
  const [pmbyListOpen, setPmbyListOpen] = useState<boolean>(false);
  const { authState } = useContext(AuthContext);
  const {
    formMode,
    formData,
    isDeleteRemark,
    setIsDeleteRemark,
    onSubmitHandler,
    mutation,
    validateEntry,
    confirmRejectMutation,
    docCD,
    MessageBox,
    handleSave,
    handleEdit,
    handleDelete,
    handleConfirm,
    handleReject,
    handleCancel,
    handleClose,
  } = usePmbyRegForm({
    defaultView,
    screenType,
    closeDialog,
    isDataChangedRef,
    formref,
  });

  /** ---------------- Helper Handlers ---------------- */
  const handleSignView = () => setIsPhotoSign(true);
  const handleJointDtlView = () => setIsJointDtl(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "i") {
        event.preventDefault();
        setPmbyListOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /** ---------------- Button Config ---------------- */
  const getButtons = () => {
    const base = {
      new: [{ label: t("Save"), onClick: handleSave }],
      edit: [
        { label: t("Delete"), onClick: handleReject },
        { label: t("Save"), onClick: handleSave },
        { label: t("Cancel"), onClick: handleCancel },
      ],
      view:
        formMode && screenType !== "C"
          ? [
              { label: t("Delete"), onClick: handleDelete },
              { label: t("Edit"), onClick: handleEdit },
            ]
          : [],
      C: [
        { label: t("JointDetail"), onClick: handleJointDtlView },
        { label: t("SignView"), onClick: handleSignView },
        { label: t("Confirm"), onClick: handleConfirm },
        { label: t("Reject"), onClick: handleReject },
        { label: t("Close"), onClick: handleClose },
      ],
    };

    const common = [
      { label: t("Close"), onClick: closeDialog, show: ["new", "view", "C"] },
    ];

    const conditionalCButtons =
      screenType === "C"
        ? formData?.ALLOW_CONFIRM?.toUpperCase() === "N"
          ? [base.C[0], base.C[1], base.C[3], base.C[4]]
          : base.C
        : [];

    const conditionalCommon = common.filter(
      (btn) => btn.show?.includes(formMode) && screenType === "E"
    );

    return [
      ...(base[formMode] || []),
      ...conditionalCButtons,
      ...conditionalCommon,
    ];
  };

  const buttonsToRender = getButtons();

  /** ---------------- Confirm Handlers ---------------- */
  const handleActionYes = async (val, rows) => {
    const confirm = await MessageBox({
      messageTitle: "Confirmation",
      message: "DoYouWantDeleteRow",
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
      defFocusBtnName: "Yes",
      loadingBtnName: ["Yes"],
    });

    if (confirm !== "Yes") return;

    if (screenType === "C") {
      confirmRejectMutation.mutate({
        ACTIVE: formData?.ACTIVE ?? "",
        isConfirm: false,
        ENTERED_BRANCH_CD: formData?.ENTERED_BRANCH_CD ?? "",
        ENTERED_COMP_CD: formData?.ENTERED_COMP_CD ?? "",
        TRAN_CD: formData?.TRAN_CD ?? "",
        AMOUNT: formData?.AMOUNT ?? "",
        ACTIVITY_TYPE:
          formData?.ACTIVE === "Y" ? "PMBY_REG_CONF" : "PMBY_REG_INACT",
        CONFIRMED_FLAG: formData?.CONFIRMED ?? "",
        USER_DEF_REMARKS: val,
        TRAN_DT: format(new Date(formData.TRAN_DT), "dd/MMM/yyyy"),
        ACCT_TYPE: formData?.ACCT_TYPE ?? "",
        ACCT_CD: formData?.ACCT_CD ?? "",
        ENTERED_BY: formData?.ENTERED_BY ?? "",
        BRANCH_CD: formData?.BRANCH_CD ?? "",
        COMP_CD: formData?.COMP_CD ?? "",
        REMARKS:
          formData?.ACTIVE === "Y"
            ? "Delete from PMBY Registration Confirmation"
            : "Inactive Entry reject from PMBY Registration Confirmation",
      });
    } else {
      mutation.mutate({ ...rows, _isDeleteRow: true });
    }
  };

  const handleActionNo = () => setIsDeleteRemark(false);

  return (
    <Dialog open fullWidth maxWidth="xl">
      <Grid item xs={12}>
        {(mutation.isError ||
          validateEntry.isError ||
          confirmRejectMutation.isError) && (
          <Alert
            severity="error"
            errorMsg={
              mutation.error?.error_msg ||
              validateEntry.error?.error_msg ||
              confirmRejectMutation.error?.error_msg ||
              t("Somethingwenttowrong")
            }
            errorDetail={
              mutation.error?.error_detail ||
              validateEntry.error?.error_detail ||
              confirmRejectMutation.error?.error_detail ||
              ""
            }
            color="error"
          />
        )}

        <FormWrapper
          key={`pmbyRegEntry_${formMode}`}
          ref={formref}
          metaData={extractMetaData(formMetadata, formMode) as MetaDataType}
          displayMode={formMode}
          onSubmitHandler={onSubmitHandler}
          initialValues={{
            ...formData,
            DOC_DUP_CHECK:
              defaultView === "new" ? false : formData?.DOC_DUP_CHECK === "Y",
            ACTIVE: defaultView === "new" ? true : formData?.ACTIVE === "Y",
            TRAN_DT:
              defaultView === "new"
                ? authState?.workingDate
                : formData?.TRAN_DT,
            UNIQUE_ID: defaultView === "view" ? formData?.MASKED_UNIQUE_ID : "",
            CONTACT2: defaultView === "view" ? formData?.MASKED_CONTACT2 : "",
            PAN_NO: defaultView === "view" ? formData?.MASKED_PAN_NO : "",
            REQ_DT: formData?.REQ_DT || "",
            FORM_MODE: formMode,
          }}
          formStyle={{ background: "white", height: "100vh" }}
          setDataOnFieldChange={(action, payload) => {
            if (action === "SHORTCUTKEY_PARA") setReqData(payload);
          }}
          formState={{
            formMode,
            MessageBox,
            docCD,
            acctDtlReqPara: {
              ACCT_CD: {
                ACCT_TYPE: "ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: docCD ?? "",
              },
            },
          }}
        >
          {() =>
            buttonsToRender.map((btn, idx) => (
              <GradientButton
                key={btn.label}
                onClick={btn.onClick}
                color="primary"
              >
                {btn.label}
              </GradientButton>
            ))
          }
        </FormWrapper>

        {isDeleteRemark && (
          <RemarksAPIWrapper
            TitleText="Enter Removal Remarks For PAYSLP ISSUE CONFIRMATION (RPT/15) Confirmation"
            onActionNo={handleActionNo}
            onActionYes={handleActionYes}
            isEntertoSubmit
            AcceptbuttonLabelText="Ok"
            CanceltbuttonLabelText="Cancel"
            open={isDeleteRemark}
            defaultValue="WRONG ENTRY FROM PMBY REGISTRATION MASTER (MST/611)"
            rows={formData}
          />
        )}
      </Grid>

      {isPhotoSign && (
        <div style={{ paddingTop: 10 }}>
          <PhotoSignWithHistory
            data={FormData ?? {}}
            onClose={() => setIsPhotoSign(false)}
            screenRef={docCD}
          />
        </div>
      )}

      {isJointDtl && (
        <Dialog
          open={isJointDtl}
          PaperComponent={PaperComponent}
          id="draggable-dialog-title"
          PaperProps={{ style: { width: "100%" } }}
          maxWidth="xl"
          onKeyUp={(event) => event.key === "Escape" && setIsJointDtl(false)}
        >
          <div id="draggable-dialog-title" style={{ cursor: "move" }} />
          <JointDetails
            hideHeader={false}
            reqData={{ ...formData, BTN_FLAG: "Y", custHeader: true }}
            height="350px"
            closeDialog={() => setIsJointDtl(false)}
          />
        </Dialog>
      )}

      {pmbyListOpen && (
        <PmbyList
          onClose={() => setPmbyListOpen(false)}
          reqData={formMode !== "new" ? formData : reqData}
        />
      )}
    </Dialog>
  );
};

export const PmbyRegMstEntry = (props) => (
  <ClearCacheProvider>
    <PmbyRegForm {...props} />
  </ClearCacheProvider>
);
