import { Dialog, DialogTitle, IconButton } from "@mui/material";
import { customMetadataSugg } from "./MetadataSuggetion/customMetadataSugg";
import CloseIcon from "@mui/icons-material/Close";
import { dateMetadataSugg } from "./MetadataSuggetion/dateMetadataSugg";
import { staticMetadataSugg } from "./MetadataSuggetion/staticMetadataSugg";

export const RptMetadataSuggestion = ({
  isSuggOpen,
  setIsSuggOpen,
  retrievalaType,
}) => {
  let metaData =
    retrievalaType === "CUSTOMIZE"
      ? customMetadataSugg
      : retrievalaType === "DATE"
      ? dateMetadataSugg
      : retrievalaType === "STATIC"
      ? staticMetadataSugg
      : "Sample Metadata not found for that Retrieval Type";

  return (
    <>
      <Dialog
        open={isSuggOpen}
        className="metadataSugg"
        PaperProps={{
          style: {
            maxWidth: "750px",
            padding: "10px",
            width: "100%",
          },
        }}
      >
        <>
          <DialogTitle sx={{ m: 0, p: 2 }}>
            {`Metadata Suggestion ( Retrieval Type = ${retrievalaType} )`}
            <IconButton
              aria-label="close"
              onClick={() =>
                setIsSuggOpen((old) => ({ ...old, isSuggOpen: false }))
              }
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <pre
            style={{
              maxHeight: "600px",
              overflow: "auto",
              padding: "10px",
              fontSize: "14px",
              backgroundColor: "#f4f4f4",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}
          >
            {JSON.stringify(metaData, null, 2)}
          </pre>
        </>
      </Dialog>
    </>
  );
};
