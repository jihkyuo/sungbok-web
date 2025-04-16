interface Props {
  opacity?: number;
}

export const DarkOverlay = ({ opacity = 30 }: Props) => {
  return <div style={{ opacity: opacity / 100 }} className={`opa absolute inset-0 bg-black`} />;
};
