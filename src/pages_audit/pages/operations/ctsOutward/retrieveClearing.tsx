import {
  FC,
  useRef,
  useCallback,
  useContext,
  Fragment,
  useEffect,
  useState,
} from "react";
import { useMutation } from "react-query";
import * as API from "./api";
import {
  CtsOwRetrieveFormConfigMetaData,
  RetrieveFormConfigMetaData,
  RetrieveGridMetaData,
} from "./metaData";
import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { format } from "date-fns";

import { t } from "i18next";
import { useTranslation } from "react-i18next";
import {
  ActionTypes,
  Alert,
  GradientButton,
  GridWrapper,
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
export const RetrieveClearing: FC<{
  onClose?: any;
  zoneTranType?: any;
  data?: any;
}> = ({ onClose, zoneTranType, data }) => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const { t } = useTranslation();
  const [zoneValue, setZoneValue] = useState<any>();

  const setCurrentAction = useCallback((data) => {
    onClose("action", data?.rows);
  }, []);

  const mutation: any = useMutation(
    "getRetrievalClearingData",
    API.getRetrievalClearingData,
    {
      onSuccess: (data) => {},
      onError: (error: any) => {},
    }
  );

  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag
  ) => {
    delete data["RETRIEVE"];
    if (actionFlag === "RETRIEVE") {
      data["COMP_CD"] = authState.companyID;
      data["BRANCH_CD"] = authState.user.branchCode;
      if (Boolean(data["FROM_TRAN_DT"])) {
        data["FROM_TRAN_DT"] = format(
          new Date(data["FROM_TRAN_DT"]),
          "dd/MMM/yyyy"
        );
      }
      if (Boolean(data["TO_TRAN_DT"])) {
        data["TO_TRAN_DT"] = format(
          new Date(data["TO_TRAN_DT"]),
          "dd/MMM/yyyy"
        );
      }
      data["BANK_CD"] = data["BANK_CD"].padEnd(10, " ");
      data = {
        ...data,
        TRAN_TYPE: zoneTranType,
        CONFIRMED: "0",
        BATCH_ID: zoneTranType === "S" ? data?.BATCH_ID ?? "" : "",
      };
      mutation.mutate(data);
      endSubmit(true);
    }
  };
  useEffect(() => {
    if (Boolean(zoneValue)) {
      mutation.mutate({
        FROM_TRAN_DT: format(
          new Date(data?.[0]?.TRAN_DATE ?? ""),
          "dd/MMM/yyyy"
        ),
        TO_TRAN_DT: format(new Date(data?.[0]?.TRAN_DATE ?? ""), "dd/MMM/yyyy"),
        BATCH_ID: zoneTranType === "S" ? data?.BATCH_ID ?? "" : "",
        COMP_CD: authState.companyID,
        BRANCH_CD: authState.user.branchCode,
        TRAN_TYPE: zoneTranType,
        CONFIRMED: "0",
        BANK_CD: "",
        ZONE: zoneValue,
        SLIP_CD: "",
        CHEQUE_NO: "",
        CHEQUE_AMOUNT: "",
      });
    }
  }, [zoneValue]);

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
            metaData={
              (zoneTranType === "S"
                ? CtsOwRetrieveFormConfigMetaData
                : RetrieveFormConfigMetaData) as unknown as MetaDataType
            }
            initialValues={{
              FROM_TRAN_DT: data?.[0]?.TRAN_DATE,
              TO_TRAN_DT: data?.[0]?.TRAN_DATE,
              ZONE_TRAN_TYPE: zoneTranType,
              DISABLE_TRAN_DATE: data?.[0]?.DISABLE_TRAN_DATE,
              BATCH_ID: data?.[0]?.BATCH_ID,
              DISABLE_BATCH_ID: data?.[0]?.DISABLE_BATCH_ID,
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
            setDataOnFieldChange={(action, payload) => {
              if (action === "ZONE_VALUE") {
                setZoneValue(payload);
              }
            }}
            formState={{ ZONE_TRAN_TYPE: zoneTranType }}
            ref={formRef}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={() => {
                    onClose();
                  }}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
          <Fragment>
            {mutation.isError && (
              <Alert
                severity="error"
                errorMsg={
                  mutation.error?.error_msg ?? "Something went to wrong.."
                }
                errorDetail={mutation.error?.error_detail}
                color="error"
              />
            )}
            {/* {mutation?.data ? ( */}
            <GridWrapper
              key={"RetrieveGridMetaData"}
              finalMetaData={RetrieveGridMetaData}
              data={mutation?.data ?? []}
              setData={() => null}
              loading={mutation.isLoading || mutation.isFetching}
              actions={actions}
              setAction={setCurrentAction}
            />
            {/* ) : null} */}
          </Fragment>
        </Dialog>
      </>
    </>
  );
};

export const RetrieveClearingForm = ({
  zoneTranType,
  onClose,
  bussinesDateData,
}) => {
  return (
    <ClearCacheProvider>
      <RetrieveClearing
        zoneTranType={zoneTranType}
        onClose={onClose}
        data={bussinesDateData}
      />
    </ClearCacheProvider>
  );
};
