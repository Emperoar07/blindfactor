// Mock FHEVM is only used on local Hardhat networks, never on Sepolia.
// This stub prevents bundling @fhevm/mock-utils in production.
export const fhevmMockCreateInstance = async () => {
  throw new Error("Mock FHEVM is not available in this build.");
};
