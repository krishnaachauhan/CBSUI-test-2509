import { LoaderPaperComponent } from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import PhotoSignWithHistory from "components/common/custom/photoSignWithHistory/photoSignWithHistory";
import SearchAcctGridMain from "components/common/custom/searchAccountMaster";
import AcctModal from "pages_audit/pages/operations/acct-mst/AcctModal";
import AcctMSTProvider from "pages_audit/pages/operations/acct-mst/AcctMSTContext";
import { PaperComponent } from "pages_audit/pages/operations/DailyTransaction/TRN001/components";
import DailyTransTabs from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs";
import JointDetails from "pages_audit/pages/operations/DailyTransaction/TRNHeaderTabs/JointDetails";

const ShortCutKeys = ({
  dialogState,
  handleDialogClose,
  acctData,
  getTabDetails,
  getAccountDetails,
  headingWithButton,
}) => {
  return (
    <>
      {dialogState?.isAcctMstOpen ? (
        <Dialog
          open={dialogState?.isAcctMstOpen}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              handleDialogClose();
            }
          }}
        >
          <AcctMSTProvider>
            <AcctModal
              onClose={handleDialogClose}
              asDialog={false}
              rowData={dialogState?.acctData}
              formmodeState="view"
              fromState="pending-entry"
            />
          </AcctMSTProvider>
        </Dialog>
      ) : null}
      {dialogState?.isPhotoSignOpen ? (
        <PhotoSignWithHistory
          data={acctData}
          onClose={handleDialogClose}
          screenRef={acctData?.SCREEN_REF}
        />
      ) : null}
      {dialogState?.isAcctDtlOpen ? (
        <Dialog
          className="AcctTab"
          open={dialogState?.isAcctDtlOpen}
          PaperComponent={PaperComponent}
          id="draggable-dialog-title"
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              handleDialogClose();
              localStorage.removeItem("commonClass");
            }
          }}
        >
          <div id="draggable-dialog-title" style={{ cursor: "move" }}>
            {getTabDetails?.isLoading || getAccountDetails?.isLoading ? (
              <LoaderPaperComponent />
            ) : (
              <DailyTransTabs
                //@ts-ignore
                heading={headingWithButton}
                tabsData={getTabDetails?.data}
                cardsData={getAccountDetails.data}
                reqData={acctData}
                hideCust360Btn={false}
              />
            )}
          </div>
        </Dialog>
      ) : null}
      {dialogState?.isSearchAcctOpen ? (
        <SearchAcctGridMain
          open={dialogState?.isSearchAcctOpen}
          close={handleDialogClose}
          reqPara={acctData}
        />
      ) : null}
      {dialogState?.isJointDtlOpen ? (
        <Dialog
          open={dialogState?.isJointDtlOpen}
          PaperComponent={PaperComponent}
          id="draggable-dialog-title"
          PaperProps={{
            style: {
              width: "100%",
            },
          }}
          maxWidth="xl"
          onKeyUp={(event) => {
            if (event.key === "Escape") {
              handleDialogClose();
            }
          }}
        >
          <div id="draggable-dialog-title" style={{ cursor: "move" }}></div>
          <JointDetails
            hideHeader={false}
            reqData={{
              ...acctData,
              BTN_FLAG: "Y",
              custHeader: true,
            }}
            height={"350px"}
            closeDialog={handleDialogClose}
          />
        </Dialog>
      ) : null}
    </>
  );
};

export default ShortCutKeys;
