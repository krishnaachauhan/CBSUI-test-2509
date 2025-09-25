import { Dialog } from "@mui/material";
import {
  Alert,
  FormWrapper,
  MetaDataType,
  LoaderPaperComponent,
  GradientButton,
} from "@acuteinfo/common-base";
import { t } from "i18next";
import { categoryFormMetaData } from "./updateCategFormMetadata";
import { CategoryGridMetaData } from "./updateCategGridMetaData";
import useCategoryUpdate from "./useCategoryUpdate";
import AgGridTableWrapper from "components/AgGridTableWrapper";
import AcctMSTProvider from "pages_audit/pages/operations/acct-mst/AcctMSTContext";
import AcctModal from "pages_audit/pages/operations/acct-mst/AcctModal";

const CategoryUpdate = ({ open, setChangeCategDialog, isModal }) => {
  const {
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
  } = useCategoryUpdate({ setChangeCategDialog, isModal });

  return (
    <>
      <Dialog
        open={open}
        maxWidth="lg"
        PaperProps={{
          style: {
            minWidth: "70%",
            width: "65%",
          },
        }}
      >
        <>
          {isCategDTLError && (
            <Alert
              severity={CategDTLError?.severity ?? "error"}
              errorMsg={CategDTLError?.error_msg ?? "Something went to wrong.."}
              errorDetail={CategDTLError?.error_detail}
              color="error"
            />
          )}
          <FormWrapper
            ref={formRef}
            key={"pod-form-kyc" + initialVal}
            metaData={categoryFormMetaData as MetaDataType}
            initialValues={initialVal}
            hideTitleBar={false}
            hideHeader={false}
            displayMode={state?.formmodectx}
            formStyle={{}}
            onSubmitHandler={onSubmitHandler}
            formState={{
              ENTITY_TYPE: state?.entityTypectx,
              setCategCD: setCategCD,
              MessageBox: MessageBox,
              CUSTOMER_ID: state?.customerIDctx,
              state,
            }}
          >
            {({ isSubmitting, handleSubmit }) => (
              <>
                <GradientButton
                  onClick={(event) => {
                    handleSubmit(event, "Save");
                  }}
                  disabled={isSubmitting}
                  color={"primary"}
                >
                  {t("Save")}
                </GradientButton>
                <GradientButton
                  onClick={() => {
                    setChangeCategDialog(false);
                  }}
                  color={"primary"}
                >
                  {t("Close")}
                </GradientButton>
              </>
            )}
          </FormWrapper>
          <AgGridTableWrapper
            agGridProps={agGridProps}
            gridConfig={CategoryGridMetaData.GridMetaDataType}
            getGridApi={gridApiRef}
            hideHeader={true}
            gridContext={{
              CUSTOMER_ID: state?.customerIDctx,
              authState,
              formRef,
              ENTITY_TYPE: state?.entityTypectx,
              categCD,
            }}
            loading={isCategDTLLoading}
            handleCustomCellKeyDown={() => true}
          />
        </>
      </Dialog>
      {openAcctMSt?.isAcctMstOpen ? (
        <Dialog
          open={openAcctMSt?.isAcctMstOpen}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              setOpenAcctMst((prevState) => {
                if (prevState.isAcctMstOpen)
                  return { ...prevState, isAcctMstOpen: false };

                return prevState;
              });
            }
          }}
        >
          <AcctMSTProvider>
            <AcctModal
              onClose={() => {
                setOpenAcctMst((prevState) => {
                  if (prevState.isAcctMstOpen)
                    return { ...prevState, isAcctMstOpen: false };

                  return prevState;
                });
              }}
              asDialog={false}
              rowData={openAcctMSt?.acctData}
              formmodeState="view"
              fromState="pending-entry"
            />
          </AcctMSTProvider>
        </Dialog>
      ) : null}
    </>
  );
};

export default CategoryUpdate;
