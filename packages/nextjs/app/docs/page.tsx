import Link from "next/link";

const Section = ({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-20">
    <h2 className="text-2xl font-bold text-[#0f1117] border-b border-[rgba(180,165,140,0.3)] pb-3 mb-5">{title}</h2>
    <div className="space-y-4 text-sm leading-7 text-[#3a3530]">{children}</div>
  </section>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-base font-bold text-[#0f1117] mb-2">{title}</h3>
    <div className="space-y-3 text-sm leading-7 text-[#3a3530]">{children}</div>
  </div>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-xl bg-[#0f1117] px-5 py-4 text-xs text-[#e8a825] font-mono leading-relaxed">
    <code>{children}</code>
  </pre>
);

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-[#f0cc80] bg-[#fdf4dc] px-4 py-3 text-sm text-[#7a4f00]">{children}</div>
);

const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "how-it-works", label: "How it works" },
  { id: "fhe-explanation", label: "What FHE means here" },
  { id: "borrower-guide", label: "Borrower guide" },
  { id: "lender-guide", label: "Lender guide" },
  { id: "settlement-token", label: "Settlement token" },
  { id: "contracts", label: "Smart contracts" },
  { id: "privacy", label: "Privacy policy" },
  { id: "cookies", label: "Cookie policy" },
  { id: "terms", label: "Terms of use" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#7a6f63]">Contents</p>
            {tocItems.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block rounded-lg px-3 py-2 text-sm text-[#7a6f63] transition-colors hover:bg-[#fdf4dc] hover:text-[#0f1117]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        <article className="space-y-12 min-w-0">
          <div className="overflow-hidden rounded-[1.75rem] bg-[#0f1117] px-8 py-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8a825]/15 border border-[#e8a825]/25 px-3 py-1.5 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e8a825] animate-pulse" />
              <span className="text-xs font-semibold text-[#e8a825]">Documentation</span>
            </div>
            <h1 className="text-4xl font-bold text-[#fdfaf4]">BlindFactor Docs</h1>
            <p className="mt-3 max-w-xl text-base text-[#fdfaf4]/60 leading-8">
              Everything you need to understand, participate in, and build on confidential invoice financing powered by Zama FHEVM.
            </p>
          </div>

          <Section id="overview" title="Overview">
            <p>
              BlindFactor is a confidential invoice financing marketplace deployed on Ethereum. It lets businesses raise working capital by posting financing requests, while lenders compete to fund those requests by submitting sealed bids.
            </p>
            <p>
              The key property is that the economics stay private. Invoice amounts, minimum acceptable payouts, individual bid terms, and repayment figures are all encrypted on chain using Fully Homomorphic Encryption provided by Zama. The winning bid is computed without ever decrypting the values, and only the authorized wallets can reveal their own numbers.
            </p>
            <InfoBox>
              BlindFactor is deployed on Ethereum Sepolia testnet. The settlement token is bfUSD, a confidential ERC20 token with encrypted balances.
            </InfoBox>
          </Section>

          <Section id="how-it-works" title="How it works">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Borrower creates request",
                  body: "The borrower submits an invoice amount and minimum acceptable payout, both encrypted with FHE. The due date and bidding window are public so lenders know when to act."
                },
                {
                  step: "02",
                  title: "Lenders bid privately",
                  body: "Up to three lenders submit encrypted bids with their offered payout now and requested repayment at maturity. The contract evaluates bids homomorphically and silently tracks the best valid offer."
                },
                {
                  step: "03",
                  title: "Accept, fund, repay",
                  body: "The borrower decrypts the winner privately, accepts the selected lender on chain, and the lender funds the request with a confidential bfUSD transfer. At maturity the borrower repays the lender."
                }
              ].map(s => (
                <div key={s.step} className="rounded-xl border border-[rgba(180,165,140,0.3)] bg-white p-5">
                  <span className="inline-block mb-2 text-xs font-bold text-[#e8a825]">{s.step}</span>
                  <h3 className="text-sm font-bold text-[#0f1117] mb-1">{s.title}</h3>
                  <p className="text-xs leading-relaxed text-[#7a6f63]">{s.body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="fhe-explanation" title="What FHE means here">
            <p>
              Fully Homomorphic Encryption lets a computer perform arithmetic on encrypted numbers and get an encrypted result, without ever seeing the underlying values. BlindFactor uses this to run its auction logic entirely on sealed data.
            </p>
            <SubSection title="What stays encrypted">
              <ul className="list-disc list-inside space-y-1.5 text-[#3a3530]">
                <li>The invoice amount the borrower is financing</li>
                <li>The minimum payout the borrower will accept</li>
                <li>Each lender&apos;s offered payout now</li>
                <li>Each lender&apos;s requested repayment at due date</li>
                <li>The winning bid id, payout, and repayment figures</li>
                <li>Every participant&apos;s bfUSD token balance</li>
              </ul>
            </SubSection>
            <SubSection title="What is public">
              <ul className="list-disc list-inside space-y-1.5 text-[#3a3530]">
                <li>The existence and id of each request</li>
                <li>The borrower address</li>
                <li>The bidding deadline and due date</li>
                <li>The number of bids received</li>
                <li>Which lender was accepted</li>
                <li>Request lifecycle status</li>
              </ul>
            </SubSection>
            <InfoBox>
              Decryption requires a wallet signature. Only the wallet that is authorized by the contract for a given encrypted value can decrypt it. You cannot decrypt another user&apos;s bid or balance.
            </InfoBox>
          </Section>

          <Section id="borrower-guide" title="Borrower guide">
            <SubSection title="Creating a request">
              <p>Navigate to the Borrower desk and connect the wallet you want to use as the borrower. Fill in:</p>
              <ul className="list-disc list-inside space-y-1.5 text-[#3a3530]">
                <li><strong>Invoice amount:</strong> the face value you want to finance, denominated in bfUSD</li>
                <li><strong>Minimum payout:</strong> the lowest upfront amount you will accept from a lender</li>
                <li><strong>Bidding window:</strong> how many hours lenders have to submit bids</li>
                <li><strong>Days until repayment:</strong> when you will repay the winning lender</li>
                <li><strong>Invoice reference:</strong> a short label hashed on chain for your records</li>
              </ul>
              <p>
                Submitting the form encrypts the invoice amount and minimum payout in your browser, then broadcasts a transaction with only ciphertexts. No one can read your terms from the blockchain.
              </p>
            </SubSection>
            <SubSection title="Closing bidding and accepting a lender">
              <p>
                After the bidding window expires, or earlier if you choose, you can close bidding from the request card. Once bidding is closed you can decrypt the winning bid id, payout, and repayment using the Winning outputs decrypt panel. Enter the clear bid id into the Accept lender form to lock in the selection on chain.
              </p>
            </SubSection>
            <SubSection title="Repaying">
              <p>
                After the lender funds the request your wallet receives a confidential bfUSD transfer. When you are ready to repay at or before the due date, use Mark repaid on the request card. This triggers a confidential transfer from your wallet to the lender for the agreed repayment amount.
              </p>
            </SubSection>
          </Section>

          <Section id="lender-guide" title="Lender guide">
            <SubSection title="Checking your balance">
              <p>
                Open the Lender desk and use the confidential balance decrypt panel to see your bfUSD before bidding. This requires a wallet signature to authorize decryption.
              </p>
            </SubSection>
            <SubSection title="Submitting a bid">
              <p>Open requests from borrowers other than your wallet will appear in the Lender desk. For any open request, enter:</p>
              <ul className="list-disc list-inside space-y-1.5 text-[#3a3530]">
                <li><strong>Payout now:</strong> what you will send the borrower upfront if selected</li>
                <li><strong>Repayment at due date:</strong> what you expect back from the borrower at maturity</li>
              </ul>
              <p>
                Both values are encrypted in your browser before the transaction. Other lenders cannot see your terms. The contract evaluates your bid against the current leader using FHE arithmetic and silently updates the winner if your offer is better and meets the borrower&apos;s minimum.
              </p>
            </SubSection>
            <SubSection title="Funding an accepted request">
              <p>
                If the borrower selects your bid you will see a Fund accepted request button on the request card. Clicking this initiates a confidential bfUSD transfer from your wallet to the borrower for the encrypted winning payout amount.
              </p>
            </SubSection>
          </Section>

          <Section id="settlement-token" title="Settlement token">
            <p>
              BlindFactor uses bfUSD, a confidential settlement token with encrypted balances. All balances and transfer amounts are stored and processed as FHE ciphertexts. A standard ERC20 balance mapping would expose lender and borrower positions publicly. bfUSD ensures the financial flows remain sealed.
            </p>
            <SubSection title="Token details">
              <ul className="list-disc list-inside space-y-1.5 text-[#3a3530]">
                <li><strong>Name:</strong> BlindFactor USD</li>
                <li><strong>Symbol:</strong> bfUSD</li>
                <li><strong>Decimals:</strong> 6</li>
                <li>Balances are stored as euint64 ciphertexts on chain</li>
                <li>Transfers check balance sufficiency using FHE comparisons without revealing amounts</li>
              </ul>
            </SubSection>
          </Section>

          <Section id="contracts" title="Smart contracts">
            <SubSection title="Sepolia deployment">
              <CodeBlock>{`BlindFactorMarket: 0x983e37af5797B69479fCB6B8Dc5dE88A21C57eeB
BlindFactorToken:  0xB30b83482df69d1ac5a3c132dfFda86212A028f4`}</CodeBlock>
            </SubSection>
            <SubSection title="BlindFactorMarket">
              <p>
                The core contract managing the lifecycle of financing requests. Borrowers create requests with encrypted invoice terms. Lenders submit encrypted bids. The contract runs a winner tracking algorithm using FHE select and comparison operations. The winning bid is updated after every new submission, all without decryption.
              </p>
            </SubSection>
            <SubSection title="BlindFactorToken">
              <p>
                A confidential ERC20 token. Balances are stored as euint64 encrypted integers. The market contract can call marketTransferFrom to move tokens between parties using encrypted amounts. Individuals can call confidentialTransfer to send tokens using an FHE input proof.
              </p>
            </SubSection>
            <SubSection title="Source code">
              <p>
                The complete smart contract source is available on{" "}
                <a
                  href="https://github.com/Emperoar07/blindfactor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0f1117] font-semibold underline underline-offset-2 hover:text-[#e8a825]"
                >
                  GitHub
                </a>
                . The frontend uses Next.js, Wagmi, RainbowKit, and the Zama relayer SDK for FHE operations.
              </p>
            </SubSection>
          </Section>

          <Section id="privacy" title="Privacy policy">
            <p>
              BlindFactor does not collect, store, or process any personal information. There is no backend server, no database, and no analytics. All application logic runs client side in your browser and directly on Ethereum smart contracts.
            </p>
            <p>
              Wallet addresses that interact with the contracts are visible on the public blockchain. All other financial data, including invoice amounts, bid terms, token balances, and repayment figures, are encrypted on chain and accessible only to wallets authorized by the contract.
            </p>
            <p>
              By connecting your wallet and submitting transactions you acknowledge that blockchain transactions are public and permanent. You are solely responsible for the security of your private keys.
            </p>
          </Section>

          <Section id="cookies" title="Cookie policy">
            <p>
              BlindFactor uses a minimal set of browser storage mechanisms required for the application to function. There are no advertising cookies, no third-party trackers, and no analytics scripts.
            </p>
            <SubSection title="What we store locally">
              <ul className="list-disc list-inside space-y-1.5 text-[#3a3530]">
                <li><strong>Wallet connection state:</strong> RainbowKit stores your last connected wallet type in <code>localStorage</code> so the app can reconnect automatically on your next visit. This data never leaves your browser.</li>
                <li><strong>WalletConnect session:</strong> If you connect via WalletConnect, a temporary session key is stored in <code>localStorage</code> for the duration of your session. It is cleared when you disconnect.</li>
              </ul>
            </SubSection>
            <SubSection title="What we do not use">
              <ul className="list-disc list-inside space-y-1.5 text-[#3a3530]">
                <li>No analytics or tracking cookies (no Google Analytics, Mixpanel, or similar)</li>
                <li>No advertising or retargeting cookies</li>
                <li>No server-side session cookies (there is no backend)</li>
                <li>No fingerprinting or cross-site tracking</li>
              </ul>
            </SubSection>
            <p>
              Because this application is entirely client-side and blockchain-based, we do not have the ability to link your browsing behavior to your identity. You can clear all locally stored data at any time through your browser settings without affecting your on-chain assets.
            </p>
          </Section>

          <Section id="terms" title="Terms of use">
            <p>
              BlindFactor is experimental software deployed on Ethereum. Use it at your own risk. The software is provided as is, without warranty of any kind, express or implied.
            </p>
            <p>
              This application is not a licensed financial institution and does not provide financial advice, credit services, or regulated investment products. It is a decentralized protocol for consenting parties to coordinate confidential token transfers.
            </p>
            <p>
              You are responsible for complying with all laws applicable to your jurisdiction. The developers of BlindFactor accept no liability for losses arising from use of the protocol, including but not limited to smart contract bugs, FHE library issues, or market conditions.
            </p>
            <p>
              This software is released under the BSD 3 Clause Clear License. You may fork, modify, and deploy your own instance in accordance with that license.
            </p>
          </Section>

          <div className="rounded-xl bg-[#0f1117] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#fdfaf4]">Ready to try it?</p>
              <p className="text-xs text-[#fdfaf4]/50">Connect a wallet and start a confidential financing round.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/borrower" className="bf-btn-gold text-sm px-5 py-2.5">
                Borrower desk
              </Link>
              <Link
                href="/lender"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-[#fdfaf4] hover:border-[#e8a825] hover:text-[#e8a825] transition-colors"
              >
                Lender desk
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
