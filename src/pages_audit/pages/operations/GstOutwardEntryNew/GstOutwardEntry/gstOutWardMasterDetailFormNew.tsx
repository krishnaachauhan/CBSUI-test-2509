import { AppBar, Box, Dialog } from "@mui/material";
import { Fragment } from "react";

import { Alert, FormWrapper, MetaDataType } from "@acuteinfo/common-base";

import GstOutWardTableDetails from "./gstOutWardTableDetails";
import useGstOutward from "../Hooks/useGstOutward";
import GstOutwardButtons from "./GstOutwardButtons";

export const GstOutwardMasterDetailFormNew = ({
  ClosedEventCall,
  defaultView,
  screenFlag,
  refetchData,
}) => {
  const {
    myRef,
    gridApi,
    authState,
    MessageBox,
    dilogueOpen,
    setDilogueOpen,
    disableButton,
    saveButton,
    setSaveButton,
    setPreviousValue,
    docCD,
    handleButtonDisable,
    closeDialog,
    metaData,
    isError,
    error,
    viewVoucherMutate,
    onSubmitHandler,
    handleRemove,
    viewVoucher,
    Accept,
    rows,
    isLoading,
    data,
    dateData,
  } = useGstOutward({
    ClosedEventCall,
    defaultView,
    screenFlag,
    refetchData,
  });
  return (
    <Fragment>
      <Dialog
        open={true}
        fullWidth={true}
        PaperProps={{
          style: {
            height: "auto",
          },
        }}
        maxWidth="xl"
      >
        {isError && (
          <>
            <Box style={{ paddingRight: "10px", paddingLeft: "10px" }}>
              <AppBar position="relative" color="primary">
                <Alert
                  severity="error"
                  errorMsg={error?.error_msg ?? "Something went to wrong.."}
                  errorDetail={error?.error_detail}
                  color="error"
                />
              </AppBar>
            </Box>
          </>
        )}
        <FormWrapper
          key={"formGstOutwardEnterTemplate-" + defaultView}
          metaData={metaData as MetaDataType}
          ref={myRef}
          displayMode={defaultView}
          setDataOnFieldChange={(action, payload) => {
            if (action === "TemplateOpen") {
              setDilogueOpen(payload?.OPEN === "SHOW" ? true : false);
            }
            if (action === "GET_DATA") {
              setPreviousValue(payload?.MODE_VALUE);
            }
          }}
          formState={{
            docCD: docCD,
            MessageBox: MessageBox,
            defaultView: defaultView,
            handleButtonDisable: handleButtonDisable,
            setDilogueOpen,
            gridApi,
            acctDtlReqPara: {
              ACCT_CD: {
                ACCT_TYPE: "ACCT_TYPE",
                BRANCH_CD: "BRANCH_CD",
                SCREEN_REF: "ACCTINQ",
              },
            },
          }}
          onSubmitHandler={onSubmitHandler}
          containerstyle={{
            padding: "10px",
          }}
          formStyle={{
            background: "white",
          }}
          initialValues={{
            ...rows?.[0]?.data,
            MODE: rows?.[0]?.data?.MODE_OF_PAYMENT,
          }}
        >
          {({ isSubmitting, handleSubmit }) => (
            <GstOutwardButtons
              defaultView={defaultView}
              handleSubmit={handleSubmit}
              closeDialog={closeDialog}
              handleRemove={handleRemove}
              Accept={Accept}
              viewVoucher={viewVoucher}
              isSubmitting={isSubmitting}
              disableButton={disableButton}
              saveButton={saveButton}
              authState={authState}
              rows={rows}
              viewVoucherMutate={viewVoucherMutate}
            />
          )}
        </FormWrapper>

        <GstOutWardTableDetails
          authState={authState}
          myRef={myRef}
          dilogueOpen={dilogueOpen}
          gridApi={gridApi}
          defaultView={defaultView}
          setSaveButton={setSaveButton}
          isLoading={isLoading}
          data={data}
          dateData={dateData}
        />
      </Dialog>
    </Fragment>
  );
};
