import { UserOnboardform } from "./metaData/metaDataForm";
import { useLocation } from "react-router-dom";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
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

function removeTrailingZeroes(number) {
  let str = number.toString();
  if (str.endsWith(".00")) {
    return str.slice(0, -3);
  }
  return str;
}

const OnBoard = forwardRef<any, any>(
  ({ defaultView, username, sharing, flag, handleButtonDisable }, ref) => {
    const { authState } = useContext(AuthContext);
    let DESCRIPTION = username?.DESCRIPTION;
    const { MessageBox } = usePopupContext();
    const { state: rows } = useLocation();
    const [Modes, setModes] = useState(defaultView);
    const myRef = useRef<any>(null);
    const { userState, setActiveStep, dispatchCommon } =
      useContext(SecurityContext);
    const AdRef = useRef<any>("");
    AdRef.current = sharing?.[0]?.AD_PARA;

    const onAPPSubmitHandler: SubmitFnType = async (
      data: any,
      displayData,
      endSubmit,
      setFieldError,
      actionFlag
    ) => {
      endSubmit(true);
      if (flag === "addMode") {
        const finalData = {
          ...data,
          ALLOW_RELEASE: data?.ALLOW_RELEASE ? "Y" : "N",
          SIGN_VIEW: data?.SIGN_VIEW ? "Y" : "N",
          ALLOW_DOC_SIGN: data?.ALLOW_DOC_SIGN ? "Y" : "N",
          MULTI_APP_ACCESS: data?.MULTI_APP_ACCESS ? "Y" : "N",
          AD_PARA: AdRef?.current,
          AD_USER_NM: data?.ADUSER_NAME ?? "",
        };
        dispatchCommon("commonType", {
          oldformData: finalData,
        });
        dispatchCommon("commonType", {
          formData: finalData,
        });
      } else if (flag === "editMode") {
        dispatchCommon("commonType", {
          oldformData: data,
        });
        data["DR_TRF_LIMIT"] = Boolean(data?.DR_TRF_LIMIT)
          ? removeTrailingZeroes(data?.DR_TRF_LIMIT)
          : data?.DR_TRF_LIMIT;
        data["DR_CLG_LIMIT"] = Boolean(data?.DR_CLG_LIMIT)
          ? removeTrailingZeroes(data?.DR_CLG_LIMIT)
          : data?.DR_CLG_LIMIT;
        data["DR_CASH_LIMIT"] = Boolean(data?.DR_CASH_LIMIT)
          ? removeTrailingZeroes(data?.DR_CASH_LIMIT)
          : data?.DR_CASH_LIMIT;
        data["CR_TRF_LIMIT"] = Boolean(data?.CR_TRF_LIMIT)
          ? removeTrailingZeroes(data?.CR_TRF_LIMIT)
          : data?.CR_TRF_LIMIT;
        data["CR_CLG_LIMIT"] = Boolean(data?.CR_CLG_LIMIT)
          ? removeTrailingZeroes(data?.CR_CLG_LIMIT)
          : data?.CR_CLG_LIMIT;
        data["CR_CASH_LIMIT"] = Boolean(data?.CR_CASH_LIMIT)
          ? removeTrailingZeroes(data?.CR_CASH_LIMIT)
          : data?.CR_CASH_LIMIT;
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
        upd["_OLDROWVALUE"] = {
          DESCRIPTION,
          ...upd["_OLDROWVALUE"],
          DR_TRF_LIMIT: rows?.[0]?.data?.DR_TRF_LIMIT,
          DR_CLG_LIMIT: rows?.[0]?.data?.DR_CLG_LIMIT,
          DR_CASH_LIMIT: rows?.[0]?.data?.DR_CASH_LIMIT,
          CR_TRF_LIMIT: rows?.[0]?.data?.CR_TRF_LIMIT,
          CR_CLG_LIMIT: rows?.[0]?.data?.CR_CLG_LIMIT,
          CR_CASH_LIMIT: rows?.[0]?.data?.CR_CASH_LIMIT,
        };
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
        dispatchCommon("commonType", {
          formData: FinalData(),
        });
      }
      setActiveStep(userState.activeStep + 1);
    };
    const updatedAddSecurityUsers = {
      ...UserOnboardform,
      fields: UserOnboardform.fields.map((field) => {
        if (field.name === "DEF_BRANCH_CD") {
          return {
            ...field,
            defaultValue: authState?.user?.branchCode ?? "",
          };
        }
        if (field.name === "DEF_COMP_CD") {
          return {
            ...field,
            defaultValue: authState?.baseCompanyID ?? "",
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
          key={"SecurityUserAdd" + Modes}
          metaData={
            extractMetaData(updatedAddSecurityUsers, Modes) as MetaDataType
          }
          displayMode={Modes}
          onSubmitHandler={onAPPSubmitHandler}
          formState={{
            sharing: sharing,
            MessageBox: MessageBox,
            authState: authState?.role,
            handleButtonDisable: handleButtonDisable,
          }}
          initialValues={
            Object.keys(userState?.formData).length > 0
              ? {
                  ...(userState?.oldformData as InitialValuesType),
                }
              : { ...(rows?.[0]?.data as InitialValuesType) }
          }
          formStyle={{
            background: "white",
            padding: "0 10px 0px 10px",
            border: "1px solid var(--theme-color4)",
            borderRadius: "10px",
            boxShadow:
              "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
          }}
          ref={ref}
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
