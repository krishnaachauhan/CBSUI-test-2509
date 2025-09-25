import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CashierExchangeTable from "../cashierExchangeEntry/tableComponent/tableComponent";
import { Alert, usePopupContext } from "@acuteinfo/common-base";
import CloseIcon from "@mui/icons-material/Close";
import { DenominationTableMetaData } from "./DenominationTableMetaData";

import EnfinityLoader from "components/common/loader/EnfinityLoader";
import { Box } from "@mui/system";
import { t } from "i18next";

const DenominationTableDialog: any = ({
  open,
  TableRef,
  authState,
  docCD,
  handleClose,
  tableData,
  remainingAmt,
  denoLoader,
  currentRowData,
  denoIsError,
  denoError,
  denoDisplayMode,
  handleSave,
  title,
  metaData,
}) => {
  const { MessageBox } = usePopupContext();

  return (
    <>
      {" "}
      <Dialog
        open={open}
        maxWidth="xl"
        PaperProps={{
          style: {
            width: "100%",
            height: "70%",
          },
        }}
      >
        <DialogTitle>{t(title)}</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent>
          <Box>
            <EnfinityLoader loading={denoLoader} />

            {denoIsError && (
              <Alert
                severity={denoError?.severity ?? "error"}
                errorMsg={denoError?.error_msg ?? "Something went wrong.."}
                errorDetail={denoError?.error_detail}
                color="error"
              />
            )}

            {!denoLoader && tableData?.length > 0 ? (
              <CashierExchangeTable
                key={JSON.stringify(tableData)}
                data={tableData ?? []}
                metadata={metaData}
                TableLabel={"Cash Remittance Payment"}
                hideHeader={true}
                ignoreMinusValue={false}
                showFooter={true}
                ref={TableRef}
                displayMode={denoDisplayMode}
                addExtraValue={remainingAmt}
                tableState={{
                  MessageBox,
                  authState,
                  docCD,
                  currentRowData,
                  handleClose,
                  handleSave,
                }}
              />
            ) : (
              !denoLoader && (
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    textAlign: "center",
                    fontStyle: "italic",
                    fontWeight: "bold",
                    color: "rgba(133, 130, 130, 0.8)",
                    minHeight: "500px",
                  }}
                >
                  {t("NoDataFound")}
                </Box>
              )
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DenominationTableDialog;
