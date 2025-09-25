import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Grid,
  Typography,
  IconButton,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  Box,
} from "@mui/material";
import {
  FormWrapper,
  MetaDataType,
  usePopupContext,
  utilFunction,
} from "@acuteinfo/common-base";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTranslation } from "react-i18next";
import { CkycContext } from "../../../../CkycContext";
import * as API from "../../../../api";
import { AuthContext } from "pages_audit/auth";
import { useMutation } from "react-query";
import _ from "lodash";
import TabNavigate from "../TabNavigate";
import ControllingPersonDTAgGrid from "./ControllingPersonDTAgGrid";
import { validateGridRow } from "components/agGridTable/utils/helper";
import { ClonedCkycContext } from "./ClonedCkycContext";

const ControllingPersonDTL = ({ isModal }) => {
  const { t } = useTranslation();
  const { MessageBox } = usePopupContext();
  const { authState } = useContext(AuthContext);
  const {
    state,
    handleFormDataonSavectx,
    handleStepStatusctx,
    handleModifiedColsctx,
    handleSavectx,
    handleCurrFormctx,
    toNextTab,
    toPrevTab,
    tabFormRefs,
    handleColTabChangectx,
    handleUpdateLoader,
    handleFinalUpdateReq,
    handleFormDataonRetrievectx,
    checkArrFieldLength,
    addArrCommonData,
    handleSaveMultipleRowctx,
  } = useContext(isModal ? ClonedCkycContext : CkycContext);
  const formRef = useRef<any>("");
  const [acctName, setAcctName] = useState("");
  const [formStatus, setFormStatus] = useState<any[]>([]);
  const stepStatusRef = useRef<any>("");
  const gridRef = useRef<any>(null);
  const stateRef = useRef<any>(state);
  stateRef.current = state;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let refs = [gridRef, handleSave];
    handleCurrFormctx({
      currentFormRefctx: refs,
      colTabValuectx: state?.colTabValuectx,
      currentFormSubmitted: null,
    });
  }, []);

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Details of Controlling Persons"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = formRef.current;
    }
  }, [tabFormRefs, state?.tabNameList]);

  // useEffect(() => {
  //   if (
  //     Boolean(
  //       state?.currentFormctx.currentFormRefctx &&
  //         state?.currentFormctx.currentFormRefctx.length > 0
  //     ) &&
  //     Boolean(formStatus && formStatus.length > 0)
  //   ) {
  //     if (
  //       state?.currentFormctx.currentFormRefctx.length === formStatus.length
  //     ) {
  //       let submitted;
  //       submitted = formStatus.filter((form) => !Boolean(form));
  //       if (submitted && Array.isArray(submitted) && submitted.length > 0) {
  //         submitted = false;
  //       } else {
  //         submitted = true;
  //         const lastActionFlag = stepStatusRef.current;
  //         if (lastActionFlag && lastActionFlag?.startsWith("TabChange")) {
  //           const tabIndex = parseInt(lastActionFlag?.split(" ")[1], 10);
  //           handleStepStatusctx({
  //             status: "completed",
  //             coltabvalue: state?.colTabValuectx,
  //           });
  //           handleColTabChangectx(tabIndex);
  //         } else if (
  //           !state?.customerIDctx?.trim() &&
  //           !lastActionFlag?.startsWith("UpdateData")
  //         ) {
  //           handleStepStatusctx({
  //             status: "completed",
  //             coltabvalue: state?.colTabValuectx,
  //           });
  //           toNextTab();
  //         } else {
  //           handleStepStatusctx({
  //             status: "completed",
  //             coltabvalue: state?.colTabValuectx,
  //           });
  //         }
  //       }
  //       handleUpdateLoader(false);
  //       handleCurrFormctx({
  //         currentFormSubmitted: submitted
  //       });
  //       setFormStatus([]);
  //     }
  //   }
  // }, [formStatus]);

  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const handleFormExpand = () => {
    setIsFormExpanded(!isFormExpanded);
  };

  const initialVal = useMemo(() => {
    const initialData = state?.multipleRows?.RELATED_PERSON_DTL ?? [];
    return initialData ?? [];
  }, [state?.retrieveFormDataApiRes, state?.multipleRows]);

  // useEffect(() => {
  //   let refs = [handleSave];
  //   handleCurrFormctx({
  //     currentFormRefctx: refs,
  //     colTabValuectx: state?.colTabValuectx,
  //     currentFormSubmitted: null,
  //   });
  // }, []);

  const handleSave = async (e, flag) => {
    handleUpdateLoader(true);
    const datas = await gridRef.current?.handleSubmit();
    const data = datas?.updatedData;
    for (let index = 0; index < data?.length; index++) {
      const row = data[index];
      if (
        !row.hasOwnProperty("RELATED_PERSON_TYPE") ||
        !row.RELATED_PERSON_TYPE?.trim()
      ) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: t("PleaseSelectRelatedPersonTypeRow", { row: index + 1 }),
          icon: "ERROR",
        });
        handleUpdateLoader(false);
        return;
      }
      if (!row.hasOwnProperty("REF_CUST_ID") || !row.REF_CUST_ID?.trim()) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: t("PleaseEnterRelatedPersonCustomerIDRow", {
            row: index + 1,
          }),
          icon: "ERROR",
        });
        handleUpdateLoader(false);
        return;
      }
    }
    if (data) {
      handleUpdateLoader(true);
      // stepStatusRef.current = actionFlag;
      let newData = state?.formDatactx;
      const commonData = {
        IsNewRow: true,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
        REQ_FLAG: "F",
        ENT_COMP_CD: authState?.companyID ?? "",
        ENT_BRANCH_CD: authState?.user?.branchCode ?? "",
      };
      if (Array.isArray(data) && data?.length > 0) {
        let filteredCols: any[] = [];
        filteredCols = Object.keys(data[0]);
        if (state?.isFreshEntryctx || state?.isDraftSavedctx) {
          filteredCols = filteredCols.filter(
            (field) => !field.includes("SR_CD")
          );
        }

        let newFormatRelPerDtl = data.map((formRow, i) => {
          let formFields = Object.keys(formRow);

          const formData = _.pick(data[i], formFields);
          return { ...formData, ...commonData };
        });

        newData["RELATED_PERSON_DTL"] = [...newFormatRelPerDtl];

        handleFormDataonSavectx(newData);

        if (!state?.isFreshEntryctx && state?.fromctx !== "new-draft") {
          let tabModifiedCols: any = state?.modifiedFormCols;
          tabModifiedCols = {
            ...tabModifiedCols,
            RELATED_PERSON_DTL: [...filteredCols],
          };
          handleModifiedColsctx(tabModifiedCols);
        }
      } else {
        newData["RELATED_PERSON_DTL"] = [];
        handleFormDataonSavectx(newData);
        if (!state?.isFreshEntryctx && state?.fromctx !== "new-draft") {
          let tabModifiedCols: any = state?.modifiedFormCols;
          tabModifiedCols = {
            ...tabModifiedCols,
            RELATED_PERSON_DTL: [],
          };
          handleModifiedColsctx(tabModifiedCols);
        }
      }

      let req = {
        ...utilFunction.transformDetailDataForDML(
          stateRef?.current?.retrieveFormDataApiRes?.["RELATED_PERSON_DTL"] ??
            [],
          data ?? [],
          ["SR_CD"]
        ),
      };

      let controllingPersonDtl;
      const reqCd = stateRef?.current?.req_cd_ctx;
      const customerId = stateRef?.current?.customerIDctx;
      if (!reqCd && !customerId) {
        controllingPersonDtl =
          data?.["RELATED_PERSON_DTL"]?.map((row) => {
            return {
              ...row,
              IsNewRow: true,
              COMP_CD: authState?.companyID ?? "",
              BRANCH_CD: authState?.user?.branchCode ?? "",
              REQ_FLAG: Boolean(stateRef?.current?.customerIDctx) ? "E" : "F",
              REQ_CD: reqCd ?? "",
              CUSTOMER_ID: customerId ?? "",
            };
          }) ?? [];
      } else if (reqCd && !customerId) {
        controllingPersonDtl = [
          {
            ...req,
            IsNewRow: false,
            COMP_CD: authState?.companyID ?? "",
            BRANCH_CD: authState?.user?.branchCode ?? "",
            REQ_FLAG: Boolean(stateRef?.current?.customerIDctx) ? "E" : "F",
            REQ_CD: reqCd ?? "",
            CUSTOMER_ID: customerId ?? "",
          },
        ];
      } else {
        controllingPersonDtl = {
          DETAILS_DATA: {
            ...req,
          },
          IsNewRow: false,
          COMP_CD:
            stateRef?.current?.retrieveFormDataApiRes?.PERSONAL_DETAIL
              ?.COMP_CD ?? "",
          BRANCH_CD:
            stateRef?.current?.retrieveFormDataApiRes?.PERSONAL_DETAIL
              ?.BRANCH_CD ?? "",
          REQ_FLAG: Boolean(stateRef?.current?.customerIDctx) ? "E" : "F",
          REQ_CD: reqCd ?? "",
          CUSTOMER_ID: customerId ?? "",
          IS_FROM_OTH_REF: reqCd ? "N" : "Y",
        };
      }

      const commonDataAdd = await addArrCommonData(
        controllingPersonDtl,
        stateRef?.current,
        reqCd,
        customerId
      );
      const checkLength = await checkArrFieldLength(
        commonDataAdd,
        reqCd,
        customerId
      );

      if (checkLength) {
        handleSaveMultipleRowctx(newData ?? []);
        handleFinalUpdateReq({
          RELATED_PERSON_DTL: commonDataAdd,
        });
      }
      setFormStatus((old) => [...old, true]);
    } else {
      handleUpdateLoader(false);
      handleStepStatusctx({
        status: "error",
        coltabvalue: state?.colTabValuectx,
      });
      setFormStatus((old) => [...old, false]);
    }
    if (flag && flag?.startsWith("TabChange")) {
      const tabIndex = parseInt(flag?.split(" ")[1], 10);
      handleStepStatusctx({
        status: "completed",
        coltabvalue: stateRef?.current?.colTabValuectx,
      });
      handleColTabChangectx(tabIndex);
    } else if (
      !stateRef?.current?.customerIDctx?.trim() &&
      !flag?.startsWith("UpdateData")
    ) {
      handleStepStatusctx({
        status: "completed",
        coltabvalue: stateRef?.current?.colTabValuectx,
      });
      flag?.startsWith("PREVIOUS") ? toPrevTab() : toNextTab();
    }
    handleUpdateLoader(false);
    handleCurrFormctx({
      currentFormSubmitted: true,
    });
  };

  useEffect(() => {
    const tabIndex = state?.tabNameList?.findIndex(
      (tab) => tab.tabNameFlag === "Details of Controlling Persons"
    );
    if (tabFormRefs && tabIndex !== -1) {
      tabFormRefs.current[tabIndex] = { handleSubmit: handleSave };
    }
  }, [tabFormRefs, state?.tabNameList, handleSave]);

  return (
    <Grid container rowGap={3}>
      <Grid
        sx={{
          backgroundColor: "var(--theme-color2)",
          padding: (theme) => theme.spacing(1),
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: "20px",
        }}
        container
        item
        xs={12}
        direction={"column"}
      >
        <Grid
          container
          item
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography
            sx={{ color: "var(--theme-color3)", pl: 2 }}
            variant={"h6"}
          >
            {!isFormExpanded
              ? state?.tabsApiResctx[state?.colTabValuectx]?.TAB_DISPL_NAME
                ? state?.tabsApiResctx[state?.colTabValuectx]?.TAB_DISPL_NAME
                : t("ControllingPersonDTL")
              : ""}
          </Typography>
          <IconButton onClick={handleFormExpand}>
            {!isFormExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Grid>

        <Collapse in={isFormExpanded}>
          <Grid item>
            <ControllingPersonDTAgGrid
              ref={gridRef}
              data={initialVal}
              isModal={isModal}
            />
          </Grid>
        </Collapse>
      </Grid>
      <TabNavigate
        handleSave={handleSave}
        displayMode={state?.formmodectx ?? "new"}
        isModal={isModal}
      />
    </Grid>
  );
};
export default ControllingPersonDTL;
