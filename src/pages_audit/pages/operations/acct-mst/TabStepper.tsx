import * as React from "react";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Check from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import VideoLabelIcon from "@mui/icons-material/VideoLabel";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";
import { tabPanelClasses } from "@mui/base";
import { Badge, Icon } from "@mui/material";
import { AcctMSTContext } from "./AcctMSTContext";
import * as Icons from "@mui/icons-material";
import _ from "lodash";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  }),
  ...(ownerState.completed && {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
  }),
}));

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <SettingsIcon />,
    2: <GroupAddIcon />,
    3: <VideoLabelIcon />,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const steps = [
  "Personal Details",
  "KYC",
  "Declaration",
  "Related Person Details",
  "Other Details",
  "Other Address",
  "NRI Details",
  "Attestation",
];

const TabStepper = ({
  allTabsteps = [],
  asDialog,
}: {
  allTabsteps?: any;
  asDialog?: boolean;
}) => {
  // const { state, handleColTabChangectx } = React.useContext(CkycContext);
  const {
    AcctMSTState,
    tabFormRefs,
    handleColTabChangectx,
    handleUpdateLoader,
    submitRefs,
    handleUpdateViewedTabs,
  } = React.useContext(AcctMSTContext);

  const QontoConnector = styled(StepConnector)(({ theme }) => {
    //
    return {
      [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: "calc(-50% + 16px)",
        right: "calc(50% + 16px)",
      },
      [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
          borderColor: theme.palette.grey[500],
        },
      },
      [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
          // borderColor: '#784af4',
          borderColor: "var(--theme-color3)",
        },
      },
      [`& .${stepConnectorClasses.line}`]: {
        borderColor:
          theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
        borderTopWidth: 3,
        borderRadius: 1,
      },
    };
  });

  const QontoStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
    ({ theme, ownerState }) => ({
      color:
        theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
      display: "flex",
      height: 22,
      fontSize: 28,
      alignItems: "center",
      "& .QontoStepIcon-circle": {
        color: theme.palette.grey[500],
        ...(ownerState.active && {
          color: "var(--theme-color1)",
          span: {
            fontSize: 32,
          },
        }),
      },
      "& .QontoStepIcon-completedIcon": {
        // color: '#784af4',
        color: "#4CAF50",
        // color: "red",
        zIndex: 1,
        fontSize: 28,
        fontWeight: "bold",
        ...(ownerState.active && {
          color: "var(--theme-color1)",
          span: {
            fontSize: 32,
          },
        }),
      },
      "& .QontoStepIcon-redcircle": {
        color: "#d02e2e",
        zIndex: 1,
        fontSize: 28,
        fontWeight: "bold",
        ...(ownerState.active && {
          span: {
            fontSize: 32,
          },
        }),
      },
    })
  );

  const QontoStepIcon = (props: StepIconProps, isViewed: boolean) => {
    const { active, completed, error, className } = props;
    let IconsComp: { [index: string]: any } = {};
    const steps = AcctMSTState?.tabNameList?.length
      ? AcctMSTState?.tabNameList
      : allTabsteps;
    steps?.forEach((tabEl, i) => {
      IconsComp[i + 1] = Icons[tabEl.icon] ?? Icons["HowToReg"];
    });
    const AppIcon = IconsComp[String(props.icon)];
    return (
      <QontoStepIconRoot ownerState={{ active }} className={className}>
        {error ? (
          <div className="QontoStepIcon-redcircle">
            <AppIcon fontSize="large" />
          </div>
        ) : completed ? (
          // <Check className="QontoStepIcon-completedIcon" />
          <div className="QontoStepIcon-completedIcon">
            <AppIcon fontSize="large" />
          </div>
        ) : isViewed ? (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            badgeContent={
              <CheckCircleIcon
                style={{
                  color: "green",
                  fontSize: 16,
                  background: "white",
                  borderRadius: "50%",
                }}
              />
            }
          >
            <div className="QontoStepIcon-circle">
              <AppIcon fontSize="large" />
            </div>{" "}
          </Badge>
        ) : (
          <div className="QontoStepIcon-circle">
            <AppIcon fontSize="large" />
          </div>
        )}
      </QontoStepIconRoot>
    );
  };
  const steps = AcctMSTState?.tabNameList.filter((tab) => tab.isVisible);

  const handleAllTabSaveFunction = _.throttle(
    async (e, tabIndex) => {
      const prevTabIndex = AcctMSTState?.colTabValuectx;
      const prevTabRef = tabFormRefs.current[prevTabIndex];

      if (Array?.isArray(prevTabRef)) {
        await Promise?.all(
          prevTabRef?.map((ref) =>
            ref && ref?.handleSubmit
              ? ref?.handleSubmit(e, `TabChange ${tabIndex}`)
              : Promise?.resolve()
          )
        );
        submitRefs.current = false;
        handleUpdateLoader(false);
      } else if (prevTabRef && prevTabRef.handleSubmit) {
        if (prevTabRef?.handleSubmit?.name === "handleSave") {
          prevTabRef.handleSubmit(e, `TabChange ${tabIndex}`);
        } else {
          prevTabRef.handleSubmit(e, `TabChange ${tabIndex}`, false);
        }
      }
    },
    2000,
    { leading: true, trailing: false }
  );

  const onStepClickHandle = (e, tabIndex) => {
    // handleColTabChangectx(tabIndex);

    if (submitRefs.current) {
      return;
    }
    if (AcctMSTState?.loader) {
      return;
    }
    if (tabIndex === AcctMSTState?.colTabValuectx) {
      handleUpdateLoader(false);

      return; // No action if the same tab is clicked
    } else {
      if (AcctMSTState?.formmodectx === "view") {
        // Mark the clicked tab as viewed by setting isViewed=true in tabNameList
        const updatedTabNameList = (AcctMSTState?.tabNameList || []).map(
          (tab, idx) => (idx === tabIndex ? { ...tab, isViewed: true } : tab)
        );
        handleUpdateViewedTabs({
          tabNameList: updatedTabNameList,
        });
        handleColTabChangectx(tabIndex);
      } else {
        submitRefs.current = true;
        handleAllTabSaveFunction(e, tabIndex);
      }
    }
  };

  return (
    <Stack sx={{ width: "100%" }} spacing={4}>
      <Stepper
        alternativeLabel
        activeStep={AcctMSTState?.colTabValuectx}
        connector={<QontoConnector />}
      >
        {steps.map((tabEl, i) => {
          const isModified = Boolean(
            AcctMSTState?.steps?.[i] &&
              AcctMSTState?.steps?.[i]?.status === "completed"
          );
          const hasError = Boolean(
            AcctMSTState?.steps?.[i] &&
              AcctMSTState?.steps?.[i]?.status === "error"
          );
          const isViewed =
            AcctMSTState?.fromctx === "confirmation-entry" && tabEl?.isViewed;
          const classNm = hasError
            ? "tab-error"
            : isModified
            ? "tab-modified"
            : "";
          // if(tabEl.isVisible) {
          return (
            <Step
              sx={{}}
              key={tabEl.tabName}
              className={classNm}
              completed={AcctMSTState?.steps?.[i]?.status == "completed"}
            >
              <StepLabel
                error={AcctMSTState?.steps?.[i]?.status == "error"}
                sx={{ cursor: "pointer" }}
                StepIconComponent={(props) => QontoStepIcon(props, isViewed)}
                className={classNm}
                onClick={(e) => {
                  if (!AcctMSTState?.isTabDisable) {
                    onStepClickHandle(e, i);
                  }
                }}
              >
                {tabEl?.tabName || tabEl?.TAB_DISPL_NAME}
              </StepLabel>
            </Step>
          );
          // }
        })}
      </Stepper>
      {/* <Stepper alternativeLabel activeStep={1} connector={<ColorlibConnector />}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper> */}
    </Stack>
  );
};

export default TabStepper;
