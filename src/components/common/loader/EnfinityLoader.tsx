import React, { useEffect } from "react";

const EnfinityLoader = ({ loading = false, overlay = false }) => {
  useEffect(() => {
    if (loading) {
      // Prevent scrolling
      document.body.style.overflow = "hidden";

      // Capture and prevent all keyboard events
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent tab navigation and enter key
        if (
          e.key === "Tab" ||
          e.key === "Enter" ||
          e.key === " " ||
          e.key === "Escape"
        ) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      // Add event listener with capture: true to intercept events before they reach other elements
      document.addEventListener("keydown", handleKeyDown, { capture: true });
      document.addEventListener("keyup", handleKeyDown, { capture: true });
      document.addEventListener("keypress", handleKeyDown, { capture: true });

      // Cleanup function
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyDown, {
          capture: true,
        });
        document.removeEventListener("keyup", handleKeyDown, { capture: true });
        document.removeEventListener("keypress", handleKeyDown, {
          capture: true,
        });
      };
    }
  }, [loading]);

  return loading ? (
    <div
      className={`sparrow-loader ${overlay ? "bg-white" : ""}`}
      tabIndex={-1}
      onKeyDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onKeyPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="gooey">
        <span className="dot" />
        <div className="dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default EnfinityLoader;
