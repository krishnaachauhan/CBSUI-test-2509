import React, {
  forwardRef,
  Suspense,
  useContext,
  useImperativeHandle,
  useMemo,
} from "react";
import useControllingPerson from "./useControllingPerson";
import { controllingPersonAgGridMetadata } from "./ControlingPersionAgGridMetadata";
import { usePopupContext } from "@acuteinfo/common-base";
import { CkycContext } from "pages_audit/pages/operations/c-kyc/CkycContext";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import { t } from "i18next";
import { Dialog } from "@mui/material";
import { ClonedCkycContext } from "./ClonedCkycContext";

// Props and Ref types
interface ControllingPersonDTAgGridProps {
  data: {
    RELATED_PERSON_DTL?: any[];
  };
  isModal?: any;
}

export interface ControllingPersonDTAgGridRef {
  handleSubmit: () => void;
}

interface CkycData {
  CUSTOMER_ID?: string;
  [key: string]: any;
}

const ControllingPersonDTAgGrid = forwardRef<
  ControllingPersonDTAgGridRef,
  ControllingPersonDTAgGridProps
>(({ data, isModal }, ref) => {
  const { MessageBox } = usePopupContext();
  const { state, handleButtonDisable } = useContext(
    isModal ? ClonedCkycContext : CkycContext
  );
  const {
    onSave,
    authState,
    gridApiRef,
    handleAddNewRow,
  }: {
    onSave: any;
    authState: any;
    gridApiRef: any;
    handleAddNewRow: any;
  } = useControllingPerson();

  const updatedData = useMemo(() => {
    const source: any = data ?? [];

    return source.map((item) => {
      let activeValue = false;

      if (item?.ACTIVE === "Y") {
        activeValue = true;
      } else if (item?.ACTIVE === "N") {
        activeValue = false;
      } else {
        activeValue = item.ACTIVE;
      }

      return {
        ...item,
        ACTIVE: activeValue,
        REMARKS: activeValue === true ? "Active" : "Inactive",
      };
    });
  }, [data]);

  useImperativeHandle(ref, () => ({
    handleSubmit: () => {
      return onSave();
    },
  }));

  controllingPersonAgGridMetadata.GridMetaDataType.gridLabel = state
    ?.tabsApiResctx[state?.colTabValuectx]?.TAB_DISPL_NAME
    ? state?.tabsApiResctx[state?.colTabValuectx]?.TAB_DISPL_NAME
    : t("DetailsOfControllingPersons");
  const agGridProps = {
    id: "transactionGrid",
    columnDefs: controllingPersonAgGridMetadata.columns({
      authState,
      formState: {
        workingDate: authState?.workingDate ?? "",
        state,
        handleButtonDisable,
        BIRTH_DT: {
          ...state?.retrieveFormDataApiRes?.PERSONAL_DETAIL,
          ...state?.updatedReq?.PERSONAL_DETAIL_PD,
        }?.BIRTH_DT,
      },
      isModal,
    }),
    rowData: updatedData,
  };

  return (
    <>
      <AgGridTableWrapper
        agGridProps={agGridProps}
        gridConfig={controllingPersonAgGridMetadata.GridMetaDataType}
        getGridApi={gridApiRef}
        gridContext={{ mode: state?.formmodectx, authState }}
        hideHeader={false}
        height={"calc(100vh - 500px)"}
        newButtonLabel="Add Row"
        handleAddNewRow={handleAddNewRow}
        isNewButtonVisible={state?.formmodectx !== "view"}
        handleCustomCellKeyDown={() => true}
      />
    </>
  );
});

export default ControllingPersonDTAgGrid;
