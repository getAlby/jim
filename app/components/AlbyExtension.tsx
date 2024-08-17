export function AlbyExtension({
  connectionSecret,
}: {
  connectionSecret: string;
}) {
  return (
    <button
      className="w-80 btn btn-lg btn-primary"
      onClick={async () => {
        if (!(window as any).alby) {
          alert(
            "Alby extension not installed! Get it at https://getalby.com/#extension"
          );
          return;
        }
        await (window as any).alby.enable();
        const { success } = await (window as any).alby.addAccount({
          name: "Alby Jim",
          connector: "nwc",
          config: {
            nostrWalletConnectUrl: connectionSecret,
          },
        });
        if (!success) {
          throw new Error("Add account failed");
        }
        alert("Added successfully!");
      }}
    >
      Add to Alby Extension
    </button>
  );
}
