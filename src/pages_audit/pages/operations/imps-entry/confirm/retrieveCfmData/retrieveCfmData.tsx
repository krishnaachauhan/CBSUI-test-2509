import { useRef, useCallback, useContext, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { Dialog } from "@mui/material";
import { AuthContext } from "pages_audit/auth";
import { useTranslation } from "react-i18next";
import { RetrieveGridMetaData } from "./retrieveCfmGridMetadata";
import { retrieveFormMetaData } from "./retrieveFormMetadata";
import { format } from "date-fns";
import { getimpsCfmRetrieveData } from "../../api";
import {
  ActionTypes,
  Alert,
  ClearCacheProvider,
  FormWrapper,
  GradientButton,
  GridWrapper,
  MetaDataType,
} from "@acuteinfo/common-base";
const actions: ActionTypes[] = [
  {
    actionName: "view-details",
    actionLabel: "ViewDetails",
    multiple: true,
    rowDoubleClick: true,
  },
  // {
  //   actionName: "view-details",
  //   actionLabel: "ViewDetails",
  //   multiple: true,
  //   rowDoubleClick: false,
  // },
];
export const RetrieveCfmDataCustom = ({
  onClose,
  navigate,
  setResetForm,
  setRetrieveData,
  setFilteredData,
}) => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const { t } = useTranslation();
  const [retrieve, setRetrieve] = useState<any>();
  const [filterRetData, setFilterRetData] = useState<any>();
  const [flag, setFlag] = useState<any>("");

  const setCurrentAction = useCallback((data: any) => {
    let newData = data?.rows?.map((item) => item?.data);
    navigate(".");
    setRetrieveData(newData);
    setFilteredData(newData);
    setResetForm(Date.now());
  }, []);

  // Api calling fro retrieve data
  const mutation: any = useMutation(
    "getimpsCfmRetrieveData",
    getimpsCfmRetrieveData,
    {
      onSuccess: (data) => {
        if (Array.isArray(data) && data.length) {
          let updateData = data.filter(
            (item) => item.CONFIRMED !== "Y" && item.CONFIRMED !== "R"
          );
          setFlag("filter");
          setRetrieve(data);
          setFilterRetData(updateData);
        }
      },
    }
  );

  useEffect(() => {
    mutation.mutate({
      FROM_DT: authState?.workingDate,
      TO_DT: authState?.workingDate,
      COMP_CD: authState.companyID,
      BRANCH_CD: authState.user.branchCode,
    });
  }, []);

  // for shortcut-key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        formRef?.current?.handleSubmit({ preventDefault: () => {} }, "Save");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <>
        <Dialog
          open={true}
          fullWidth={true}
          PaperProps={{
            style: {
              maxWidth: "1290px",
            },
          }}
        >
          <FormWrapper
            key={`impscfm-retrieveForm`}
            metaData={retrieveFormMetaData as MetaDataType}
            initialValues={{}}
            onSubmitHandler={(data: any, displayData, endSubmit) => {
              endSubmit(true);
              mutation.mutate({
                FROM_DT: format(new Date(data?.FROM_DT), "dd/MMM/yyyy"),
                TO_DT: format(new Date(data?.TO_DT), "dd/MMM/yyyy"),
                COMP_CD: authState.companyID,
                BRANCH_CD: authState.user.branchCode,
              });
            }}
            formStyle={{
              background: "white",
            }}
            onFormButtonClickHandel={(id) => {
              if (id === "RETRIEVE") {
                let event: any = { preventDefault: () => {} };
                formRef?.current?.handleSubmit(event, "RETRIEVE");
              } else if (id === "VIEW_ALL") {
                setFlag("all");
              }
            }}
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
          <GridWrapper
            key={"atm-cfm-RetrieveGridData" + flag}
            finalMetaData={RetrieveGridMetaData}
            data={
              flag === "filter"
                ? filterRetData ?? []
                : flag === "all"
                ? retrieve ?? []
                : []
            }
            setData={() => null}
            loading={mutation.isLoading || mutation.isFetching}
            actions={actions}
            setAction={setCurrentAction}
          />
        </Dialog>
      </>
    </>
  );
};

export const RetrieveCfmData = ({
  onClose,
  navigate,
  setRetrieveData,
  setFilteredData,
  setResetForm,
}) => {
  return (
    <ClearCacheProvider>
      <RetrieveCfmDataCustom
        onClose={onClose}
        navigate={navigate}
        setResetForm={setResetForm}
        setRetrieveData={setRetrieveData}
        setFilteredData={setFilteredData}
      />
    </ClearCacheProvider>
  );
};
