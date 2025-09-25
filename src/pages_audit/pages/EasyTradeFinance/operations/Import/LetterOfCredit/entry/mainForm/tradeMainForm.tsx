import { useLocation } from "react-router-dom";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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

const TradeMainForm = forwardRef<any, any>(({ defaultView }, ref) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { state: rows } = useLocation();
  const [Modes, setModes] = useState(defaultView);

  const [masterFormData, setMasterFormData] = useState({ masterField: "" });

  const formMetadata = {
    form: {
      name: "tradeParaMetaData",
      label: "LC Entry",
      resetFieldOnUnmount: false,
      validationRun: "onBlur",
      submitAction: "home",
      render: {
        ordering: "auto",
        renderType: "simple",
        gridConfig: {
          item: {
            xs: 4,
            sm: 4,
            md: 4,
            lg: 6,
            xl: 5,
          },
          container: {
            direction: "row",
            spacing: 0.5,
          },
        },
      },
      componentProps: {
        textField: {
          fullWidth: true,
        },
        select: {
          fullWidth: true,
        },
        datePicker: {
          fullWidth: true,
        },
        numberFormat: {
          fullWidth: true,
        },
        inputMask: {
          fullWidth: true,
        },
        datetimePicker: {
          fullWidth: true,
        },
        formbutton: {
          fullWidth: true,
        },
      },
    },
    fields: [
      {
        render: {
          componentType: "autocomplete",
        },
        name: "function_id",
        label: "Function",
        placeholder: "Select Function",
        type: "text",
        GridProps: {
          xs: 6,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
        isReadOnly: true,
        options: [
          { label: "ISSUE AT SIGHT", value: "LCS" },
          { label: "ISSUE AT USANCE", value: "LCU" },
          { label: "VIEW", value: "VIEW" },
        ],
      },
      {
        render: {
          componentType: "textField",
        },
        name: "CUSTOMER_ID",
        label: "Custoemr ID",
        type: "text",
        GridProps: {
          xs: 6,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
        isReadOnly: true,
      },
      {
        render: {
          componentType: "textField",
        },
        name: "REMITTANCE_CCY",
        label: "CCY",
        type: "text",
        GridProps: {
          xs: 6,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 2,
        },
        isReadOnly: true,
      },
      {
        render: {
          componentType: "spacer",
        },
        name: "SPACER",
        label: "Spacer",
        type: "text",
        GridProps: {
          xs: 6,
          sm: 6,
          md: 6,
          lg: 6,
          xl: 6,
        },
        isReadOnly: true,
      },
      {
        render: {
          componentType: "textField",
        },
        name: "BRANCH_CODE",
        label: "Branch Code",
        type: "text",
        GridProps: {
          xs: 3,
          sm: 2,
          md: 2,
          lg: 1,
          xl: 1,
        },
        isReadOnly: true,
      },
      {
        render: {
          componentType: "textField",
        },
        name: "ACCOUNT_TYPE",
        label: "Account Type",
        type: "text",
        GridProps: {
          xs: 3,
          sm: 2,
          md: 2,
          lg: 1,
          xl: 1,
        },
        isReadOnly: true,
      },
      {
        render: {
          componentType: "textField",
        },
        name: "ACCOUNT_CODE",
        label: "Account Code",
        type: "text",
        GridProps: {
          xs: 3,
          sm: 2,
          md: 2,
          lg: 1,
          xl: 1,
        },
        isReadOnly: true,
      },
      {
        render: {
          componentType: "textField",
        },
        name: "ACCOUNT_NAME",
        label: "Name",
        type: "text",
        GridProps: {
          xs: 3,
          sm: 2,
          lg: 1,
          xl: 1,
        },
        isReadOnly: true,
      },
      {
        render: {
          componentType: "datePicker",
        },
        name: "WORKING_DATE",
        label: "Working Date",
        type: "text",
        GridProps: {
          xs: 3,
          sm: 2,
          md: 2,
          lg: 1,
          xl: 1,
        },
        isReadOnly: true,
      },
    ],
  };

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    endSubmit(true);
    setMasterFormData({ ...masterFormData, masterField: data });
  };
  return (
    <>
      <FormWrapper
        key={"Trade Main Form"}
        metaData={formMetadata as MetaDataType}
        displayMode={Modes}
        onSubmitHandler={onSubmitHandler}
        formState={{
          MessageBox: MessageBox,
          authState: authState?.role,
        }}
        initialValues={
          {
            function_id: rows?.function_id,
            CUSTOMER_ID: rows?.CUSTOMER_ID,
            REMITTANCE_CCY: rows?.CURR_CD,
            BRANCH_CODE: rows?.BRANCH_CD,
            ACCOUNT_TYPE: rows?.ACCT_TYPE,
            ACCOUNT_CODE: rows?.ACCT_CD,
            ACCOUNT_NAME: rows?.ACCT_NAME,
            WORKING_DATE: authState?.workingDate,
          } as InitialValuesType
        }
        formStyle={{
          background: "white",
          padding: "10px 10px 10px 10px",
          border: "1px solid var(--theme-color4)",
          borderRadius: "5px",
          boxShadow:
            "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)",
        }}
        ref={ref}
      ></FormWrapper>
    </>
  );
});
export default TradeMainForm;
