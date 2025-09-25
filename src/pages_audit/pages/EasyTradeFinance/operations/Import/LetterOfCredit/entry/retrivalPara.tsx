import {
  FC,
  useRef,
  // useCallback,
  useContext,
} from "react";
import { Dialog } from "@mui/material";
import { AuthContext } from "../../../../../../auth";
import { format, isValid } from "date-fns";
import { t } from "i18next";
import {
  ActionTypes,
  GradientButton,
  SubmitFnType,
  FormWrapper,
  MetaDataType,
  ClearCacheProvider,
} from "@acuteinfo/common-base";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: t("ViewDetails"),
    multiple: false,
    rowDoubleClick: true,
  },
];

export const RetrieveFormConfigMetaData = {
  form: {
    name: "RetrieveFormConfigMetaData",
    label: "Retrival Para",
    resetFieldOnUnmount: false,
    validationRun: "onBlur",
    submitAction: "home",
    render: {
      ordering: "auto",
      renderType: "simple",
      gridConfig: {
        item: {
          xs: 12,
          sm: 12,
          md: 12,
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
    },
  },
  fields: [
    {
      render: {
        componentType: "radio",
      },
      name: "PARA_TYPE",
      label: "",
      RadioGroupProps: { row: true },
      defaultValue: "D",
      options: [
        {
          label: "Date",
          value: "D",
        },
        { label: "AD Bill No.", value: "N" },
      ],
      runPostValidationHookAlways: true,
      GridProps: {
        xs: 12,
        md: 11,
        sm: 11,
        lg: 11,
        xl: 11,
      },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_TRAN_DATE",
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "FROM_TRAN_DT",
      label: "GeneralFromDate",
      placeholder: "",
      fullWidth: true,
      format: "dd/MM/yyyy",
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["FromDateRequired"] }],
      },
      validate: (value) => {
        if (Boolean(value?.value) && !isValid(value?.value)) {
          return "Mustbeavaliddate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      dependentFields: ["DISABLE_TRAN_DATE", "PARA_TYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PARA_TYPE?.value === "D") {
          return false;
        } else {
          return true;
        }
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_TRAN_DATE?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      render: {
        componentType: "datePicker",
      },
      name: "TO_TRAN_DT",
      label: "GeneralToDate",
      placeholder: "",
      fullWidth: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      format: "dd/MM/yyyy",
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["To Date is required."] }],
      },
      validate: (currentField, dependentField) => {
        if (Boolean(currentField?.value) && !isValid(currentField?.value)) {
          return "Mustbeavaliddate";
        }
        if (
          new Date(currentField?.value) <
          new Date(dependentField?.FROM_TRAN_DT?.value)
        ) {
          return "ToDateshouldbegreaterthanorequaltoFromDate";
        }
        return "";
      },
      onFocus: (date) => {
        date.target.select();
      },
      isReadOnly(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.DISABLE_TRAN_DATE?.value === "Y") {
          return true;
        } else {
          return false;
        }
      },
      dependentFields: ["FROM_TRAN_DT", "DISABLE_TRAN_DATE", "PARA_TYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PARA_TYPE?.value === "D") {
          return false;
        } else {
          return true;
        }
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "textField",
      },
      name: "REF_NO",
      label: "BILL No.",
      placeholder: "",
      fullWidth: true,
      GridProps: { xs: 12, sm: 4, md: 4, lg: 4, xl: 4 },
      schemaValidation: {
        type: "string",
        rules: [{ name: "required", params: ["AD Bill No is required."] }],
      },
      dependentFields: ["PARA_TYPE"],
      shouldExclude(fieldData, dependentFieldsValues, formState) {
        if (dependentFieldsValues?.PARA_TYPE?.value === "N") {
          return false;
        } else {
          return true;
        }
      },
      runValidationOnDependentFieldsChange: true,
    },
    {
      render: {
        componentType: "formbutton",
      },
      name: "RETRIEVE",
      label: "Retrieve",
      endsIcon: "YoutubeSearchedFor",
      rotateIcon: "scale(1.5)",
      placeholder: "",
      type: "text",
      GridProps: { xs: 1.2, sm: 1.2, md: 1.2, lg: 2, xl: 3 },
    },
    {
      render: {
        componentType: "hidden",
      },
      name: "DISABLE_BATCH_ID",
    },
  ],
};

export const RetrievePara: FC<{
  getData: any;
  onClose?: any;
  open: boolean;
}> = ({ onClose, getData, open }) => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    delete data["RETRIEVE"];
    if (actionFlag === "RETRIEVE") {
      if (Boolean(data["FROM_TRAN_DT"])) {
        data["A_FROMDATE"] = format(
          new Date(data["FROM_TRAN_DT"]),
          "dd/MMM/yyyy"
        );
      }
      if (Boolean(data["TO_TRAN_DT"])) {
        data["A_TODATE"] = format(new Date(data["TO_TRAN_DT"]), "dd/MMM/yyyy");
      }

      data["A_COMP_CD"] = authState?.companyID;
      data["A_BRANCH_CD"] = authState?.user?.branchCode;
      data["A_PARM"] = "FBLC";
      data["A_FUNCTION_TYPE"] = "LCS";
      data["A_FLAG"] = data["PARA_TYPE"];
      data["A_REF_NO"] = data["REF_NO"] || "";
      getData.mutate(data);
      endSubmit(true);
      onClose();
    }
  };

  return (
    <>
      <>
        <Dialog
          open={open}
          PaperProps={{
            style: {
              overflow: "hidden",
            },
          }}
          maxWidth="xl"
        >
          <FormWrapper
            key={`retrieveForm`}
            metaData={RetrieveFormConfigMetaData as unknown as MetaDataType}
            initialValues={{
              FROM_TRAN_DT: authState.workingDate,
              TO_TRAN_DT: authState.workingDate,
            }}
            onSubmitHandler={onSubmitHandler}
            formStyle={{
              background: "white",
            }}
            onFormButtonClickHandel={() => {
              let event: any = { preventDefault: () => {} };
              // if (mutation?.isLoading) {
              formRef?.current?.handleSubmit(event, "RETRIEVE");
              // }
            }}
            ref={formRef}
          ></FormWrapper>
        </Dialog>
      </>
    </>
  );
};

export const RetrieveForm = ({ getData, onClose, open }) => {
  return (
    <ClearCacheProvider>
      <RetrievePara getData={getData} onClose={onClose} open={open} />
    </ClearCacheProvider>
  );
};
