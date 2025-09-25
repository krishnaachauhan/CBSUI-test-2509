import DescriptionIcon from "@mui/icons-material/Description";
import ApartmentIcon from "@mui/icons-material/Apartment";
import {
  Alert,
  ColorlibConnector,
  ColorlibStepIconRoot,
  GradientButton,
  utilFunction,
} from "@acuteinfo/common-base";
import { CSSProperties, useContext, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  Toolbar,
  AppBar,
} from "@mui/material";
import { MortgageContext } from "./mortgageContext";
import { useTypeStyles } from "pages_audit/pages/operations/LockerOperationTrns/lockerOperationTrns";
import { useLocation } from "react-router-dom";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import { Box } from "@mui/system";

interface ErrorDetail {
  error: {
    error_msg?: string;
    error_detail?: string;
  };
  isError: boolean;
}
export const stickyHeaderBox: CSSProperties = {
  position: "sticky",
  top: 0,
  minHeight: "118px",
  zIndex: 1,
  overflow: "hidden",
};
export const ContainerBox: CSSProperties = {
  width: "100%",
  position: "relative",
  height: "auto",
  overflow: "auto",
};

export const stickyFooterBox: CSSProperties = {
  display: "flex",
  position: "sticky",
  top: "100%",
  flexDirection: "row-reverse",
  margin: "7px !important",
};
export const commonHeaderTypographyProps = {
  variant: "subtitle2",
  style: {
    margin: "8px 0 10px 0",
    fontSize: "14px",
    width: "100%",
    color: "red",
    background: "rgb(238, 238, 238)",
    borderRadius: "5px",
    padding: "6px 0",
  },
};
export const StepperContentBox: CSSProperties = {
  marginTop: "0px",
  overflowY: "auto",
  maxHeight: "calc(90vh - 150px)",
  borderBottom: "2px solid var(--theme-color4)",
};
export const EquitableIcons = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
      <DescriptionIcon fontSize="small" />
    </Box>
  );
};
export const MortgageIcon = () => {
  return (
    <Box
      sx={{
        background: "#07288E",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
      }}
    >
      <ApartmentIcon
        fontSize="large"
        style={{ color: "white", padding: "5px" }}
      />
    </Box>
  );
};
export const ColorlibStepIcon = (props: any) => {
  const { active, completed, className } = props;
  const icons: { [index: string]: React.ReactElement } = {
    1: <EquitableIcons />,
    2: <MortgageIcon />,
  };
  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
};
export const ActionHeader = ({
  formMode,
  setFormMode,
  mortgageDTLformref,
  closeDialog,
  handleComplete,
}) => {
  const { dataState, resetAllData, setActiveStep } =
    useContext(MortgageContext);
  const { authState } = useContext(AuthContext);
  const headerClasses = useTypeStyles();
  const currentPath = useLocation().pathname;
  const isStepOne = dataState?.activeStep === 1;

  const handleSubmit = (e) => mortgageDTLformref.current?.handleSubmit(e);
  const handleClose = () => {
    closeDialog();
    setActiveStep(0);
  };

  const buttons = {
    edit: (
      <>
        <GradientButton
          onClick={async (e) => {
            if (dataState?.activeStep === 0) {
              await handleComplete(e);
            }
            await handleSubmit(e);
          }}
        >
          {t("Save")}
        </GradientButton>

        <GradientButton onClick={() => setFormMode("view")}>
          {t("Cancel")}
        </GradientButton>
      </>
    ),
    add: (
      <>
        {isStepOne && (
          <GradientButton onClick={handleSubmit}>{t("Save")}</GradientButton>
        )}
        <GradientButton
          onClick={() => {
            resetAllData();
            handleClose();
          }}
        >
          {t("Close")}
        </GradientButton>
      </>
    ),
    view: (
      <>
        <GradientButton onClick={() => setFormMode("edit")}>
          {t("Edit")}
        </GradientButton>
        <GradientButton onClick={handleClose}>{t("Close")}</GradientButton>
      </>
    ),
  };

  return (
    <AppBar
      className="form__header"
      style={{ marginBottom: 22, position: "relative" }}
    >
      <Toolbar variant="dense" className={headerClasses.root}>
        <Typography
          variant="h5"
          component="span"
          className={headerClasses.title}
        >
          {utilFunction.getDynamicLabel(
            currentPath,
            authState?.menulistdata,
            true
          )}
        </Typography>
        {buttons[formMode]}
      </Toolbar>
    </AppBar>
  );
};
export const MortgageStepper = ({
  activeStep = 0,
  errorData = [],
}: {
  activeStep?: number;
  errorData: ErrorDetail[];
}) => {
  const [steps] = useState([
    t("Equitable Header Details"),
    t("Equitable Mortgage Details"),
  ]);

  return (
    <>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<ColorlibConnector />}
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={ColorlibStepIcon}
              componentsProps={{
                label: {
                  style: {
                    marginTop: "2px",
                    color: "var(--theme-color1)",
                  },
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {errorData
        .filter(({ isError }) => isError)
        .map(({ error }, index) => (
          <Alert
            key={index}
            severity="error"
            errorMsg={error?.error_msg || t("Somethingwenttowrong")}
            errorDetail={error?.error_detail ?? ""}
            color="error"
          />
        ))}
    </>
  );
};
export const StepperActions = ({
  activeStep,
  handleComplete,
  setActiveStep,
  setIsBackButton,
  mortgageDTLformref,
  updateMortgageEntryData,
  formMode,
}) => {
  const steps = 2;
  return (
    <Box sx={stickyFooterBox}>
      {activeStep !== steps &&
        (activeStep !== steps - 1 ? (
          <GradientButton onClick={handleComplete} color="primary">
            {t("Next")}
          </GradientButton>
        ) : (
          <GradientButton
            onClick={(e) => mortgageDTLformref.current?.handleSubmit(e)}
            color="primary"
            disabled={formMode === "view"}
          >
            {t("Save")}
          </GradientButton>
        ))}

      {activeStep > 0 && (
        <GradientButton
          onClick={async () => {
            setIsBackButton(true);
            setActiveStep(activeStep - 1);
            const mortgageData =
              await mortgageDTLformref?.current?.getFieldData();
            updateMortgageEntryData(mortgageData?.EQUITABLE_MORTGAGE_DETAILS);
          }}
        >
          {t("Back")}
        </GradientButton>
      )}
    </Box>
  );
};
export const getUnmatchedSrCds = (data) => {
  const mortgageDetails = data?.MORTAGE_DETAIL_ENTRY?.isNewRow || [];
  const propertyHolderDetails = data?.PROPERTY_HOLDER_DETAILS?.isNewRow || [];

  const holderSrCdSet = new Set(
    propertyHolderDetails.map((item) => item.SR_CD?.toString().trim())
  );

  const unmatchedSrCds = mortgageDetails
    .map((item) => item.SR_CD?.toString().trim())
    .filter((srCd) => srCd && !holderSrCdSet.has(srCd));

  return unmatchedSrCds;
};
