import { Alert, PDFViewer } from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";
import EnfinityLoader from "components/common/loader/EnfinityLoader";

const PrintDialog = ({
  openPdfViewer,
  printLoader,
  printBlob,
  setOpenPdfViewer,
  setPrintBlob,
  printIsError,
  printError,
}) => {
  return (
    <>
      {" "}
      <Dialog
        open={openPdfViewer}
        PaperProps={{
          style: {
            width: "95%",
            overflow: "auto",
            height: "80%",
          },
        }}
        maxWidth="lg"
        className="imgDlg"
      >
        <EnfinityLoader loading={printLoader} overlay={true} />
        {printIsError && (
          <>
            <Alert
              severity={printError?.severity ?? "error"}
              errorMsg={printError?.error_msg ?? "Something went to wrong.."}
              errorDetail={printError?.error_detail}
              color="error"
            />
          </>
        )}
        <PDFViewer
          blob={printBlob}
          fileName={printBlob?.name}
          onClose={() => {
            setOpenPdfViewer(false);
            setPrintBlob(null);
          }}
          hideFilename={true}
        />
      </Dialog>
    </>
  );
};

export default PrintDialog;
