import {
  FC,
  useRef,
  // useCallback,
  useContext,
} from "react";
import { RetrieveFormConfigMetaData } from "./metaData";
import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";
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
export const RetrieveCardRate: FC<{
  getCardRateData: any;
  onClose?: any;
}> = ({ onClose, getCardRateData }) => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  // const { t } = useTranslation();

  // const setCurrentAction = useCallback((data) => {
  //   onClose("action", data?.rows);
  // }, []);

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
        data["FROM_DT"] = format(new Date(data["FROM_TRAN_DT"]), "dd/MMM/yyyy");
      }
      if (Boolean(data["TO_TRAN_DT"])) {
        data["TO_DT"] = format(new Date(data["TO_TRAN_DT"]), "dd/MMM/yyyy");
      }
      getCardRateData.mutate(data);
      endSubmit(true);
      onClose();
    }
  };

  return (
    <>
      <>
        <Dialog
          open={true}
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
          >
            {/* {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={() => {
                    onClose();
                  }}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )} */}
          </FormWrapper>
        </Dialog>
      </>
    </>
  );
};

export const RetrieveCardRateForm = ({ getCardRateData, onClose }) => {
  return (
    <ClearCacheProvider>
      <RetrieveCardRate getCardRateData={getCardRateData} onClose={onClose} />
    </ClearCacheProvider>
  );
};
