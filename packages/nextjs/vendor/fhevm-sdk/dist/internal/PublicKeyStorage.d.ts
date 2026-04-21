type FhevmStoredPublicKey = {
    publicKeyId: string;
    publicKey: Uint8Array;
};
type FhevmStoredPublicParams = {
    publicParamsId: string;
    publicParams: Uint8Array;
};
type FhevmPublicKeyType = {
    data: Uint8Array;
    id: string;
};
type FhevmPkeCrsType = {
    publicParams: Uint8Array;
    publicParamsId: string;
};
type FhevmPkeCrsByCapacityType = {
    2048: FhevmPkeCrsType;
};
export declare function publicKeyStorageGet(aclAddress: `0x${string}`): Promise<{
    publicKey?: FhevmPublicKeyType;
    publicParams?: FhevmPkeCrsByCapacityType;
}>;
export declare function publicKeyStorageSet(aclAddress: `0x${string}`, publicKey: FhevmStoredPublicKey | null, publicParams: FhevmStoredPublicParams | null): Promise<void>;
export {};
