import {
  FormWrapper,
  GradientButton,
  MetaDataType,
  usePopupContext,
} from "@acuteinfo/common-base";
import React from "react";
import { impsRegDetails } from "./impsDetailFormMetadata";
import { Dialog } from "@mui/material";
import { t } from "i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { DayLimit } from "./dayLimit/dayLimit";

export const ImpsDetailForm = ({ navigate, formMode, formRef }) => {
  const { state: rows }: any = useLocation();
  const navigateDayLimit = useNavigate();
  const { MessageBox, CloseMessageBox } = usePopupContext();
  return (
    <Dialog
      open={true}
      fullWidth={true}
      PaperProps={{
        style: {
          maxWidth: "1400px",
          padding: "5px",
        },
      }}
    >
      <FormWrapper
        key={"impsReg-details"}
        metaData={impsRegDetails as MetaDataType}
        initialValues={rows?.[0]?.data ?? {}}
        formState={{
          MessageBox: MessageBox,
        }}
        onSubmitHandler={(data: any, displayData, endSubmit) => {
          formRef.current?.setGridData((old) => {
            const updated = old.map((item) => {
              if (item.FULL_ACCT_NO_NM === rows?.[0]?.data?.FULL_ACCT_NO_NM) {
                return {
                  ...item,
                  ...data,
                  ...(formMode === "edit" && item?.RETRIEVE_DATA
                    ? { _isTouchedCol: { ...item, ...data } }
                    : { _isNewRow: true }),
                }; // Update the matching item
              }
              return item; // Return the unchanged item
            });
            console.log("Updated data:", updated);
            return updated; // Return the updated array
          });

          navigate(".");
          // @ts-ignore
          endSubmit(true);
        }}
        formStyle={{ minHeight: "30vh" }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <>
            {formMode === "edit" && (
              <GradientButton
                onClick={() => {
                  navigateDayLimit("daylimit-form", { state: rows?.[0]?.data });
                }}
                color={"primary"}
              >
                {t("day limit")}
              </GradientButton>
            )}
            <GradientButton
              color={"primary"}
              onClick={(event) => handleSubmit(event, "BUTTON_CLICK")}
              disabled={isSubmitting}
            >
              {t("Update")}
            </GradientButton>
            <GradientButton onClick={() => navigate(".")} color={"primary"}>
              {t("Close")}
            </GradientButton>
          </>
        )}
      </FormWrapper>

      <Routes>
        <Route
          path="daylimit-form/*"
          element={<DayLimit navigate={navigateDayLimit} />}
        />
      </Routes>
    </Dialog>
  );
};
