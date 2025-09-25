import { lcShipmentDtl } from "./metaData/metaDataForm";
import { useLocation } from "react-router-dom";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { SecurityContext } from "../context/SecuityForm";
import { AuthContext } from "pages_audit/auth";

import {
  InitialValuesType,
  usePopupContext,
  GradientButton,
  SubmitFnType,
  extractMetaData,
  utilFunction,
  FormWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
import { L } from "ace-builds-internal/lib/bidiutil";
import { format } from "date-fns";
import { isValid } from "date-fns/esm";
import { resetColumnState } from "ag-grid-community/dist/types/src/columns/columnApi";

function removeTrailingZeroes(number) {
  let str = number.toString();
  if (str.endsWith(".00")) {
    return str.slice(0, -3);
  }
  return str;
}

const LcShipmentDtl = forwardRef<any, any>(
  (
    {
      defaultView,
      sharing,
      flag,
      handleButtonDisable,
      formMetaData,
      initialVal,
      stepperRawData,
      gridData,
    },
    ref
  ) => {
    const { authState } = useContext(AuthContext);
    const { MessageBox } = usePopupContext();
    const { state: rows } = useLocation();
    const [Modes, setModes] = useState(defaultView);
    const myRef = useRef<any>(null);
    const { userState, setActiveStep, dispatchCommon } =
      useContext(SecurityContext);
    const [stepData, setStepData] = useState(initialVal);
    const requiredData = stepperRawData?.[3]?.MANDATORY;
    const LcDate = gridData?.[0]?.LC_DETAIL?.LC_EXPIRY_DT;

    // console.log("LcDateLcDateLcDateLcDate", LcDate)
    // console.log("gridDatagridDatagridDatagridData", gridData)

    // console.log("<<<DDstepperRawData", stepperRawData)
    // console.log("<<<DDrows", stepData)

    const onAPPSubmitHandler: SubmitFnType = async (
      data: any,
      displayData,
      endSubmit,
      setFieldError,
      actionFlag
    ) => {
      endSubmit(true);
      if (flag === "addMode") {
        setStepData({ ...stepData, field: data });
        setActiveStep(userState.activeStep + 1);
      }
    };

    useEffect(() => {
      if (flag === "addMode") {
        setModes("new");
      }
    }, [Modes, flag]);

    // const updatedAddLCDtl = {
    //   ...lcShipmentDtl,
    //   fields: lcShipmentDtl.fields.map((field) => {
    //     if (requiredData === "N") {
    //       return {
    //         ...field,
    //         required: false,
    //         schemaValidation: {},
    //        // validate: () => { }
    //       };
    //     }
    //     return field;
    //   }),
    // };

    const updatedAddLCDtl = {
      ...lcShipmentDtl,
      fields: lcShipmentDtl.fields.map((field) => {
        if (field.name === "DATE_OF_SHIPMENT") {
          return {
            ...field,

            validationRun: "onChange",
            validate: (value, ...rest) => {
              if (Boolean(value?.value) && !isValid(value?.value)) {
                return "Mustbeavaliddate";
              }

              if (new Date(value?.value) > new Date(LcDate)) {
                return "Date should be greater than or equal to LC Expiry Date";
              }

              if (
                new Date(value?.value) <
                new Date(rest?.[1]?.authState?.workingDate)
              ) {
                return "BackDatenotAllow";
              }
              return "";
            },
          };
        }

        if (requiredData === "N") {
          return {
            ...field,
            required: false,
            schemaValidation: {},
            // validate: () => { },
          };
        }

        return field;
      }),
    };

    return (
      <>
        <FormWrapper
          key={"FBLCBenEntry" + Modes}
          metaData={extractMetaData(updatedAddLCDtl, Modes) as MetaDataType}
          displayMode={Modes}
          onSubmitHandler={onAPPSubmitHandler}
          formState={{
            sharing: sharing,
            MessageBox: MessageBox,
            authState: authState,
            handleButtonDisable: handleButtonDisable,
            customer_id: rows?.CUSTOMER_ID,
          }}
          formStyle={{
            background: "white",
            padding: "0 10px 0px 10px",
            border: "1px solid var(--theme-color4)",
            borderRadius: "10px",
            boxShadow:
              "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
          }}
          initialValues={initialVal as InitialValuesType}
          ref={ref}
          hideHeader={true}
        >
          {({ isSubmitting, handleSubmit }) => (
            <>
              {flag !== "viewMode" && flag !== "addMode" && (
                <>
                  {Modes === "edit" ? (
                    <>
                      <GradientButton
                        onClick={() => {
                          setModes("view");
                        }}
                        color={"primary"}
                      >
                        View
                      </GradientButton>
                    </>
                  ) : (
                    <>
                      <GradientButton
                        onClick={() => {
                          setModes("edit");
                        }}
                      >
                        Edit
                      </GradientButton>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </FormWrapper>
      </>
    );
  }
);
export default LcShipmentDtl;
