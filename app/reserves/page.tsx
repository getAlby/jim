"use client";
import React from "react";
import { getReserves, Reserves } from "../actions";
import Link from "next/link";

export default function Page() {
  const [reserves, setReserves] = React.useState<Reserves>();
  React.useEffect(() => {
    getReserves().then((reserves) => setReserves(reserves));
  }, []);

  if (!reserves) {
    return (
      <div className="w-full flex items-center justify-center my-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <p>Reserves</p>
      <p>Number of wallets with non-zero balance: {reserves.numApps}</p>
      <p>
        Total balance across wallets:{" "}
        {Math.floor(reserves.totalAppBalance / 1000)} sats
      </p>
      <p>Number of channels: {reserves.numChannels}</p>
      <p>
        Total balance across channels:{" "}
        {Math.floor(reserves.totalOutgoingCapacity / 1000)} sats
      </p>
      <p>
        Total Channel Capacity:{" "}
        {Math.floor(reserves.totalChannelCapacity / 1000)} sats
      </p>
      <p>
        Reserves met:{" "}
        {reserves.totalOutgoingCapacity >= reserves.totalAppBalance
          ? "✅"
          : "❌"}
      </p>

      <Link href="/" className="mt-8 link">
        Home
      </Link>
    </>
  );
}
