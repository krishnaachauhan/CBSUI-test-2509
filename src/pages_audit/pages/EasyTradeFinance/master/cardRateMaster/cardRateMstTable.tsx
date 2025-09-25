import React, { Fragment, useEffect, useState } from "react";
import { cardRateMstColumn } from "./cardRateMstColumn";
import useCardRate from "./Hooks/useCardRate";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import { RetrieveCardRateForm } from "./retrieveCardRate";
import { useMutation } from "react-query";
import { useSnackbar } from "notistack";
import * as API from "./api";
import { usePopupContext, utilFunction } from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
interface CardRateMstTableProps {
  gridApi?: any;
  defaultView?: any;
  formState?: any;
  authState?: any;
  data?: any;
  getCardRateData?: any;
  handleCustomCellKeyDown?: any;
  setCurrentRowIndex?: any;
}

const CardRateMstTable: React.FC<CardRateMstTableProps> = React.memo(
  ({
    gridApi,
    defaultView,
    formState,
    authState,
    data,
    getCardRateData,
    handleCustomCellKeyDown,
    setCurrentRowIndex,
  }) => {
    const { updatePinnedBottomRow, agGridProps } = useCardRate({
      gridApi,
      defaultView,
      formState,
      authState,
      data,
      getCardRateData,
      setCurrentRowIndex,
    });
    const [isOpenRetrieve, setIsOpenRetrieve] = useState(false);
    const { MessageBox, CloseMessageBox } = usePopupContext();
    const { t } = useTranslation();
    const handleClick = () => {
      setIsOpenRetrieve(true);
    };
    const { enqueueSnackbar } = useSnackbar();
    const cardrate = useMutation(API.cardrateConfigDML, {
      onError: (error: any) => {
        let errorMsg = "Unknown Error occured";
        if (typeof error === "object") {
          errorMsg = error?.error_msg ?? errorMsg;
        }
        enqueueSnackbar(errorMsg, {
          variant: "error",
        });
        CloseMessageBox();
      },
      onSuccess: (data) => {
        enqueueSnackbar(data, {
          variant: "success",
        });
      },
    });

    const handleSubmit = () => {
      const updatedData: any = [];
      let isValid = true;
      gridApi.current.forEachNode((node, index) => {
        if (!node?.data?.CROSS_RATE) {
          MessageBox({
            message: "Cross rate is required at row " + (index + 1),
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          isValid = false;
        }
        if (!node?.data?.STT) {
          MessageBox({
            message: "Sell TT is required at row " + (index + 1),
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          isValid = false;
        }
        if (!node?.data?.BTT) {
          MessageBox({
            message: "Buy TT is required at row " + (index + 1),
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          isValid = false;
        }
        if (!node?.data?.CCY_RATE) {
          MessageBox({
            message: "Inter Bank Rate is required at row " + (index + 1),
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          isValid = false;
        }
        if (!node?.data?.S_CCY) {
          MessageBox({
            message: "Sell BC Rate is required at row " + (index + 1),
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          isValid = false;
        }
        if (!node?.data?.B_CCY) {
          MessageBox({
            message: "Buy BC Rate is required at row " + (index + 1),
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          isValid = false;
        }
        if (!node?.data?.STC) {
          MessageBox({
            message: "Sell TC Rate is required at row " + (index + 1),
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          isValid = false;
        }
        if (!node?.data?.BTC) {
          MessageBox({
            message: "Buy TC Rate is required at row " + (index + 1),
            messageTitle: t("ValidationFailed"),
            icon: "ERROR",
          });
          isValid = false;
        }

        updatedData.push(node?.data);
      });

      if (!isValid) {
        return;
      }

      updatedData.forEach((row: any) => {
        if (row) {
          delete row.COMP_CD;
          delete row.BRANCH_CD;
          delete row?.loader;
        }
      });
      let responseDtl = utilFunction.transformDetailDataForDML(
        data,
        updatedData,
        ["CURR_CD", "TRAN_DT"]
      );
      let request = {
        DETAILS_DATA: responseDtl,
        COMP_CD: authState?.companyID ?? "",
        BRANCH_CD: authState?.user?.branchCode ?? "",
      };
      cardrate.mutate({ ...request });
    };
    return (
      <Fragment>
        <AgGridTableWrapper
          agGridProps={agGridProps}
          gridConfig={cardRateMstColumn.gridConfig}
          getGridApi={gridApi}
          autoSelectFirst={true}
          defaultView={defaultView}
          updatePinnedBottomRow={updatePinnedBottomRow}
          handleCustomCellKeyDown={handleCustomCellKeyDown}
          gridContext={{
            dateData: data,
            authState,
          }}
          isNewButtonVisible={true}
          newButtonLabel="Add Row"
          height={"calc(100vh - 200px)"}
          buttons={[
            {
              label: "Retrieve",
              onClick: () => {
                handleClick();
              },
            },
            {
              label: "Save",
              onClick: () => {
                handleSubmit();
              },
            },
          ]}
        />
        {isOpenRetrieve ? (
          <RetrieveCardRateForm
            getCardRateData={getCardRateData}
            onClose={(flag, rowsData) => {
              setIsOpenRetrieve(false);
            }}
          />
        ) : null}
      </Fragment>
    );
  }
);

export default CardRateMstTable;
