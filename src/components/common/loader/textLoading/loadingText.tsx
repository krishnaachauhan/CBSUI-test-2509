import { CSSProperties } from "@mui/styles";
import "./style.css";
const style = ({ i }): CSSProperties => ({
  "--i": i,
});
export const LoadingTextAnimation = ({ text = "Loading" }) => {
  const LoadingText = Boolean(text) ? text : "Loading";
  return (
    <div className="waviy-loading-text">
      {[...LoadingText].map((item, index) => {
        return (
          <span style={style({ i: index + 1 })} key={"span" + index}>
            {item}
          </span>
        );
      })}
    </div>
  );
};
