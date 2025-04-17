interface Props {
  opacity?: number;
}

export const DarkOverlay = ({ opacity = 30 }: Props) => {
  return <div style={{ opacity: opacity / 100 }} className={`absolute inset-0 bg-black`} />;
};
