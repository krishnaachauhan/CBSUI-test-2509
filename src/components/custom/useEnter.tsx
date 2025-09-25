import { useEffect } from "react";

export const useEnter = (className: string = "") => {
  // If className is empty, get it from localStorage
  const cname = className ? `.${className}` : "";

  useEffect(() => {
    console.log(cname, "class name<<");

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the pressed key is 'Enter'
      if (event.key === "Enter") {
        // Prevent the default action (like form submission)
        event.preventDefault();

        // Get all focusable elements
        const focusableElements = Array.from(
          document.querySelectorAll(
            `${cname} button:not([tabindex="-1"]), 
            ${cname} [href]:not(base), 
            ${cname} input, 
            ${cname} select, 
            ${cname} MuiTab-root, 
            ${cname} MuiTab-textColorPrimary, 
            ${cname} textarea, 
            ${cname} [tabindex]:not([tabindex="-1"])`
          )
        ).filter(
          (el) =>
            !el.hasAttribute("disabled") &&
            !el.hasAttribute("readonly") &&
            !el.getAttribute("aria-hidden") &&
            el.tagName !== "SVG" &&
            el.tagName !== "LINK" &&
            !el.classList.contains("MuiTableSortLabel-root") &&
            !el.classList.contains("MuiSelect-select") &&
            !el.getAttribute("data-testid")?.includes("sentinel")
        ) as HTMLElement[];

        // console.log(focusableElements, "<<elemnts");

        // If there are no focusable elements, do nothing
        if (focusableElements.length === 0) return;

        // Get the currently focused element
        const currentElement = document.activeElement as HTMLElement;

        // Find the index of the currently focused element
        const currentIndex = focusableElements.indexOf(currentElement);

        let nextIndex;

        if (event.shiftKey) {
          // Shift + Enter: Move to the previous element (reverse loop)
          if (currentIndex === -1) {
            // If no element is focused, start from the last element
            nextIndex = focusableElements.length - 1;
          } else {
            nextIndex =
              currentIndex > 0
                ? currentIndex - 1
                : focusableElements.length - 1;
          }
        } else {
          // Enter: Move to the next element (forward loop)
          if (currentIndex === -1) {
            // If no element is focused, start from the first element
            nextIndex = 0;
          } else {
            nextIndex =
              currentIndex < focusableElements.length - 1
                ? currentIndex + 1
                : 0;
          }
        }
        console.log(focusableElements[nextIndex], "last field");

        // Focus the next element
        focusableElements[nextIndex].focus();
      }
    };

    // Add the event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cname]); // Updated to listen for changes to cname
};
