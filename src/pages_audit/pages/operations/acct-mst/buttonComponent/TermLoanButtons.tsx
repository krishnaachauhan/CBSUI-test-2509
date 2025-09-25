import { useTranslation } from "react-i18next";

import {
  usePopupContext,
  GradientButton,
  FormWrapper,
  MetaDataType,
  SubmitFnType,
  utilFunction,
  LoaderPaperComponent,
} from "@acuteinfo/common-base";
import { CircularProgress, Dialog } from "@mui/material";
import { PropertyMetadata } from "../buttonMetadata/PropertyBtnMetadata";
import { MachineryDetailsMetadata } from "../buttonMetadata/machineryDtlMetadata";
import { VehicleDetailsMetadata } from "../buttonMetadata/vehicleDtlMetadata";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AcctMSTContext } from "../AcctMSTContext";
import _ from "lodash";
import { format } from "date-fns";
import { AuthContext } from "pages_audit/auth";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import { OrnamentColumn } from "../buttonMetadata/ornamentBtnMetadata";
import {
  displayCommonErrorOnSubmit,
  displayNumber,
  getGridRowData,
  setAgGridRowData,
  validateGridAndGetData,
} from "components/agGridTable/utils/helper";

function removeTrailingZeroes(number) {
  let str = number.toString();
  if (str.endsWith(".00")) {
    return str.slice(0, -3);
  }
  return str;
}

const TermLoanButtons = ({
  closeDialog,
  buttonName,
  btnData,
  openDilog,
  otherData,
}) => {
  const {
    AcctMSTState,
    handleBtnDataonSavectx,
    UpdBtnDataonSavectx,
    handleModifiedColsctx,
  } = useContext(AcctMSTContext);

  const { authState } = useContext(AuthContext);
  const { MessageBox } = usePopupContext();
  const { t } = useTranslation();
  const formFieldsRef = useRef<any>([]);
  const gridApi = useRef<any>();
  const onSubmitHandler: SubmitFnType = async (
    data: any,
    displayData,
    endSubmit,
    setFieldError,
    actionFlag,
    hasError
  ) => {
    if (data && !hasError) {
      let formFields = Object.keys(data); // array, get all form-fields-name
      formFields = formFields.filter(
        (field) => !field.includes("_ignoreField")
      ); // array, removed divider field
      formFieldsRef.current = _.uniq([...formFieldsRef.current, ...formFields]);
      UpdBtnDataonSavectx(data);
      let newData = data;
      const oldData = btnData?.data?.[0] ?? [];
      let FinalReq;
      let templateData = {
        SAVE_FLAG: "F",
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        ACCT_TYPE: AcctMSTState?.accTypeValuectx ?? "",
        REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
        REQ_FLAG: "F",
        CUSTOMER_ID: AcctMSTState?.customerIDctx ?? "",
      };
      let updateTemplate: any = {
        SAVE_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
        COMP_CD: oldData?.COMP_CD ?? authState?.companyID,
        BRANCH_CD: oldData?.BRANCH_CD ?? authState?.user?.branchCode,
        ACCT_TYPE: oldData?.ACCT_TYPE ?? AcctMSTState?.accTypeValuectx,
        ACCT_CD: oldData?.ACCT_CD ?? AcctMSTState?.acctNumberctx,
        REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
        REQ_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
        CUSTOMER_ID:
          oldData?.CUSTOMER_ID ??
          AcctMSTState?.retrieveFormDataApiRes?.MAIN_DETAIL?.CUSTOMER_ID,
        J_TYPE: oldData?.J_TYPE ?? newData?.J_TYPE,
      };
      const dateFields: string[] = [
        "MFG_DATE",
        "PERMIT_EXPIRY_DT",
        "PERMIT_START_DT",
        "DOCUMENT_DT",
      ];

      const amountFields: string[] = [
        "COST_AMT",
        "ELIGIBLE_VALUE",
        "MARGIN",
        "PURCHASE_AMT",
        "ELIGIBLE_AMT",
      ];

      const allFields = Object.keys(newData);
      allFields.forEach((field) => {
        if (dateFields.includes(field)) {
          newData[field] = Boolean(newData[field])
            ? format(utilFunction.getParsedDate(newData[field]), "dd/MMM/yyyy")
            : "";
        }
      });
      amountFields.forEach((field) => {
        if (newData[field]) {
          newData[field] = removeTrailingZeroes(newData[field]);
        }
      });

      const transformed2 = utilFunction?.transformDetailDataForDML(
        [oldData],
        [newData],
        ["SR_CD"]
      );
      const transformed3 = utilFunction?.transformDetailsData(
        newData,
        btnData?.data?.[0] ? btnData?.data?.[0] : {}
      );
      let flagvalue = {
        IS_FROM_MAIN_TERMLOAN: "",
      };
      if (!AcctMSTState?.req_cd_ctx) {
        flagvalue.IS_FROM_MAIN_TERMLOAN = "Y";
      } else {
        flagvalue.IS_FROM_MAIN_TERMLOAN = "N";
      }
      let isVehicle = data?.J_TYPE === "V   ";
      let sectionKey = isVehicle ? "TERMLOAN_BTN_VEH" : "TERMLOAN_BTN_MAC";
      if (!AcctMSTState?.acctNumberctx) {
        FinalReq = {
          ...AcctMSTState?.btnDatactx,
          [sectionKey]: {
            ...(AcctMSTState?.btnDatactx?.[sectionKey] || {}),
            ...data,
            IsNewRow: btnData?.data?.[0] ? false : true,
            ...templateData,
            ...(btnData?.data?.[0] &&
              Object.keys(btnData?.data?.[0])?.length > 0 &&
              transformed3),
          },
        };
        handleBtnDataonSavectx(FinalReq);
        closeDialog();
      } else {
        let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
        let updatedCols = tabModifiedCols?.[sectionKey]
          ? _.uniq([...tabModifiedCols?.[sectionKey], ...formFieldsRef.current])
          : _.uniq([...formFieldsRef.current]);
        tabModifiedCols = {
          ...tabModifiedCols,
          [sectionKey]: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
        FinalReq = {
          ...AcctMSTState?.btnDatactx,
          [sectionKey]: {
            ...(AcctMSTState?.btnDatactx?.[sectionKey] || {}),
            IsNewRow: false,
            ...updateTemplate,
            ...transformed2,
            ...flagvalue,
          },
        };
        handleBtnDataonSavectx(FinalReq);
        closeDialog();
      }
    }
  };
  const SubitHandler = async () => {
    const result = validateGridAndGetData(gridApi);
    const isError = result?.isError ?? false;
    if (isError) {
      return;
    } else {
      const data = result?.rowData ?? [];
      UpdBtnDataonSavectx(data, "ORNAMENT");
      const UpdatedData = data?.map(({ ...item }) => {
        const sanitizedItem = Object.fromEntries(
          Object.entries(item).map(([key, value]) => [
            key,
            value === undefined ? "" : value,
          ])
        );
        return {
          LINE_ID: sanitizedItem?.LINE_ID ?? "",
          ORN_TYPE: sanitizedItem?.ORN_TYPE ?? "",
          ORN_NAME: sanitizedItem?.ORN_NAME ?? "",
          NO_OF_ORN: sanitizedItem?.NO_OF_ORN ?? "",
          GROSS_WEIGHT: sanitizedItem?.GROSS_WEIGHT ?? "",
          WEIGHT: sanitizedItem?.WEIGHT ?? "",
          CARET: sanitizedItem?.CARET ?? "",
          MKT_RATE: sanitizedItem?.MKT_RATE ?? "",
          MKT_VALUE: sanitizedItem?.MKT_VALUE ?? "",
          AMOUNT: sanitizedItem?.AMOUNT ?? "",
          VALUER_CD: sanitizedItem?.VALUER_CD ?? "",
          EMP_ID: sanitizedItem?.EMP_ID ?? "",
          ACTIVE: sanitizedItem?.ACTIVE === true ? "Y" : "N",
          SR_CD: sanitizedItem?.SR_CD ?? "1",
          TRAN_CD: AcctMSTState?.acctNumberctx
            ? otherData?.PACKET_NO?.value
            : "1",
          PACKET_NO: otherData?.PACKET_NO?.value
            ? otherData?.PACKET_NO?.value
            : "1",
          DESCRIPTION: otherData?.DESCRIPTION?.value
            ? otherData?.DESCRIPTION?.value
            : "",
        };
      });
      const OldData = btnData?.data?.map(({ ...item }) => {
        return {
          LINE_ID: item?.LINE_ID ?? "",
          ORN_TYPE: item?.ORN_TYPE ?? "",
          ORN_NAME: item?.ORN_NAME ?? "",
          NO_OF_ORN: item?.NO_OF_ORN ?? "",
          GROSS_WEIGHT: item?.GROSS_WEIGHT ?? "",
          WEIGHT: item?.WEIGHT ?? "",
          CARET: item?.CARET ?? "",
          MKT_RATE: item?.MKT_RATE ?? "",
          MKT_VALUE: item?.MKT_VALUE ?? "",
          AMOUNT: item?.AMOUNT ?? "",
          VALUER_CD: item?.VALUER_CD ?? "",
          EMP_ID: item?.EMP_ID ?? "",
          ACTIVE: item?.ACTIVE === true ? "Y" : "N",
          SR_CD: item?.SR_CD ?? "",
          TRAN_CD: item?.TRAN_CD ?? "",
          PACKET_NO: item?.PACKET_NO ?? "",
          DESCRIPTION: item?.DESCRIPTION ?? "",
        };
      });
      const TemplateData = {
        ACCT_CD: AcctMSTState?.acctNumberctx,
        ACCT_TYPE: AcctMSTState?.accTypeValuectx,
        BRANCH_CD: AcctMSTState?.rowBranchCodectx
          ? AcctMSTState?.rowBranchCodectx
          : authState?.user?.branchCode ?? "",
        REQ_CD: AcctMSTState?.req_cd_ctx ?? "",
        COMP_CD: authState?.companyID ?? "",
        REQ_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
        SAVE_FLAG: AcctMSTState?.acctNumberctx ? "E" : "F",
      };
      let newData = UpdatedData ?? [];
      let oldData = OldData ?? [];
      let maxSRCD =
        oldData?.reduce((max, item) => {
          const srCdNum = parseInt(item.LINE_ID, 10);
          return !isNaN(srCdNum) && srCdNum > max ? srCdNum : max;
        }, 0) ?? 0;
      newData?.forEach((item) => {
        if (!item.LINE_ID || item.LINE_ID === "") {
          maxSRCD += 1;
          item.LINE_ID = String(maxSRCD);
        }
      });
      let FinalReq = {};
      let flagvalue = {
        IS_FROM_MAIN_TERMLOAN: "",
      };
      if (AcctMSTState?.acctNumberctx) {
        if (!AcctMSTState?.req_cd_ctx) {
          flagvalue.IS_FROM_MAIN_TERMLOAN = "Y";
        } else {
          flagvalue.IS_FROM_MAIN_TERMLOAN = "N";
        }
      }
      const transformed2 = utilFunction?.transformDetailDataForDML(
        oldData,
        newData,
        ["LINE_ID"]
      );
      if (AcctMSTState?.formmodectx === "new") {
        const mergeData = newData?.map((item) => ({
          ...item,
          ...TemplateData,
          IsNewRow: true,
        }));
        FinalReq["ORNAMENT_BUTTON_DTL"] = mergeData;
        handleBtnDataonSavectx(FinalReq);
        closeDialog();
      } else {
        let tabModifiedCols: any = AcctMSTState?.modifiedFormCols;
        let updatedCols = tabModifiedCols?.ORNAMENT_BUTTON_DTL
          ? _.uniq([
              ...tabModifiedCols?.ORNAMENT_BUTTON_DTL,
              ...formFieldsRef.current,
            ])
          : _.uniq([...formFieldsRef.current]);
        tabModifiedCols = {
          ...tabModifiedCols,
          ORNAMENT_BUTTON_DTL: [...updatedCols],
        };
        handleModifiedColsctx(tabModifiedCols);
        const mergeData = {
          ...transformed2,
          ...TemplateData,
          IsNewRow: false,
          ...flagvalue,
        };
        FinalReq["ORNAMENT_BUTTON_DTL"] = [mergeData];
        FinalReq = {
          ...FinalReq,
          ...AcctMSTState?.btnDatactx,
        };
        handleBtnDataonSavectx(FinalReq);
        closeDialog();
      }
    }
  };
  const handleAddNewRow = () => {
    gridApi.current.applyTransaction({
      add: [{ NO_OF_ORN: "1", ACTIVE: true }],
    });
  };
  const initialVal = useMemo(() => {
    let value;

    if (buttonName === "VEHICLE") {
      value =
        AcctMSTState?.UpdDatactx?.["TERMLOAN_BTN_VEH"] ||
        AcctMSTState?.retrievebtnDataApiRes?.["TERMLOAN_BTN_VEH"] ||
        AcctMSTState?.btnDatactx?.["TERMLOAN_BTN_VEH"];
    } else if (buttonName === "MACHINERY") {
      value =
        AcctMSTState?.UpdDatactx?.["TERMLOAN_BTN_MAC"] ||
        AcctMSTState?.retrievebtnDataApiRes?.["TERMLOAN_BTN_MAC"] ||
        AcctMSTState?.btnDatactx?.["TERMLOAN_BTN_MAC"];
    }

    return value ?? btnData?.data?.[0];
  }, [
    buttonName,
    AcctMSTState?.UpdDatactx?.["TERMLOAN_BTN_VEH"],
    AcctMSTState?.retrievebtnDataApiRes?.["TERMLOAN_BTN_VEH"],
    AcctMSTState?.UpdDatactx?.["TERMLOAN_BTN_MAC"],
    AcctMSTState?.retrievebtnDataApiRes?.["TERMLOAN_BTN_MAC"],
    btnData?.data?.[0],
    AcctMSTState?.btnDatactx?.["TERMLOAN_BTN_VEH"],
    AcctMSTState?.btnDatactx?.["TERMLOAN_BTN_MAC"],
  ]);
  const gridData =
    AcctMSTState?.UpdDatactx?.["ORNAMENT_BUTTON_DTL"] ||
    AcctMSTState?.retrievebtnDataApiRes?.["ORNAMENT_BUTTON_DTL"] ||
    AcctMSTState?.btnDatactx?.["ORNAMENT_BUTTON_DTL"];
  const updatePinnedBottomRow = () => {
    if (!gridApi) return;
    let marketValue = 0;
    let MarginAmount = 0;
    gridApi.current.forEachNode((node) => {
      if (node.data.ACTIVE) {
        const mktValueStr = node.data.MKT_VALUE ?? 0;
        const marginAmtStr = node.data?.AMOUNT ?? 0;
        const mktValue = parseFloat(mktValueStr) || 0;
        const marginAmt = parseFloat(marginAmtStr) || 0;
        marketValue += mktValue;
        MarginAmount += marginAmt;
      }
    });
    gridApi.current.setGridOption("pinnedBottomRowData", [
      {
        MKT_VALUE: `${displayNumber(marketValue)}`,
        AMOUNT: `${displayNumber(MarginAmount)}`,
      },
    ]);
  };
  const agGridProps = {
    id: "gst-outward-table",
    columnDefs: OrnamentColumn.columns({
      authState,
      AcctMSTState,
    }),
    rowData:
      gridData?.length > 0 ? gridData : [{ NO_OF_ORN: "1", ACTIVE: true }],
    onCellValueChanged: updatePinnedBottomRow,
  };
  useEffect(() => {
    if (buttonName === "ORNAMENT") {
      let value =
        gridData?.length > 0 ? gridData : [{ NO_OF_ORN: "1", ACTIVE: true }];
      if (value && gridApi?.current) {
        setAgGridRowData(gridApi, value ?? btnData?.data);
        updatePinnedBottomRow();
      }
    }
  }, [
    AcctMSTState?.UpdDatactx?.["ORNAMENT_BUTTON_DTL"],
    AcctMSTState?.retrievebtnDataApiRes?.["ORNAMENT_BUTTON_DTL"],
    AcctMSTState?.btnDatactx?.["ORNAMENT_BUTTON_DTL"],
  ]);
  return (
    <>
      <Dialog
        open={openDilog}
        PaperProps={{
          style: {
            width: "90vw",
            overflow: "auto",
          },
        }}
        maxWidth="xl"
      >
        {btnData?.isLoading ? (
          <LoaderPaperComponent />
        ) : buttonName !== "ORNAMENT" ? (
          <FormWrapper
            key={
              "MachineryDetailsMetadata" +
              btnData?.data?.[0] +
              AcctMSTState?.formmodectx
            }
            metaData={
              buttonName === "VEHICLE"
                ? (VehicleDetailsMetadata as MetaDataType)
                : (MachineryDetailsMetadata as MetaDataType)
            }
            onSubmitHandler={onSubmitHandler}
            initialValues={initialVal}
            formStyle={{
              background: "white",
            }}
            formState={{
              MessageBox: MessageBox,
            }}
            displayMode={AcctMSTState?.formmodectx}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                {AcctMSTState?.formmodectx !== "view" && (
                  <GradientButton
                    onClick={(event) => {
                      handleSubmit(event, "Save");
                    }}
                    disabled={isSubmitting}
                    endIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    color={"primary"}
                  >
                    {t("Save")}
                  </GradientButton>
                )}
                <GradientButton onClick={closeDialog} color={"primary"}>
                  {t("Back")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
        ) : (
          <AgGridTableWrapper
            agGridProps={agGridProps}
            gridConfig={OrnamentColumn.gridConfig}
            getGridApi={gridApi}
            gridContext={{
              authState,
              mode: AcctMSTState?.formmodectx ?? "new",
            }}
            autoSelectFirst={true}
            updatePinnedBottomRow={updatePinnedBottomRow}
            defaultView={"new"}
            buttons={[
              {
                label: t("SaveClose"),
                onClick: SubitHandler,
                disabled: AcctMSTState?.formmodectx === "view",
              },
              { label: t("Close"), onClick: closeDialog },
            ]}
            isNewButtonVisible={AcctMSTState?.formmodectx !== "view"}
            handleAddNewRow={handleAddNewRow}
          />
        )}
      </Dialog>
    </>
  );
};

export default TermLoanButtons;
