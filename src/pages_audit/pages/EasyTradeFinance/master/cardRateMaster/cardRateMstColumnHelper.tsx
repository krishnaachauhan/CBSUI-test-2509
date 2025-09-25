// import { BankMasterValidate, getBankChequeAlert } from "./api";
import { useState } from "react";
import * as API from "./api";
import { GeneralAPI } from "registry/fns/functions";
import { DefaultErrorObject } from "@acuteinfo/common-base";
import { B } from "ace-builds-internal/lib/bidiutil";

export const handleBlurCurrency = async (
  value,
  node,
  api,
  field,
  onValueChange,
  context,
  dependentFieldsValues,
  formState,
  auth,
  setCurrentRowIndex
) => {
  if (value) {
    return node.setData({
      ...node.data,
      STT: 0,
      STC: 0,
      BTT: 0,
      BTC: 0,
      B_CCY: 0,
      S_CCY: 0,
    });
  }
};

export const handleBlurCardCal = async (
  value,
  node,
  api,
  field,
  onValueChange,
  context,
  dependentFieldsValues,
  formState,
  auth,
  setCurrentRowIndex
) => {
  if (value) {
    let ccyRate = 0;
    api.forEachNode((item) => {
      if (
        item?.data?.CURR_CD === "USD" &&
        item?.data?.TRAN_DT === node.data.TRAN_DT
      ) {
        ccyRate = item.data.CCY_RATE;
      }
    });
    if (ccyRate !== 0) {
      try {
        const data = await API.getCardRateCalculation({
          CURR_CD: node.data.CURR_CD,
          CROSS_RATE: node.data.CROSS_RATE,
          USD_RATE: ccyRate,
        });

        return node.setData({
          ...node.data,
          STT: data?.[0].STT,
          STC: data?.[0].STC,
          BTT: data?.[0].BTT,
          BTC: data?.[0].BTC,
          B_CCY: data?.[0].BBC,
          S_CCY: data?.[0].SBC,
        });
      } catch (error) {
        console.error("Error fetching card rate calculation:", error);
        return node.setData({
          ...node.data,
          STT: 0,
          STC: 0,
          BTT: 0,
          BTC: 0,
          B_CCY: 0,
          S_CCY: 0,
        });
      }
    } else {
      return node.setData({
        ...node.data,
        STT: 0,
        STC: 0,
        BTT: 0,
        BTC: 0,
        B_CCY: 0,
        S_CCY: 0,
      });
    }
  }
};
