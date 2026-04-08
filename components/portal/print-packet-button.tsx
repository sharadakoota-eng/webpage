"use client";

type PrintPacketButtonProps = {
  className?: string;
};

export function PrintPacketButton({ className }: PrintPacketButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
    >
      Download / Print packet
    </button>
  );
}
