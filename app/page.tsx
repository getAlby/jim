/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { createWallet, hasPassword, Wallet } from "./actions";
import { AlbyExtension } from "./components/AlbyExtension";
import { Topup } from "./components/Topup";
import { nwc } from "@getalby/sdk";
import Link from "next/link";
import { ScanQR } from "./components/ScanQR";

export default function Home() {
  const [wallet, setWallet] = React.useState<Wallet>();
  const [loadedSavedWallet, setLoadedSavedWallet] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState<"nwcUrl" | "lightningAddress">();
  const [balance, setBalance] = React.useState(0);
  React.useEffect(() => {
    const savedWalletJSON = window.localStorage.getItem("wallet");
    if (savedWalletJSON) {
      const _wallet = JSON.parse(savedWalletJSON);
      setWallet(_wallet);
      setLoadedSavedWallet(true);
      (async () => {
        const client = new nwc.NWCClient({
          nostrWalletConnectUrl: _wallet.connectionSecret,
        });
        const _balance = await client.getBalance();
        setBalance(_balance.balance);
      })();
    }
  }, []);
  async function onSubmit() {
    setLoading(true);
    try {
      let password: string | undefined = undefined;
      if (await hasPassword()) {
        password = prompt("Please enter the password") || undefined;
      }
      const { wallet, error } = await createWallet(undefined, password);
      if (error) {
        throw new Error(error);
      }
      setWallet(wallet);
      if (wallet) {
        window.localStorage.setItem("wallet", JSON.stringify(wallet));
      }
    } catch (error) {
      console.error("failed to create wallet", { error });
      alert("Something went wrong: " + error);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    (async () => {
      setBalance(0);
      if (!wallet) {
        return;
      }
      const client = new nwc.NWCClient({
        nostrWalletConnectUrl: wallet.connectionSecret,
      });

      const unsub = await client.subscribeNotifications(
        (notification) => {
          if (notification.notification_type === "payment_received") {
            setBalance((current) => current + notification.notification.amount);
          }
        },
        ["payment_received"]
      );
      return () => {
        unsub();
      };
    })();
  }, [wallet]);

  return (
    <>
      <img src="/uncle-jim.png" className="w-16 h-16 rounded-lg" alt="" />
      <p className="font-semibold mt-4">Uncle Jim</p>
      <div className="flex flex-col gap-4 max-w-lg border-2 rounded-xl p-4 items-center justify-center mt-4 mb-16">
        {!wallet && (
          <p>
            Instantly create a new wallet that you can use in any{" "}
            <a href="https://nwc.dev" target="_blank" className="font-semibold">
              NWC-powered
            </a>{" "}
            app: Damus, Amethyst, Alby Extension, Alby Account, Nostrudel,{" "}
            <a
              href="https://github.com/getAlby/awesome-nwc"
              target="_blank"
              className="link"
            >
              and many more
            </a>
          </p>
        )}

        {!wallet && (
          <>
            <button
              onClick={onSubmit}
              disabled={loading}
              className={`btn btn-primary ${loading && "btn-disabled"}`}
            >
              Create Wallet
            </button>
          </>
        )}
        {wallet && (
          <>
            <p>
              {loadedSavedWallet ? (
                <>
                  Welcome back,{" "}
                  <span className="font-semibold">
                    {wallet.lightningAddress}
                  </span>
                </>
              ) : (
                "New Wallet Created!"
              )}
            </p>
            {loadedSavedWallet && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you wish to log out? if you haven't saved your connection secret, any funds in this wallet will be lost."
                    )
                  ) {
                    window.localStorage.removeItem("wallet");
                    window.location.reload();
                  }
                }}
              >
                Log out
              </button>
            )}
            <p className="text-xs max-w-xs text-center">
              {"Make sure to copy it and save it somewhere safe."}
            </p>
            <div className="flex w-full gap-2 flex-wrap items-center justify-center">
              <button
                className={`w-80 btn btn-lg btn-primary ${
                  copied === "nwcUrl" && "btn-success"
                }`}
                onClick={async () => {
                  await navigator.clipboard.writeText(wallet.connectionSecret);
                  setCopied("nwcUrl");
                  setTimeout(() => {
                    setCopied(undefined);
                  }, 3000);
                }}
              >
                {copied === "nwcUrl" ? "Copied!" : "Copy"}
              </button>
              <a
                href={wallet.connectionSecret}
                className="w-80 btn btn-lg btn-primary"
              >
                Open in Damus/Amethyst
              </a>

              <AlbyExtension connectionSecret={wallet.connectionSecret} />
              <a
                href={`https://getalby.com/nwc/new#${wallet.connectionSecret}`}
                className="w-80 btn btn-lg btn-primary"
                target="_blank"
              >
                Connect to Alby Account
              </a>
              <ScanQR connectionSecret={wallet.connectionSecret} />
            </div>

            <p className="text-sm mt-4">
              Current balance: {Math.floor(balance / 1000)} sats
            </p>
            <Topup connectionSecret={wallet.connectionSecret} />

            <p className="mt-8 text-sm">Your lightning address is:</p>
            <p>
              <span className="font-mono font-semibold">
                {wallet.lightningAddress}
              </span>{" "}
              <button
                className={`btn btn-sm btn-primary ${
                  copied === "lightningAddress" && "btn-success"
                }`}
                onClick={async () => {
                  await navigator.clipboard.writeText(wallet.lightningAddress);
                  setCopied("lightningAddress");
                  setTimeout(() => {
                    setCopied(undefined);
                  }, 3000);
                }}
              >
                {copied === "lightningAddress" ? "Copied!" : "Copy"}
              </button>
            </p>
            <p className="text-xs max-w-xs text-center">
              {
                "It's like your email address, but people send you payments instead. You can share this publicly."
              }
            </p>

            <p className="mt-8 text-sm">Your podcasting 2.0 value tag is:</p>
            <p className="max-w-sm bg-base-200 p-4 rounded-lg break-words">
              <span className="font-mono font-semibold">{wallet.valueTag}</span>
            </p>
            <p className="text-xs max-w-xs text-center">
              {"Add this to your podcast RSS feed to activate podcasting 2.0!"}
            </p>
          </>
        )}
      </div>
      <p className="text-xs flex justify-center items-center gap-1 text-neutral-500">
        Powered by{" "}
        <a
          href="https://nwc.dev"
          target="_blank"
          className="link flex justify-center items-center gap-0.5"
        >
          <img width={16} src="/nwc.svg" alt="" /> NWC
        </a>{" "}
        and{" "}
        <a
          href="https://getalby.com"
          target="_blank"
          className="link flex justify-center items-center gap-0.5"
        >
          <img width={16} src="/alby-hub.svg" alt="" /> Alby Hub
        </a>
      </p>
      <div className="flex flex-col justify-center items-center mt-4">
        <Link href="/reserves" className="text-xs link mt-4">
          View reserves
        </Link>
        <a
          href="https://github.com/getAlby/jim?tab=readme-ov-file#api"
          className="text-xs link mt-4"
        >
          Developer API
        </a>
        <a href="https://github.com/getAlby/jim" className="text-xs link mt-4">
          source
        </a>
      </div>
    </>
  );
}
