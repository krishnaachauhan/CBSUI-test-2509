import { GradientButton } from "@acuteinfo/common-base";

const HeaderButtonGroup = ({ buttons }: { buttons: any[] }) => {
  if (!buttons || buttons.length === 0) return null;

  return (
    <>
      {buttons.map((btn, index) => (
        <GradientButton
          key={index}
          onClick={btn.onClick}
          disabled={btn.disabled}
          {...btn}
        >
          {btn.label}
        </GradientButton>
      ))}
    </>
  );
};

export default HeaderButtonGroup;
