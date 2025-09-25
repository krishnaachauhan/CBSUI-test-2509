import { AuthContext } from "pages_audit/auth";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  CreateDetailsRequestData,
  usePopupContext,
} from "@acuteinfo/common-base";
import { getGridRowData } from "components/agGridTable/utils/helper";
import { CkycContext } from "pages_audit/pages/operations/c-kyc/CkycContext";
import { t } from "i18next";
const useControllingPerson = () => {
  const { authState } = useContext(AuthContext);
  const formRef = useRef<any>(null);
  const { MessageBox } = usePopupContext();
  const [categCD, setCategCD] = useState<any>("");
  const gridApiRef = useRef<any>();

  const onSave = () => {
    const gridData = getGridRowData(gridApiRef);

    const updatedData = Array.isArray(gridData)
      ? gridData.map((item) => {
          const {
            IsNewRow,
            REQ_FLAG,
            HIDE_CHECK,
            RELATED_PERSON_TYPE_OPT,
            DISPLY_RELATED_PERSON_TYPE,
            errors,
            REMARKS,
            ...rest
          } = item;

          return {
            ...rest,
          };
        })
      : [];

    return { updatedData, gridApiRef };
  };

  const handleAddNewRow = async () => {
    const rowsData = getGridRowData(gridApiRef);
    for (let index = 0; index < rowsData.length; index++) {
      const currentRow = rowsData[index];
      if (!currentRow?.RELATED_PERSON_TYPE) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: t("PleaseSelectRelatedPersonTypeRow", { row: index + 1 }),
          icon: "ERROR",
        });
        return;
      }

      if (!currentRow?.REF_CUST_ID) {
        await MessageBox({
          messageTitle: "ValidationFailed",
          message: t("PleaseEnterRelatedPersonCustomerIDRow", {
            row: index + 1,
          }),
          icon: "ERROR",
        });
        return;
      }
    }
    gridApiRef.current?.applyTransaction?.({
      add: [{ ACTIVE: "N" }],
    });
  };

  return {
    formRef,
    MessageBox,
    setCategCD,
    categCD,
    onSave,
    authState,
    gridApiRef,
    handleAddNewRow,
  };
};

export default useControllingPerson;
