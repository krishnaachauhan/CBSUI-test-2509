import { AuthContext } from "pages_audit/auth";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { CkycContext } from "../../CkycContext";
import {
  CreateDetailsRequestData,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useMutation, useQuery } from "react-query";
import { getGridRowData } from "components/agGridTable/utils/helper";
import { CategoryGridMetaData } from "./updateCategGridMetaData";
import * as API from "../../api";
import { ClonedCkycContext } from "../formDetails/formComponents/legalComps/ClonedCkycContext";

const useCategoryUpdate = ({ setChangeCategDialog, isModal }) => {
  const { authState } = useContext(AuthContext);
  const { state, handleCategoryChangectx } = useContext(
    isModal ? ClonedCkycContext : CkycContext
  );
  const formRef = useRef<any>(null);
  const { MessageBox } = usePopupContext();
  const [categCD, setCategCD] = useState<any>("");
  const gridApiRef = useRef<any>();
  const [openAcctMSt, setOpenAcctMst] = useState({
    isAcctMstOpen: false,
    acctData: {},
  });

  // get API
  const {
    data: categoryData,
    isError: isCategDTLError,
    isLoading: isCategDTLLoading,
    error: CategDTLError,
  } = useQuery<any, any>(["getCategDTL", state?.customerIDctx], () =>
    API.getCategoryDTL({
      COMP_CD: authState?.companyID ?? "",
      BRANCH_CD: authState?.user?.branchCode ?? "",
      CUSTOMER_ID: state?.customerIDctx ?? "",
    })
  );

  // Save API
  const mutation: any = useMutation(API.saveCategUpdate, {
    onSuccess: (data) => {
      handleCategoryChangectx("", categCD);
      setChangeCategDialog(false);
    },
    onError: (error: any) => {},
  });

  const initialVal = useMemo(() => {
    let CategData: any[] = [];
    if (Array.isArray(categoryData) && categoryData?.length > 0) {
      CategData = categoryData?.map((row) => {
        return {
          ...row,
          APIDATA: { ...row },
          COMBINED_ACCT_NO: `${row?.COMP_CD}${row?.BRANCH_CD}${row?.ACCT_TYPE}${row?.ACCT_CD}`,
          NEW_CATEG_CD: categCD?.value ?? row?.NEW_CATEG_CD,
          UPD_FLAG: row?.UPD_FLAG === "Y" ? true : false,
          NEW_INT_RATE: row?.OLD_INT_RATE,
          NEW_AG_CL_RATE: row?.OLD_AG_CL_RATE,
          NEW_PENAL_RATE: row?.OLD_PENAL_RATE,
          NEW_INS_EXPIRY_PENAL_RATE: row?.OLD_INS_EXPIRY_PENAL_RATE,
          NEW_INST_RS: row?.OLD_INST_RS,
        };
      });
    }
    return Array.isArray(CategData) && CategData?.length > 0
      ? {
          OLD_CATEG_CD:
            state?.categoryValuectx ||
            state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CATEG_CD ||
            "",
          NEW_CATEG_CD: categCD?.value ?? CategData?.[0]?.NEW_CATEG_CD,
          MAPPED_ACCOUNTS: [...CategData],
          CUSTOMER_ID: state?.customerIDctx ?? "",
        }
      : {
          OLD_CATEG_CD:
            state?.categoryValuectx ||
            state?.retrieveFormDataApiRes?.PERSONAL_DETAIL?.CATEG_CD,
          NEW_CATEG_CD: "",
          MAPPED_ACCOUNTS: [],
          CUSTOMER_ID: state?.customerIDctx ?? "",
        };
  }, [categoryData, categCD, state]);

  const onSubmitHandler = (data: any) => {
    const gridData = getGridRowData(gridApiRef);
    const newData = gridData?.map((row) => {
      const { APIDATA, COMBINED_ACCT_NO, UPD_FLAG, ...others } = row;
      const {
        ACCT_CD,
        ACCT_TYPE,

        NEW_DUE_AMT,
        OLD_DUE_AMT,
        NEW_INST_RS,
        OLD_INST_RS,
      } = APIDATA;
      return {
        ...others,
        ACCT_CD: ACCT_CD,
        ACCT_TYPE: ACCT_TYPE,
        UPD_FLAG: Boolean(UPD_FLAG) ? "Y" : "N",
        NEW_DUE_AMT,
        OLD_DUE_AMT,
        NEW_INST_RS: data?.NEW_INST_RS ? data?.NEW_INST_RS : NEW_INST_RS,
        OLD_INST_RS: data?.OLD_INST_RS ? data?.OLD_INST_RS : OLD_INST_RS,
        _isNewRow: true,
      };
    });
    const finalResult = CreateDetailsRequestData(newData);
    mutation.mutate({
      CUSTOMER_ID: state?.customerIDctx ?? "",
      CONFIRMED: "Y",
      DETAILS_DATA: finalResult,
    });
  };

  const agGridProps = {
    id: "transactionGrid",
    columnDefs: CategoryGridMetaData.columns(),
    rowData: initialVal?.MAPPED_ACCOUNTS,
    onRowDoubleClicked: (params) => {
      setOpenAcctMst({ isAcctMstOpen: true, acctData: params?.node?.data });
    },
  };

  useEffect(() => {
    if (categCD && gridApiRef.current) {
      //* Refresh row data
      gridApiRef.current?.setGridOption("rowData", initialVal?.MAPPED_ACCOUNTS);
      gridApiRef.current?.refreshCells({ force: true, columns: ["UPD_FLAG"] });
    }
  }, [categCD]);

  return {
    formRef,
    MessageBox,
    setCategCD,
    categCD,
    isCategDTLError,
    isCategDTLLoading,
    CategDTLError,
    onSubmitHandler,
    agGridProps,
    initialVal,
    state,
    authState,
    gridApiRef,
    openAcctMSt,
    setOpenAcctMst,
  };
};

export default useCategoryUpdate;
