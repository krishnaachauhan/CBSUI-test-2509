import {
  Alert,
  FormWrapper,
  GradientButton,
  MetaDataType,
  queryClient,
  usePopupContext,
} from "@acuteinfo/common-base";
import { AppBar, Dialog, LinearProgress } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import { useQuery } from "react-query";
import { bottomGridData, topGridData } from "../api";
import { LinearProgressBarSpacer } from "components/common/custom/linerProgressBarSpacer";
import StickyHeadTable from "./multiSectionTable";
import { useLocation } from "react-router-dom";
import { getdocCD } from "components/utilFunction/function";
import { t } from "i18next";

const RetrieveCompoD = ({
  classes,
  open,
  handleClose,
  loginState,
  retrievalParaValues,
  defaultData,
  retrievalType,
  metaData,
}) => {
  const myRef = useRef<any>(null);
  const reqDataRef = useRef<any>({ bottomSelectData: [], topSelectData: [] });
  const { MessageBox } = usePopupContext();

  const { formVisible, buttonVisible, formMetadata, ...formConfigData } =
    metaData?.formConfig ?? {};

  const [formaData, setFormData] = useState<any>(formMetadata);

  useEffect(() => {
    if (formMetadata?.fields?.length) {
      const updatedFields: any = [];

      formMetadata.fields.forEach((item) => {
        let updated: any = { ...item };

        if (typeof item?.validate === "string") {
          updated.validate = new Function(
            "currentField",
            "dependentField",
            "formState",
            item.validate
          );
          // continue → move to next condition
        }

        if (typeof item?.shouldExclude === "string") {
          updated.shouldExclude = new Function(
            "currentField",
            "dependentField",
            "formState",
            item.shouldExclude
          );
          // continue
        }

        if (typeof item?.postValidationSetCrossFieldValues === "string") {
          updated.postValidationSetCrossFieldValues = new Function(
            "currentField",
            "formState",
            "authState",
            "dependentField",
            item.postValidationSetCrossFieldValues
          );
          // continue
        }

        if (typeof item?.setFieldLabel === "string") {
          updated.setFieldLabel = new Function(
            "dependentField",
            "currentField",
            item.setFieldLabel
          );
          // continue
        }

        updatedFields.push(updated);
      });

      setFormData({ ...formMetadata, fields: updatedFields });
    }
  }, [formMetadata]);

  const actions = [
    {
      buttonName: "Ok",
      callback: (e) => {
        myRef.current?.handleSubmit(e, "Save");
      },
    },
    {
      buttonName: "Close",
      callback: () => {
        handleClose();
      },
    },
  ];

  function extractGridData(gridConfig, dataArray) {
    const result = {};
    gridConfig?.reqParameters?.forEach(({ accessorName, dataValue }) => {
      result[accessorName] = dataArray
        .map((item) => item[dataValue] ?? "")
        .join(",");
    });
    return result;
  }

  const onSubmitHandler = (data: any, displayData, endSubmit) => {
    endSubmit(true);

    const topGridResult = extractGridData(
      metaData.topGridConfig,
      reqDataRef.current.topSelectData
    );
    const bottomGridResult = extractGridData(
      metaData.bottomGridConfig,
      reqDataRef.current.bottomSelectData
    );

    const visibleInRetrievalKeys = {};

    metaData?.formConfig?.formMetadata?.fields?.forEach(
      ({ name, visibleInRetrieval }) => {
        visibleInRetrievalKeys[name] = visibleInRetrieval ?? true;
      }
    );

    [
      ...(metaData?.topGridConfig?.reqParameters ?? []),
      ...(metaData?.bottomGridConfig?.reqParameters ?? []),
    ]?.forEach(({ accessorName, visibleInRetrieval }) => {
      visibleInRetrievalKeys[accessorName] = visibleInRetrieval ?? true;
    });

    if (
      reqDataRef.current.topSelectData?.length == 0 &&
      metaData?.topGridConfig?.isTopVisible &&
      metaData?.topGridConfig?.isSelctionRequiredT
    ) {
      MessageBox(metaData?.topGridConfig?.topMessageData);
    } else if (
      reqDataRef.current?.bottomSelectData == 0 &&
      metaData?.bottomGridConfig?.isBottomVisible &&
      metaData?.bottomGridConfig?.isSelctionRequiredB
    ) {
      MessageBox(metaData?.bottomGridConfig?.bottomMessageData);
    } else {
      let newData = { ...data, ...topGridResult, ...bottomGridResult };

      let colomnKeyLabel = metaData?.formConfig?.formMetadata?.fields.reduce(
        (acc, curr) => {
          acc[curr.name] = curr.label;
          return acc;
        },
        {}
      );

      const retrievalValues: any = Object.entries(newData)
        .sort()
        .map((key: any, val) => {
          const label = [
            ...(metaData?.topGridConfig?.reqParameters ?? []),
            ...(metaData?.bottomGridConfig?.reqParameters ?? []),
          ].find((item) => item.accessorName === key?.[0])?.displayLabel;

          const rawValue = key?.[1];

          const formattedValue =
            formMetadata?.fields?.find((f) => f.name === key?.[0])?.render
              ?.componentType === "datePicker"
              ? format(new Date(rawValue ?? new Date()), "dd/MMM/yyyy")
              : typeof rawValue === "boolean"
              ? rawValue
                ? "Y"
                : "N"
              : rawValue;

          return {
            id: key?.[0],
            value: {
              condition: "equal",
              value: formattedValue,
              // columnName: key?.[0],
              columnName: colomnKeyLabel[key?.[0]]
                ? t(colomnKeyLabel[key?.[0]])
                : t(label),
              // columnName: colomnKeyLabel[key?.[0]] ?? label,
              visibleInRetrieval: visibleInRetrievalKeys[key?.[0]],
            },
          };
        });

      retrievalParaValues(retrievalValues, newData);
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "700px",
          padding: "8px",
        },
      }}
      {...metaData?.dialogStyle}
    >
      <>
        {metaData?.topGridConfig?.isTopVisible && (
          <TopGridCompo reqDataRef={reqDataRef} metaData={metaData} />
        )}
        <div
          style={{
            display: !formVisible ? "none" : "inherit",
          }}
        >
          <FormWrapper
            key={`retrieve-report-Form`}
            metaData={formaData as MetaDataType}
            initialValues={{}}
            onSubmitHandler={onSubmitHandler}
            ref={myRef}
            formStyle={{
              ...formConfigData?.formStyle,
            }}
            hideHeader={true}
            {...formConfigData}
          ></FormWrapper>
        </div>

        {metaData?.bottomGridConfig?.isBottomVisible && (
          <BottomGridCompo
            reqDataRef={reqDataRef}
            metaData={metaData}
            actions={actions}
          />
        )}

        {buttonVisible && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <GradientButton
              id="1"
              onClick={(e) => {
                myRef.current?.handleSubmit(e, "Save");
              }}
              color={"primary"}
              style={{
                padding: "10px",
                width: "fit-content",
                margin: "auto 10px",
                height: "39px",
              }}
            >
              {t("Ok")}
            </GradientButton>

            <GradientButton
              id="2"
              onClick={() => {
                handleClose();
              }}
              color={"primary"}
              style={{
                padding: "10px",
                // margin: "auto",
                width: "fit-content",
                height: "39px",
              }}
            >
              {t("Cancel")}
            </GradientButton>
          </div>
        )}
      </>
    </Dialog>
  );
};

const TopGridCompo = ({ metaData, reqDataRef }) => {
  const { authState } = useContext(AuthContext);
  const {
    isTopVisible,
    topColumns,
    topMessageData,
    isSelctionRequiredT,
    ...topConfigData
  } = metaData?.topGridConfig ?? {};
  const topGrid = useQuery<any, any, any>(
    ["topGridData"],
    () =>
      topGridData({
        API_URL: metaData?.topGridConfig?.apiUrl,
        COMP_CD: authState?.companyID,
        ...topConfigData?.staticReq,
      }),
    {
      enabled:
        metaData?.topGridConfig?.apiUrl &&
        metaData?.topGridConfig?.apiUrl.trim() !== "",
    }
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["topGridData"]);
    };
  }, []);
  return (
    <>
      {topGrid?.isLoading || topGrid?.isFetching ? (
        <LinearProgress color="secondary" />
      ) : topGrid?.isError ? (
        <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={topGrid?.error?.error_msg ?? "Unknow Error"}
              errorDetail={topGrid?.error?.error_detail ?? ""}
              color="error"
            />
          </AppBar>
        </div>
      ) : (
        <LinearProgressBarSpacer />
      )}
      <StickyHeadTable
        rowData={topGrid?.data}
        columnData={topColumns}
        onChangeValue={(orignalData, filterData, selectedData) => {
          reqDataRef.current.topSelectData = selectedData;
        }}
        defaultData={[
          {
            id: "BRANCH_CD",
            value: {
              value: authState?.user?.branchCode,
              columnName: "Branch Code",
            },
          },
        ]}
        {...topConfigData}
      />
    </>
  );
};

const BottomGridCompo = ({ metaData, reqDataRef, actions }) => {
  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);
  const {
    isBottomVisible,
    bottomColumns,
    bottomMessageData,
    isSelctionRequiredB,
    ...bottomConfigData
  } = metaData?.bottomGridConfig ?? {};

  const bottomGrid = useQuery<any, any, any>(
    ["bottomGridData"],
    () =>
      bottomGridData({
        API_URL: metaData?.bottomGridConfig?.apiUrl,
        COMP_CD: authState?.companyID,
        BRANCH_CD: authState?.user?.branchCode,
        USER_NAME: authState?.user?.id,
        DOC_CD: docCD,
        ...bottomConfigData?.staticReq,
      }),
    {
      enabled:
        metaData?.bottomGridConfig?.apiUrl &&
        metaData?.bottomGridConfig?.apiUrl.trim() !== "",
    }
  );
  useEffect(() => {
    return () => {
      queryClient.removeQueries(["bottomGridData"]);
    };
  }, []);

  return (
    <>
      {bottomGrid?.isLoading || bottomGrid?.isFetching ? (
        <LinearProgress color="secondary" />
      ) : bottomGrid?.isError ? (
        <div style={{ paddingRight: "10px", paddingLeft: "10px" }}>
          <AppBar position="relative" color="primary">
            <Alert
              severity="error"
              errorMsg={
                bottomGrid?.error?.error_msg ?? t("Unknownerroroccured")
              }
              errorDetail={bottomGrid?.error?.error_detail ?? ""}
              color="error"
            />
          </AppBar>
        </div>
      ) : (
        <LinearProgressBarSpacer />
      )}
      <StickyHeadTable
        rowData={bottomGrid?.data}
        columnData={bottomColumns}
        actions={actions}
        onChangeValue={(orignalData, filterData, selectedData) => {
          reqDataRef.current.bottomSelectData = selectedData;
        }}
        defaultData={[
          {
            id: "BRANCH_CD",
            value: {
              value: authState?.user?.branchCode,
              columnName: "Branch Code",
            },
          },
        ]}
        {...bottomConfigData}
      />
    </>
  );
};

export default RetrieveCompoD;
