import { useTranslation } from "react-i18next";
import "./style.css";
export const FullScreenLoader = () => {
  const { t } = useTranslation();

  return (
    // <div className="wrap-forloader">
    //   <div className="loading">
    //     <div className="bounceball"></div>
    //     <div className="text-forloader"> Loading...</div>
    //   </div>
    // </div>
    <>
      <div className="maindiv">
        <div className="loading-container">
          <div className="wave-container">
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
          </div>
          <div className="loading-text">
            <span>E</span>
            <span>n</span>
            <span>f</span>
            <span>i</span>
            <span>n</span>
            <span>i</span>
            <span>t</span>
            <span>y</span>
            <span>C</span>
            <span>o</span>
            <span>r</span>
            <span>e</span>
          </div>
        </div>
      </div>
    </>
  );
};
