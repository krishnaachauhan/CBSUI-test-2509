import React, {
  Fragment,
  lazy,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AppBar,
  Box,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Toolbar,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import HomeIcon from "@mui/icons-material/Home";
import VideoLabelIcon from "@mui/icons-material/VideoLabel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { StepIconProps } from "@mui/material/StepIcon";
import { useLocation, useNavigate } from "react-router-dom";
import { SecurityContext } from "../context/SecuityForm";
import { AuthContext } from "pages_audit/auth";
import { useMutation, useQuery } from "react-query";
import * as API from "../api";
import { ETFGeneralAPI } from "pages_audit/pages/EasyTradeFinance/generalAPI/general";
//import LCDetails from "./lcDetail";
import { getdocCD } from "components/utilFunction/function";
import TradeMainForm from "../mainForm/tradeMainForm";

import {
  ColorlibConnector,
  ColorlibStepIconRoot,
  FormWrapper,
  GradientButton,
  queryClient,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import { enqueueSnackbar } from "notistack";
import { t } from "i18next";
import { Save } from "@mui/icons-material";
import { validateGridAndGetData } from "components/agGridTable/utils/helper";

const componentMap = {
  LCDetail: lazy(() => import("./lcDetail")),
  BenDtl: lazy(() => import("./lcBenficiary")),
  MarginDtl: lazy(() => import("./marginDTL")),
  LCShipmentDtl: lazy(() => import("./lcShipmentDtl")),
  LCChargeDtl: lazy(() => import("./LcChargeDtl")),
};

const CombinedStepper = ({ defaultView, flag }) => {
  const navigate = useNavigate();
  const {
    userState,
    setActiveStep,
    resetAllData,
    setIsBackButton,
    dispatchCommon,
    setFlag,
    tabRefs,
  } = useContext(SecurityContext);
  const userRef = useRef(userState);
  userRef.current = userState;
  const { state: rows } = useLocation();
  const submitEventRef = useRef(null);
  const masterRef = useRef<any>(null);
  const [disableButton, setDisableButton] = useState(false);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const [allStepData, setAllStepData] = useState({});
  const FormData = useRef<any>(null);
  const [gridData, setGridData] = useState<any>({
    setData: [],
  });
  const { data: stepperData, isLoading } = useQuery<any, any>(
    ["getStepperValue"],
    async () =>
      await API.getDocStepper({
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        DOC_TYPE: rows?.docType,
        FUNC_TYPE: rows?.function_id,
      })
  );
  const translatedSteps = stepperData?.map((item) => t(item.BTN_NAME));

  const icons = {
    1: <VideoLabelIcon />,
    2: <PersonAddIcon />,
    3: <HomeIcon />,
    4: <GroupAddIcon />,
    5: <SettingsIcon />,
    6: <FingerprintIcon />,
  };

  // const addMutation = useMutation(API.saveuserdata, {
  //   onError: async (error: any) => {
  //     let errorMsg = "Unknown Error occurred";
  //     if (typeof error === "object") {
  //       errorMsg = error?.error_msg ?? errorMsg;
  //     }
  //     CloseMessageBox();
  //     enqueueSnackbar(errorMsg, {
  //       variant: "error",
  //     });
  //   },
  //   onSuccess: async (data) => {
  //     CloseMessageBox();
  //     //@ts-ignore
  //     enqueueSnackbar(data, {
  //       variant: "success",
  //     });
  //     resetAllData();
  //     setActiveStep(0);
  //     navigate("/EnfinityTradeFin/master/security-user");
  //   },
  // });

  const addMutation = useMutation(API.saveuserdata, {
    onError: (error: any) => {
      enqueueSnackbar(error?.error_msg ?? "Unknown Error occurred", {
        variant: "error",
      });
    },
    onSuccess: async (data) => {
      enqueueSnackbar(data, { variant: "success" });
      const secondResp = await MessageBox({
        message: "Do you want to do Another Entry",
        messageTitle: "Confirmation",
        buttonNames: ["OK", "Cancel"],
        icon: "CONFIRM",
      });
      console.log("<<<secondResp", secondResp);

      if (secondResp === "OK") {
        // navigate("/EnfinityCore/easy-trade-finance/");
        navigate("/EnfinityTradeFin/master/security-user");
      } else if (secondResp === "Cancel") {
        navigate("/EnfinityCore/easy-trade-finance/operation/import-lc-entry/");
      }
    },
  });

  const editMutation = useMutation(API.UpdateDMLData, {
    onError: async (error: any) => {
      let errorMsg = "Unknown Error occurred";
      if (typeof error === "object") {
        errorMsg = error?.error_msg ?? errorMsg;
      }
      CloseMessageBox();
      enqueueSnackbar(errorMsg, {
        variant: "error",
      });
    },
    onSuccess: async (data) => {
      CloseMessageBox();
      enqueueSnackbar(data, {
        variant: "success",
      });
      resetAllData();
      setActiveStep(0);
    },
  });

  function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;
    const icon = icons[String(props.icon)];

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {icon}
      </ColorlibStepIconRoot>
    );
  }
  const SaveData = async () => {
    const btnName = await MessageBox({
      message: "SaveData",
      messageTitle: "Confirmation",
      buttonNames: ["Yes", "No"],
      icon: "CONFIRM",
      loadingBtnName: ["Yes"],
    });
    if (btnName === "Yes") {
      if (flag === "addMode") {
        addMutation.mutate({
          onboard: userRef?.current?.formData,
        });
      } else {
        editMutation.mutate({
          onboard: userRef?.current?.formData,
        });
      }
    }
  };

  const handleComplete = async (e, tabIndex = 0, display_flag = "") => {
    submitEventRef.current = e;

    if (flag === "addMode") {
      FormData?.current?.handleSubmit(e, "", false);
      const formData = await FormData.current?.getFieldData?.();

      if (tabRefs.current) {
        if (display_flag === "labelClick") {
          setActiveStep(tabIndex);
        } else if (display_flag !== "finishClick") {
          setActiveStep(userState?.activeStep + 1);
        }

        const updatedData = {
          ...allStepData,
          [userState?.activeStep]: formData,
        };
        setAllStepData(updatedData);

        setGridData({
          setData: [
            {
              MARGIN_AMOUNT: updatedData?.[0].TOTAL_MARGIN_AMT,
              A_AMOUNT: updatedData?.[0]?.LC_INR_AMT,
              LC_TRAN_CD: stepperData?.[0],
              LC_DETAIL: updatedData?.[0],
            },
          ],
        });

        if (
          userState?.activeStep === translatedSteps.length - 1 &&
          display_flag === "finishClick"
        ) {
          setActiveStep(userState.activeStep);

          masterRef.current?.handleSubmit(e);
          const masterData = await masterRef.current?.getFieldData?.();
          const isError = (await FormData?.current?.isError()) || false;

          const finalPayload = {
            master: masterData,
            steps: updatedData,
          };
          if (isError) {
            return;
          } else {
            const btnName = await MessageBox({
              message: "Do you want to save this data?",
              messageTitle: "Confirmation",
              buttonNames: ["OK", "Cancel"],
              icon: "CONFIRM",
              // loadingBtnName: ["OK"],
            });

            if (btnName === "OK") {
              if (flag === "addMode") {
                addMutation.mutate({ onboard: finalPayload });
              } else {
                editMutation.mutate({ onboard: finalPayload });
              }
            }
          }
        }
      }
    } else if (flag === "editMode") {
      if (userState?.activeStep === 0) {
        FormData.current?.handleSubmit(e);
      }
    } else if (flag === "viewMode") {
      console.log("View Mode");
    }
    // editMode / viewMode no change
  };

  const onStepClickHandle = async (e, tabIndex) => {
    if (tabIndex < userState?.activeStep) {
      setIsBackButton(true);
      setActiveStep(tabIndex);
      return;
    }

    if (flag === "viewMode" || flag === "editMode") {
      setActiveStep(tabIndex);
    } else {
      handleComplete(e, tabIndex, "labelClick");
    }
  };

  useEffect(() => {
    return () => {
      setActiveStep(0);
      setFlag("true");
      resetAllData();
    };
  }, []);
  const handleButtonDisable = (disable) => {
    setDisableButton(disable);
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getStepperValue"]);
    };
  }, []);
  // Function to convert function strings in the form metadata
  const convertFunctions = (obj) => {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const value = obj[key];

      if (typeof value === "object" && value !== null) {
        // Recursively convert nested objects
        convertFunctions(value);
      } else if (key.endsWith("Function") && typeof value === "string") {
        try {
          // Convert string to real function
          const fn = new Function("return " + value)();
          const newKey = key.replace(/Function$/, ""); // Remove "Function" from the key
          obj[newKey] = fn;
          delete obj[key];
        } catch (err) {
          console.warn(
            `Failed to convert function string for key: ${key}`,
            err
          );
        }
      }
    }
    return obj;
  };

  //mapping the stepper data to the required format
  const sortedStepperData = Array.isArray(stepperData)
    ? stepperData
        .sort((a, b) => a.DOC_SEQUENCE - b.DOC_SEQUENCE)
        .map((item) => ({
          ...item,
          formMetaData: convertFunctions(
            item.FORM_METADATA ? JSON.parse(item.FORM_METADATA) : {}
          ),
        }))
    : [];

  const currentStepInfo = sortedStepperData[userState?.activeStep];
  const CurrentComponent = componentMap[currentStepInfo?.PAGE_NM];

  return (
    <Fragment>
      <TradeMainForm ref={masterRef} defaultView={"New"} />
      <Stack sx={{ width: "100%" }} spacing={5}>
        <Stepper
          alternativeLabel
          activeStep={userState?.activeStep}
          connector={<ColorlibConnector />}
        >
          {translatedSteps?.map((label, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={ColorlibStepIcon}
                componentsProps={{
                  label: {
                    style: {
                      marginTop: "2px",
                      color: "var(--theme-color1)",
                      cursor: "pointer",
                    },
                  },
                }}
                onClick={(e) => {
                  onStepClickHandle(e, index);
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box style={{ margin: "0px 0px 2px 0px" }}>
          {!isLoading && CurrentComponent && (
            <CurrentComponent
              key={currentStepInfo?.PAGE_NM}
              ref={FormData}
              defaultView={defaultView}
              flag={flag}
              handleButtonDisable={handleButtonDisable}
              formMetaData={currentStepInfo?.formMetaData}
              sharing={rows}
              gridData={gridData?.setData}
              stepperRawData={stepperData}
              //initialVal={allStepData[userState?.activeStep]}
              initialVal={
                allStepData[userState?.activeStep] === undefined
                  ? CurrentComponent === componentMap.LCDetail
                    ? {
                        LIMIT_AMT: rows?.TRAN_BAL,
                        notional_curr_rate: rows?.CCY_RATE,
                      }
                    : allStepData[userState?.activeStep]
                  : allStepData[userState?.activeStep]
              }
            />
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            margin: "3px 10px 100px 0px !important",
            justifyContent: "right",
          }}
        >
          {userState?.activeStep === 0 ? null : (
            <GradientButton
              onClick={() => {
                setIsBackButton(true);
                setActiveStep(userState?.activeStep - 1);
              }}
            >
              {t("Previous")}
            </GradientButton>
          )}
          {(flag === "editMode" || flag === "addMode") && (
            <>
              {userState?.activeStep !== translatedSteps?.length - 1 ? (
                <GradientButton
                  onClick={handleComplete}
                  disabled={disableButton}
                >
                  {t("SaveandNext")}
                </GradientButton>
              ) : (
                <GradientButton
                  onClick={(e) => handleComplete(e, 0, "finishClick")}
                >
                  {t("Finish")}
                </GradientButton>
              )}
            </>
          )}
          {flag === "viewMode" && (
            <>
              {userState?.activeStep !== translatedSteps.length - 1 ? (
                <GradientButton onClick={handleComplete}>
                  {t("Next")}
                </GradientButton>
              ) : null}
            </>
          )}
          {/* </Box> */}
        </Box>
      </Stack>
    </Fragment>
  );
};
export default CombinedStepper;
