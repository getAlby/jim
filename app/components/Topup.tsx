"use client";
import { nwc } from "@getalby/sdk";
import React, { useRef } from "react";

import dynamic from "next/dynamic";
const Payment = dynamic(
  () => import("@getalby/bitcoin-connect-react").then((mod) => mod.Payment),
  {
    ssr: false,
  }
);

export function Topup({ connectionSecret }: { connectionSecret: string }) {
  const [invoice, setInvoice] = React.useState<string>();
  const [preimage, setPreimage] = React.useState<string>();
  const [amount, setAmount] = React.useState<number>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    (async () => {
      if (!amount) {
        return;
      }
      const client = new nwc.NWCClient({
        nostrWalletConnectUrl: connectionSecret,
      });
      const transaction = await client.makeInvoice({
        amount: amount * 1000,
        description: "topup on Alby Jim",
      });
      setInvoice(transaction.invoice);

      const unsub = await client.subscribeNotifications(
        (notification) => {
          if (
            notification.notification_type === "payment_received" &&
            notification.notification.invoice === transaction.invoice
          ) {
            setPreimage(notification.notification.preimage);
            setTimeout(() => {
              dialogRef.current?.close();
            }, 3000);
          }
        },
        ["payment_received"]
      );
      return () => {
        unsub();
      };
    })();
  }, [connectionSecret, amount]);

  return (
    <>
      <button
        className="w-80 btn btn-lg btn-primary"
        onClick={async () => {
          if (!amount) {
            const newAmount = prompt("Enter an amount in sats", "1000");
            if (!newAmount) {
              return;
            }
            setAmount(+newAmount);
          }
          dialogRef.current?.showModal();
        }}
      >
        Top up
      </button>

      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Topup</h3>
          {!invoice && (
            <div className="w-full flex items-center justify-center my-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
          {invoice && (
            <Payment
              invoice={invoice}
              paymentMethods="external"
              payment={preimage ? { preimage } : undefined}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
