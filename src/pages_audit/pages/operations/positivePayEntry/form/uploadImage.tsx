import { FileUploadControl } from "@acuteinfo/common-base";
import { Dialog } from "@mui/material";

export default function UploadImageDialogue({ onClose, onUpload }) {
  return (
    <div>
      <Dialog fullWidth maxWidth="md" open={true} className="uploadImgDlg">
        <FileUploadControl
          key={"positivePayEntryImage"}
          onClose={() => {
            onClose();
          }}
          editableFileName={false}
          defaultFileData={[]}
          onUpload={async (
            formDataObj,
            proccessFunc,
            ResultFunc,
            base64Object,
            result
          ) => {
            onUpload(base64Object);
            onClose();
          }}
          gridProps={{}}
          allowedExtensions={[
            "png",
            "PNG",
            "jpeg",
            "JPEG",
            "jpg",
            "JPG",
            "tiff",
            "TIFF",
            "gif",
            "GIF",
            "bmp",
            "BMP",
            "pdf",
            "PDF",
          ]}
          onUpdateFileData={(files) => {}}
        />
      </Dialog>
    </div>
  );
}
