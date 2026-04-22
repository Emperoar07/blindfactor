"use client";

// @refresh reset
import { AddressInfoDropdown } from "./AddressInfoDropdown";
import { WrongNetworkDropdown } from "./WrongNetworkDropdown";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";
import { useTargetNetwork } from "~~/hooks/helper/useTargetNetwork";

export const RainbowKitCustomConnectButton = () => {
  const { targetNetwork } = useTargetNetwork();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button className="bf-btn-primary h-9 px-4 text-sm" onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== targetNetwork.id) {
                return <WrongNetworkDropdown />;
              }

              const checkedAddress = account.address;
              if (!isAddress(checkedAddress)) return null;

              return (
                <AddressInfoDropdown
                  address={checkedAddress}
                  displayName={account.displayName}
                  chainName={chain.name}
                />
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
