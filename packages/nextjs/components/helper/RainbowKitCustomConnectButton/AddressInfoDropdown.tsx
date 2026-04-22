import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { Address, formatEther } from "viem";
import { useDisconnect } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { ArrowsRightLeftIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/helper";
import { useWatchBalance } from "~~/hooks/helper/useWatchBalance";
import { getTargetNetworks } from "~~/utils/helper";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  displayName: string;
  chainName?: string;
};

export const AddressInfoDropdown = ({ address, displayName, chainName }: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const { data: balance } = useWatchBalance({ address });

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const closeDropdown = () => {
    setSelectingNetwork(false);
    dropdownRef.current?.removeAttribute("open");
  };

  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <details ref={dropdownRef} className="dropdown dropdown-end leading-3">
        <summary className="bf-btn-primary h-9 cursor-pointer list-none px-4 text-sm">
          <span>{displayName}</span>
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        </summary>
        <ul className="dropdown-content menu z-2 p-2 mt-2 shadow-[0_4px_24px_rgba(26,18,8,0.12)] bg-[#fffcf7] border border-[#ede4d5] rounded-xl gap-1 min-w-[200px]">
          {!selectingNetwork && balance !== null && balance !== undefined && (
            <li className="px-3 py-2.5 mb-1 border-b border-[#ede4d5]">
              <div className="flex items-center justify-between pointer-events-none cursor-default hover:bg-transparent p-0">
                <span className="text-xs text-[#9a8a7e] font-medium">{chainName ?? "Network"}</span>
                <span className="text-sm font-semibold text-[#1a1208]">
                  {Number(formatEther(balance.value)).toFixed(4)} ETH
                </span>
              </div>
            </li>
          )}
          <NetworkOptions hidden={!selectingNetwork} />
          {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="h-8 btn-sm rounded-xl! flex gap-3 py-3"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Switch Network</span>
              </button>
            </li>
          ) : null}
          <li className={selectingNetwork ? "hidden" : ""}>
            <button
              className="menu-item text-error h-8 btn-sm rounded-xl! flex gap-3 py-3"
              type="button"
              onClick={() => disconnect()}
            >
              <ArrowLeftIcon className="h-6 w-4 ml-2 sm:ml-0" /> <span>Disconnect</span>
            </button>
          </li>
        </ul>
      </details>
    </>
  );
};
