import { lcBenficiary } from "./metaData/metaDataForm";
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

function removeTrailingZeroes(number) {
  let str = number.toString();
  if (str.endsWith(".00")) {
    return str.slice(0, -3);
  }
  return str;
}

const Benficiary = forwardRef<any, any>(
  (
    {
      defaultView,
      sharing,
      flag,
      handleButtonDisable,
      formMetaData,
      initialVal,
      stepperRawData,
    },
    ref
  ) => {
    const { authState } = useContext(AuthContext);
    const { MessageBox } = usePopupContext();
    const { state: rows } = useLocation();
    const [Modes, setModes] = useState(defaultView);
    const myRef = useRef<any>(null);
    const { userState, setActiveStep, dispatchCommon, setFlag, tabRefs } =
      useContext(SecurityContext);
    const [stepData, setStepData] = useState(initialVal);
    const requiredData = stepperRawData?.[1]?.MANDATORY;

    const onAPPSubmitHandler: SubmitFnType = async (
      data: any,
      displayData,
      endSubmit,
      setFieldError,
      actionFlag,
      hasError
    ) => {
      endSubmit(true);
      if (hasError) {
        tabRefs.current = false; // Removed invalid assignment to constant
        return;
      } else {
        if (flag === "addMode") {
          tabRefs.current = true;
        } else if (flag === "editMode") {
          setStepData({ ...stepData, field: data });
          setActiveStep(userState.activeStep + 1);
        }
      }
    };
    // const updatedAddLCDtl = {
    //   ...lcBenficiary,
    //   //...formMetaData,
    // };

    const updatedAddLCDtl = {
      ...lcBenficiary,
      fields: lcBenficiary.fields.map((field) => {
        if (requiredData === "Y") {
          return {
            ...field,
            required: false,
            schemaValidation: {},
            // validate: () => { }
          };
        }
        return field;
      }),
    };
    useEffect(() => {
      if (flag === "addMode") {
        setModes("new");
      }
    }, [Modes, flag]);
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
export default Benficiary;
