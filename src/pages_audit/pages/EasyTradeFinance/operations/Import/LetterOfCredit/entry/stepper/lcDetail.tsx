import { LcDetails } from "./metaData/metaDataForm";
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

const OnBoard = forwardRef<any, any>(
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

    const requiredData = stepperRawData?.[0]?.MANDATORY;

    const { userState, setActiveStep, dispatchCommon, setFlag, tabRefs } =
      useContext(SecurityContext);

    const onAPPSubmitHandler = (
      data: any,
      displayData,
      endSubmit,
      setFieldError,
      actionFlag,
      hasError
    ) => {
      endSubmit(true);
      if (hasError) {
        tabRefs.current = false;
        return;
      } else {
        if (flag === "addMode") {
          tabRefs.current = true;
        } else if (flag === "editMode") {
          dispatchCommon("commonType", {
            oldformData: data,
          });

          const finalData = {
            ...data,
            ALLOW_RELEASE: data?.ALLOW_RELEASE ? "Y" : "N",
            SIGN_VIEW: data?.SIGN_VIEW ? "Y" : "N",
            ALLOW_DOC_SIGN: data?.ALLOW_DOC_SIGN ? "Y" : "N",
            ACTIVE_FLAG: data?.ACTIVE_FLAG ? "Y" : "N",
            MULTI_APP_ACCESS: data?.MULTI_APP_ACCESS ? "Y" : "N",
          };
          let newData = {
            ...finalData,
          };
          let oldData = {
            ...rows?.[0]?.data,
          };
          let upd = utilFunction.transformDetailsData(newData, oldData);

          myRef.current = {
            data: {
              ...newData,
              ...upd,
              _isNewRow: false,
            },

            displayData,
            setFieldError,
          };
          const oldRowData = myRef.current?.data?._OLDROWVALUE;
          const updatedColumnsWithValues = {};
          if (myRef.current?.data?._UPDATEDCOLUMNS) {
            myRef.current.data._UPDATEDCOLUMNS.forEach((column) => {
              updatedColumnsWithValues[column] = newData[column];
            });
          }
          const FinalData = () => {
            return {
              USER_NAME: rows?.[0]?.data?.USER_NAME,
              AD_USER_NM: rows?.[0]?.data?.ADUSER_NAME,
              AD_PARA: rows?.[0]?.data?.AD_FLAG,
              ...updatedColumnsWithValues,
              _OLDROWVALUE: oldRowData,
              _UPDATEDCOLUMNS: myRef.current?.data?._UPDATEDCOLUMNS,
            };
          };

          // console.log("<<<finalData", FinalData)

          dispatchCommon("commonType", {
            formData: FinalData(),
          });
        }
        // setActiveStep(userState.activeStep + 1);
      }
    };

    // const updatedAddLCDtl = {
    //   ...LcDetails,
    //   // ...formMetaData,
    // };
    const updatedAddLCDtl = {
      ...LcDetails,
      fields: LcDetails.fields.map((field) => {
        if (requiredData === "N") {
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
          key={"FBLCEntry" + Modes}
          // metaData={getDynamicMetaData}
          metaData={extractMetaData(updatedAddLCDtl, Modes) as MetaDataType}
          displayMode={Modes}
          onSubmitHandler={onAPPSubmitHandler}
          formState={{
            sharing: sharing,
            MessageBox: MessageBox,
            authState: authState,
            handleButtonDisable: handleButtonDisable,
            Calculation: Calculation,
            function_id: rows?.function_id,
            currency: rows?.currency,
            customer_id: rows?.CUSTOMER_ID,
          }}
          initialValues={initialVal as InitialValuesType}
          formStyle={{
            background: "white",
            padding: "0 10px 0px 10px",
            border: "1px solid var(--theme-color4)",
            borderRadius: "10px",
            boxShadow:
              "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
          }}
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
export default OnBoard;
export const Calculation = (CurrentField, dependentFields) => {
  function getFieldValue(fieldName, fallbackValue) {
    return Object.keys(dependentFields).includes(fieldName)
      ? dependentFields?.[fieldName]?.value ?? fallbackValue
      : CurrentField?.value ?? fallbackValue;
  }
  let le_actual_lc_amount = 0,
    le_rate = 0,
    ls_tol_type = "",
    le_tole_per = 0,
    le_limit_amount = 0,
    le_margin_per = 0,
    le_lc_amount = 0,
    le_lc_home_amt = 0,
    lc_margin_amt = 0,
    le_limit_block = 0,
    le_cash_margin_amt = 0;

  le_actual_lc_amount = getFieldValue("actual_lc_amount", 0);
  le_rate = getFieldValue("notional_curr_rate", 0);
  ls_tol_type = getFieldValue("tolerance_type", "");
  le_tole_per = getFieldValue("tolerance_percent", 0);
  le_limit_amount = getFieldValue("LIMIT_AMT", 0);
  le_margin_per = getFieldValue("MARGIN_PER", 0);

  if (ls_tol_type === "P" || ls_tol_type === "B") {
    le_lc_amount =
      Number(le_actual_lc_amount) +
      Math.round(Number(le_actual_lc_amount * (le_tole_per / 100)));
  } else {
    le_lc_amount = le_actual_lc_amount;
  }

  le_lc_home_amt = Math.round(le_lc_amount * le_rate);

  if (le_limit_amount >= le_lc_home_amt) {
    lc_margin_amt = Math.round(Number(le_lc_home_amt * le_margin_per) / 100);
    le_limit_block = le_lc_home_amt;
  } else if (le_limit_amount === 0) {
    le_cash_margin_amt = le_lc_home_amt;
    le_limit_block = 0;
  } else {
    lc_margin_amt = Math.round(Number(le_limit_amount * le_margin_per) / 100);
    le_cash_margin_amt = Math.round(Number(le_lc_home_amt - le_limit_amount));
    le_limit_block = le_limit_amount;
  }

  return {
    MARGIN_AMT: { value: lc_margin_amt.toString() },
    // MARGIN_AMT: { value: le_margin_per === 0 ? "" : lc_margin_amt.toString() },
    CASH_MARGIN: { value: le_cash_margin_amt.toString() },
    LC_INR_AMT: { value: le_lc_home_amt.toString() },
    LIMIT_USE_AMT: { value: le_limit_block.toString() },
    LC_AMOUNT: { value: le_lc_amount.toString() },
    TOTAL_MARGIN_AMT: {
      value: ((lc_margin_amt ?? 0) + (le_cash_margin_amt ?? 0)).toString(),
    },
  };
};
