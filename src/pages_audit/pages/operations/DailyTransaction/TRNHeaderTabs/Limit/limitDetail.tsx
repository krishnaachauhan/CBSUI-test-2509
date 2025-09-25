import {
  Alert,
  FormWrapper,
  GradientButton,
  LoaderPaperComponent,
  MetaDataType,
} from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import { LimitSecurityData } from "./api";
import { useQuery } from "react-query";
import { useEffect, useMemo, useState } from "react";
import { cloneDeep } from "lodash";
import { limitEntryMetaData } from "pages_audit/pages/operations/limit-entry/limitEntryMetadata";
import { t } from "i18next";

export const LimitDetailView = ({ isOpen, rowsData, handleClose, docCD }) => {
  const [dynamicMetadata, setDynamicMetadata] = useState<any>([]);
  const { data, isLoading, isFetching, error, isError } = useQuery<any, any>(
    ["LimitSecurityData", { rowsData }],
    () => {
      return LimitSecurityData(rowsData);
    }
  );

  useEffect(() => {
    const fetchAndTransformData = async () => {
      if (Array.isArray(data)) {
        const transformedData = await Promise.all(
          data.map(async (val) => ({
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

    if (data && data?.length > 0) {
      fetchAndTransformData();
    }
  }, [data]);

  const memorizedMetadata = useMemo(() => {
    const metadata = cloneDeep(limitEntryMetaData);
    if (rowsData) {
      if (metadata?.fields) {
        metadata.fields = [...metadata.fields, ...dynamicMetadata];
      }

      if (metadata?.form) {
        metadata.form.label = `${t("LimitDetails")} || ${
          rowsData?.LIMIT_STATUS
        }`;
      }

      return metadata;
    }
  }, [dynamicMetadata, rowsData, data]);

  return (
    <Dialog
      open={isOpen}
      onKeyUp={(event) => {
        if (event.key === "Escape") {
          handleClose();
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
      {isLoading || isFetching ? <LoaderPaperComponent size={30} /> : null}
      {isError ? (
        <Alert
          severity={error?.severity ?? "error"}
          errorMsg={error?.error_msg ?? "Error"}
          errorDetail={error?.error_detail ?? ""}
        />
      ) : null}
      {!isLoading && !isFetching ? (
        <FormWrapper
          key={"LimitTabDetails"}
          metaData={memorizedMetadata as MetaDataType}
          initialValues={rowsData ?? {}}
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
              <GradientButton color="primary" onClick={() => handleClose()}>
                {t("Close")}
              </GradientButton>
            );
          }}
        </FormWrapper>
      ) : null}
    </Dialog>
  );
};
