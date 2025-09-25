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
import { StockEntryMetaData } from "pages_audit/pages/operations/stockEntry/stockEntryMetadata";
import { StockGridMetaData } from "pages_audit/pages/operations/stockEntry/stockGridMetadata";
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
export const Stock = ({ reqData }) => {
  const { authState } = useContext(AuthContext);
  const [stockDtlOpen, setStockDtlOpen] = useState(false);
  const [renderFlag, setRenderFlag] = useState(false);
  const { CloseMessageBox } = usePopupContext();
  const [dynamicMetadata, setDynamicMetadata] = useState<any>([]);
  const dynamicMetadataRef = useRef<any>([]);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const [stockDetails, setStockDetails] = useState<any>({});
  const hasRequiredFields = Boolean(
    reqData?.ACCT_CD && reqData?.ACCT_TYPE && reqData?.BRANCH_CD
  );
  const { data, isLoading, isFetching, refetch, error, isError } = useQuery<
    any,
    any
  >(
    ["getStockList", { reqData }],
    () =>
      API.getStockList({
        ...reqData,
        A_USER_LEVEL: authState?.role ?? "",
        A_GD_DATE: authState?.workingDate ?? "",
      }),
    {
      enabled: hasRequiredFields,
    }
  );
  const stockDetailsMetadata = useMutation(API.stockMetaData, {
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
              componentType: val?.COMPONENT_TYPE,
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
    const metadata = cloneDeep(StockEntryMetaData);
    if (Boolean(stockDetails)) {
      if (metadata?.fields) {
        metadata.fields = [...metadata.fields, ...dynamicMetadata];
      }
      if (metadata?.form) {
        metadata.form.label = `${t("stockDetail")} `;
      }
      return metadata;
    }
  }, [Boolean(renderFlag), stockDetails, dynamicMetadataRef?.current]);
  const handleRefetch = () => {
    if (hasRequiredFields) {
      refetch();
    }
  };
  const memoizedMetadata = useMemo(() => {
    const metadata = cloneDeep(StockGridMetaData);
    if (metadata?.gridConfig) {
      metadata.gridConfig.containerHeight = {
        min: "23.7vh",
        max: "23.7vh",
      };
      metadata.gridConfig.footerNote = "";
      metadata.gridConfig.gridLabel = reqData?.TAB_DISPL_NAME ?? "stockDetail";
      metadata.gridConfig.isCusrsorFocused = true;
    }
    if (metadata?.columns) {
      metadata.columns = metadata?.columns?.map((column) => {
        if (
          column?.componentType === "buttonRowCell" ||
          column?.columnName === "Status"
        ) {
          return {
            ...column,
            isVisible: false,
          };
        }
        return column;
      });
    }
    return metadata;
  }, [data]);
  const setCurrentAction = useCallback((data) => {
    if (data.name === "ViewDetails") {
      setStockDetails(data?.rows?.[0]?.data);
      stockDetailsMetadata?.mutate({
        COMP_CD: data?.rows?.[0]?.data?.COMP_CD ?? "",
        SECURITY_CD: data?.rows?.[0]?.data?.SECURITY_CD ?? "",
        BRANCH_CD: data?.rows?.[0]?.data?.BRANCH_CD ?? "",
      });
      setStockDtlOpen(true);
    }
  }, []);
  const handleClose = () => {
    setStockDtlOpen(false);
    dynamicMetadataRef.current = [];
    setDynamicMetadata([]);
    setRenderFlag(false);
    setStockDetails({});
  };
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["getStockList", authState?.user?.branchCode]);
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
        key={`StockTabGridMetaData` + renderFlag}
        finalMetaData={memoizedMetadata as GridMetaDataType}
        data={data ?? []}
        setData={() => null}
        loading={isLoading || isFetching}
        actions={actions}
        setAction={setCurrentAction}
        refetchData={handleRefetch}
        enableExport={true}
      />

      {stockDtlOpen ? (
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
          {stockDetailsMetadata?.isLoading ? (
            <LoaderPaperComponent />
          ) : (
            <>
              {stockDetailsMetadata?.isError ? (
                <Alert
                  severity={stockDetailsMetadata?.error?.severity ?? "error"}
                  errorMsg={stockDetailsMetadata?.error?.error_msg ?? "Error"}
                  errorDetail={stockDetailsMetadata?.error?.error_detail ?? ""}
                />
              ) : null}
              <FormWrapper
                key={"StcokTabDetails"}
                metaData={memoizedDetailMetadata as MetaDataType}
                initialValues={stockDetails ?? {}}
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
                    <GradientButton
                      color="primary"
                      onClick={() => handleClose()}
                    >
                      {t("Close")}
                    </GradientButton>
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
