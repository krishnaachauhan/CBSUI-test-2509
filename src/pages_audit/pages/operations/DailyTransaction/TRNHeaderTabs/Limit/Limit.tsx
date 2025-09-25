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
import { getdocCD } from "components/utilFunction/function";
import { t } from "i18next";
import { cloneDeep } from "lodash";
import { AuthContext } from "pages_audit/auth";
import { limitEntryMetaData } from "pages_audit/pages/operations/limit-entry/limitEntryMetadata";
import { limitEntryGridMetaData } from "pages_audit/pages/operations/limit-entry/limtEntryGridMetadata";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import * as API from "./api";

const actions: ActionTypes[] = [
  {
    actionName: "ViewDetails",
    actionLabel: "ViewDetails",
    multiple: false,
    rowDoubleClick: true,
  },
];

export const Limit = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const [limitDtlOpen, setLimitDtlOpen] = useState(false);
  const [renderFlag, setRenderFlag] = useState(false);
  const { CloseMessageBox } = usePopupContext();
  const [dynamicMetadata, setDynamicMetadata] = useState<any>([]);
  const dynamicMetadataRef = useRef<any>([]);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [limitDetails, setLimitDetails] = useState<any>({});

  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );

  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getLimitList", { reqData }],
    () =>
      API.getLimitList({
        ...reqData,
        GD_TODAY_DT: authState?.workingDate ?? "",
        USER_LEVEL: authState?.role ?? "",
      }),
    {
      enabled: hasRequiredFields,
    }
  );
  const LimitDetailsMetadata = useMutation(API.LimitSecurityData, {
    onError: async (error: any) => {
      CloseMessageBox();
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        dynamicMetadataRef.current = data;
      }
      CloseMessageBox();
    },
  });

  useEffect(() => {
    const fetchAndTransformData = async () => {
      if (Array.isArray(dynamicMetadataRef.current)) {
        const transformedData = await Promise.all(
          dynamicMetadataRef.current.map(async (val) => ({
            render: {
              componentType:
                val?.FIELD_NAME === "FORCE_EXP_DT"
                  ? "datePicker"
                  : val?.COMPONENT_TYPE,
            },
            name: val?.FIELD_NAME,
            label: val?.FIELD_LABEL,
            sequence: val?.TAB_SEQ,
            defaultValue: val?.DEFAULT_VALUE,
            placeholder: val?.PLACE_HOLDER,
            required: val?.FIELD_REQUIRED === "Y",
            isReadOnly: val?.IS_READ_ONLY === "Y",
            GridProps: {
              xs: val?.XS,
              md: val?.MD,
              sm: val?.SM,
              lg: val?.LG,
              xl: val?.XL,
            },
          }))
        );
        setDynamicMetadata(transformedData);
      }
    };

    if (dynamicMetadataRef?.current?.length > 0) {
      fetchAndTransformData();
      setRenderFlag(true);
    }
  }, [dynamicMetadataRef?.current?.length]);

  const memoizedDetailMetadata = useMemo(() => {
    const metadata = cloneDeep(limitEntryMetaData);
    if (Boolean(limitDetails)) {
      if (metadata?.fields) {
        metadata.fields = [...metadata.fields, ...dynamicMetadata];
      }

      if (metadata?.form) {
        metadata.form.label = `${t("LimitDetails")} || ${
          limitDetails?.LIMIT_STATUS
        }`;
      }

      return metadata;
    }
  }, [Boolean(renderFlag), limitDetails, dynamicMetadataRef?.current]);

  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };

  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(limitEntryGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.containerHeight = {
        min: "23.7vh",
        max: "23.7vh",
      };
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "Limits";
      metadata.gridConfig.footerNote = "";
      metadata.gridConfig.isCusrsorFocused = true;
    }

    if (metadata?.columns) {
      metadata.columns = metadata?.columns?.map((column) => {
        if (
          column?.componentType === "buttonRowCell" ||
          column?.accessor === "CONFIRMED_DISPLAY"
        ) {
          return {
            ...column,
            isVisible: false,
          };
        }
        if (column?.accessor === "SECURITY_VALUE") {
          return {
            accessor: "SECURITY_VALUE",
            columnName: "SecurityValue",
            sequence: 4,
            alignment: "right",
            componentType: "currency",
            currencyRefColumn: "CURRENCY_CD",
            width: 170,
            minWidth: 120,
            maxWidth: 200,
            isTotalWithCurrency: true,
            totalDecimalCount: 2,
          };
        }
        if (column?.accessor === "FD_DESC") {
          return {
            ...column,
            showTooltip: true,
          };
        }
        return column;
      });
    }
    return metadata;
  }, [data]);
  const setCurrentAction = useCallback((data) => {
    if (data.name === "ViewDetails") {
      setLimitDetails(data?.rows?.[0]?.data);
      LimitDetailsMetadata.mutate({
        COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
        SECURITY_CD: data?.rows?.[0]?.data?.SECURITY_CD ?? "",
        BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
      });

      setLimitDtlOpen(true);
    }
  }, []);
  const handleClose = () => {
    setLimitDtlOpen(false);
    dynamicMetadataRef.current = [];
    setDynamicMetadata([]);
    setRenderFlag(false);
    setLimitDetails({});
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getLimitList", authState?.user?.branchCode]);
    };
  }, []);
  return (
    <>
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      <GridWrapper
        key={`LimitGridMetaData` + renderFlag}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={handleRefetch}
        enableExport={true}
      />

      {limitDtlOpen ? (
        <Dialog
          open={true}
          fullWidth={true}
          onKeyUp={(event) => {
            if (event.key === "Escape") handleClose();
          }}
          PaperProps={{
            style: {
              width: "100%",
              overflow: "auto",
            },
          }}
          maxWidth="lg"
        >
          {LimitDetailsMetadata?.isLoading ? (
            <LoaderPaperComponent />
          ) : (
            <>
              {LimitDetailsMetadata?.isError ? (
                <Alert
                  severity={LimitDetailsMetadata?.error?.severity ?? "error"}
                  errorMsg={LimitDetailsMetadata?.error?.error_msg ?? "Error"}
                  errorDetail={LimitDetailsMetadata?.error?.error_detail ?? ""}
                />
              ) : null}
              <FormWrapper
                key={"LimitTabDetails"}
                metaData={memoizedDetailMetadata as MetaDataType}
                initialValues={limitDetails ?? {}}
                onSubmitHandler={() => {}}
                displayMode={"view"}
                hideDisplayModeInTitle={true}
                formState={{
                  docCD: docCD,
                }}
                formStyle={{
                  background: "white",
                }}
              >
                {({ isSubmitting, handleSubmit }) => {
                  return (
                    <>
                      <GradientButton
                        color="primary"
                        onClick={() => handleClose()}
                      >
                        {t("Close")}
                      </GradientButton>
                    </>
                  );
                }}
              </FormWrapper>
            </>
          )}
        </Dialog>
      ) : null}
    </>
  );
};
