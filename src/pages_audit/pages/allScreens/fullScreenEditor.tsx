import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-github";
import { t } from "i18next";

const FullScreenEditor = ({
  refdata,
  expandEditor,
  setMyData,
  mode,
  title,
  upDateData,
}) => {
  return (
    <div>
      <Dialog fullScreen open={expandEditor}>
        <AppBar
          sx={{
            position: "relative",
            background: "var(--theme-color5)",
            color: "var(--theme-color2)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{ ml: 2, flex: 1, alignContent: "center" }}
              variant="h6"
              component="div"
            >
              {title}
            </Typography>
            <Tooltip title={t("Minimize")}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() =>
                  setMyData((old) => ({ ...old, expandEditor: false }))
                }
                aria-label="close"
              >
                <ZoomInMapIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </AppBar>

        <Box
          sx={{
            padding: "10px",
            height: "100%",
          }}
        >
          <AceEditor
            style={{
              height: "100%",
              width: "100%",
              opacity: 1,
              border: "1px solid #a39494",
            }}
            name={mode}
            theme={"github"}
            onChange={(value) => {
              refdata = value;
              upDateData(value);
            }}
            mode={mode}
            fontSize={14}
            value={refdata}
            showPrintMargin={false}
            showGutter={false}
            highlightActiveLine={true}
            setOptions={{
              useWorker: false,
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: false,
              tabSize: 2,
            }}
          />
        </Box>
      </Dialog>
    </div>
  );
};

export default FullScreenEditor;
