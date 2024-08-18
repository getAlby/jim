import React from "react";
import QRCode from "react-qr-code";

export function ScanQR({ connectionSecret }: { connectionSecret: string }) {
  const [showQR, setShowQR] = React.useState(false);
  return (
    <>
      <button
        className="w-80 btn btn-lg btn-primary"
        onClick={() => setShowQR((current) => !current)}
      >
        {showQR ? "Hide QR" : "Scan QR"}
      </button>
      {showQR && (
        <div className="w-full flex justify-center items-center p-8">
          <QRCode size={256} value={connectionSecret} viewBox={`0 0 256 256`} />
        </div>
      )}
    </>
  );
}
