import { Dialog } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import {
  FormWrapper,
  MetaDataType,
  GradientButton,
  usePopupContext,
} from "@acuteinfo/common-base";
import { useTranslation } from "react-i18next";
import { securityDetailMetaData } from "./securityDetailFormMetaData";
import { getdocCD } from "components/utilFunction/function";
import { AuthContext } from "pages_audit/auth";
import { useLocation } from "react-router-dom";

export const SecurityDetailForm = ({
  navigate,
  myMasterRef,
  reqDataRef,
  myRef,
  setIsData,
}) => {
  const [data, setData] = useState();

  const { authState } = useContext(AuthContext);
  const docCD = getdocCD(useLocation().pathname, authState?.menulistdata);

  const { MessageBox, CloseMessageBox } = usePopupContext();
  const { t } = useTranslation();
  useEffect(() => {
    async function securityData() {
      let data1 = await myMasterRef?.current?.getFieldData();
      let data2 = await myRef?.current?.getFieldData();
      setData({ ...data1, ...data2 });
    }
    securityData();
  }, [myMasterRef?.current, myRef?.current]);

  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1150px",
        },
      }}
    >
      <>
        <FormWrapper
          key={"security-detail" + data}
          metaData={securityDetailMetaData as MetaDataType}
          initialValues={data ?? {}}
          onSubmitHandler={(data: any, displayData, endSubmit) => {
            reqDataRef.current.securityDetails = data;
            setIsData((old) => {
              let updateValue = old?.newFormMTdata?.fields?.map((item) => {
                const matchingValue = data[item.name]; // Find value in data2 with the matching name
                return {
                  ...item,
                  defaultValue:
                    matchingValue !== undefined
                      ? matchingValue
                      : item.defaultValue,
                };
              });
              return {
                ...old,
                formRefresh: Date.now(),
                newFormMTdata: { ...old?.newFormMTdata, fields: updateValue },
              };
            });

            navigate(".");
            //@ts-ignore
            endSubmit(true);
          }}
          formState={{
            MessageBox: MessageBox,
            CloseMessageBox: CloseMessageBox,
            docCD: docCD,
            reqData: data,
          }}
          formStyle={{
            background: "white",
            // height: "calc(100vh - 450px)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {({ isSubmitting, handleSubmit }) => {
            return (
              <>
                <GradientButton
                  color="primary"
                  onClick={(e) => handleSubmit(e, "Save")}
                >
                  {t("Save")}
                </GradientButton>
                <GradientButton color="primary" onClick={() => navigate(".")}>
                  {t("close")}
                </GradientButton>
              </>
            );
          }}
        </FormWrapper>
      </>
    </Dialog>
  );
};
