import {
  ActionTypes,
  Alert,
  FormWrapper,
  GradientButton,
  GridMetaDataType,
  GridWrapper,
  LoaderPaperComponent,
  MetaDataType,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { t } from "i18next";
import { AuthContext } from "pages_audit/auth";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQuery } from "react-query";
import * as API from "./api";
import { ach_OW_dtlmetaData, ACH_OWGridMetaData } from "./gridMetadata";
import { cloneDeep } from "lodash";
export const ACH_OW = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const { MessageBox, CloseMessageBox } = usePopupContext();
  const [isachOWDtlOpen, setAchOWDtlOpen] = useState(false);
  const [achOWDtl, setAchOWDtl] = useState<any>({});
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const actions: ActionTypes[] = [
    {
      actionName: "view-details",
      actionLabel: "ViewDetails",
      multiple: false,
      rowDoubleClick: true,
    },
  ];

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(["getACH_OWList", { reqData }], () => API.getACH_OWList(reqData), {
    enabled: hasRequiredFields,
  });
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };
  const getACH_OWDtl = useMutation("getACH_OWDtl", API.getACH_OWDetail, {
    onError: async (error: any) => {
      await MessageBox({
        messageTitle: "ValidationFailed",
        message: error?.error_msg ?? "",
        icon: "ERROR",
      });
      setAchOWDtlOpen(false);
      CloseMessageBox();
    },
    onSuccess: (data) => {
      setAchOWDtl(data?.[0]);
    },
  });
  const setCurrentAction = useCallback(async (data) => {
    if (data?.name === "view-details") {
      setAchOWDtlOpen(true);
      ach_OW_dtlmetaData.form.label = `${t(`achDetails`, {
        sr: data?.rows?.[0]?.data?.sr,
      })}`;
      getACH_OWDtl.mutate({
        ENT_COMP_CD: data?.rows?.[0]?.data?.ENTERED_COMP_CD ?? "",
        ENT_BRANCH_CD: data?.rows?.[0]?.data?.ENTERED_BRANCH_CD ?? "",
        COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
        BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
        ACCT_TYPE: data?.rows?.[0]?.data?.ACCT_TYPE ?? "",
        ACCT_CD: data?.rows?.[0]?.data?.ACCT_CD ?? "",
        TRAN_CD: data?.rows?.[0]?.data?.TRAN_CD ?? "",
      });
    }
  }, []);
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(ACH_OWGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.containerHeight = { min: "23.7vh", max: "23.7vh" };
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "ACHOW";
    }
    return metadata;
  }, [data]);
  const memoizedFormMetadata = useMemo(() => {
    const metadata = cloneDeep(ach_OW_dtlmetaData);
    if (metadata?.form) {
      metadata.form.label = `${t(`ACHIWHeader`, {
        FULL_ACCOUNT_NO: `${achOWDtl?.COMP_CD?.trim() ?? ""}${
          achOWDtl?.BRANCH_CD?.trim() ?? ""
        }${achOWDtl?.ACCT_TYPE?.trim() ?? ""}${
          achOWDtl?.ACCT_CD?.trim() ?? ""
        }`,
        UMRN_NO: achOWDtl?.UMRN?.trim() ?? "",
      })}`;
    }
    return metadata;
  }, [achOWDtl]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getACH_OWList", authState?.user?.branchCode]);
      queryClient.removeQueries(["getACH_OWDtl", authState?.user?.branchCode]);
    };
  }, []);
  return (
    <Fragment>
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key={`ACH_OWGridMetaData` + data?.length}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        refetchData={handleRefetch}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        enableExport={true}
        onClickActionEvent={(index, id, currentData) => {
          if (id === "VIEW_DTL") {
            setAchOWDtlOpen(true);
            getACH_OWDtl.mutate({
              ENT_COMP_CD: currentData?.ENTERED_COMP_CD ?? "",
              ENT_BRANCH_CD: currentData?.ENTERED_BRANCH_CD ?? "",
              COMP_CD: currentData?.COMP_CD ?? "",
              BRANCH_CD: currentData?.BRANCH_CD ?? "",
              ACCT_TYPE: currentData?.ACCT_TYPE ?? "",
              ACCT_CD: currentData?.ACCT_CD ?? "",
              TRAN_CD: currentData?.TRAN_CD ?? "",
            });
          }
        }}
      />

      {isachOWDtlOpen ? (
        <Dialog
          open={isachOWDtlOpen}
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setAchOWDtlOpen(false);
            }
          }}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          {getACH_OWDtl?.isLoading ? (
            <LoaderPaperComponent />
          ) : (
            <FormWrapper
              key={"ACH/OW_DtlFormData"}
              metaData={memoizedFormMetadata as MetaDataType}
              displayMode={"view"}
              onSubmitHandler={() => {}}
              initialValues={achOWDtl ?? {}}
              formStyle={{
                background: "white",
                margin: "10px 0",
              }}
              formState={{
                rowDetails: achOWDtl,
              }}
            >
              {({ isSubmitting, handleSubmit }) => (
                <>
                  <GradientButton
                    onClick={() => setAchOWDtlOpen(false)}
                    color={"primary"}
                  >
                    {t("Close")}
                  </GradientButton>
                </>
              )}
            </FormWrapper>
          )}
        </Dialog>
      ) : null}
    </Fragment>
  );
};
