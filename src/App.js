import { ethers } from "ethers";
import { useState, useEffect } from "react";
import ErrorMessage from "./components/ErrorMessage";
import TxList from "./components/TxList";

const startPayment = async ({ setError, setTxs, ether, addr }) => {
  try {
    if (!window.ethereum)
      throw new Error("No crypto wallet found. Please install it.");

    // Request Ethereum wallet permissions
    await window.ethereum.send("eth_requestAccounts");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    ethers.utils.getAddress(addr);
    const tx = await signer.sendTransaction({
      to: addr,
      value: ethers.utils.parseEther(ether),
    });
    // console.log({ ether, addr });
    // console.log("tx", tx);
    setTxs(tx.hash);
    await VerifyCryptoTxs(tx.hash);
  } catch (err) {
    // Handle permission request errors
    if (err.code === 4001) {
      setError("Permission to access wallet denied by user.");
    } else {
      setError(err.message);
    }
  }
};

const VerifyCryptoTxs = (txsHash) => {
  const transactionData = {
    transactionHash: txsHash,
  };

  const apiUrl = "http://localhost:3000/validate-transaction";

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

export default function App() {
  const [error, setError] = useState();
  const [txs, setTxs] = useState(null);
  const [coins, setCoins] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const receiverWalletAddress = "0x4c1c6e4faf48d3f90d4678dbd220116a56b9a5f4";

  useEffect(() => {
    // Check if the device is mobile
    const mobileMediaQuery = window.matchMedia("(max-width: 768px)");

    // Initial check when the component mounts
    setIsMobile(mobileMediaQuery.matches);

    // Add a listener to update the state when the viewport changes
    const handleViewportChange = (event) => {
      setIsMobile(event.matches);
    };

    mobileMediaQuery.addListener(handleViewportChange);

    // Clean up the listener when the component unmounts
    return () => {
      mobileMediaQuery.removeListener(handleViewportChange);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError();
    await startPayment({
      setError,
      setTxs,
      ether: coins,
      addr: receiverWalletAddress,
    });
  };

  const etherValue = ethers.utils.parseEther("0.0008");
  const weiValue = ethers.BigNumber.from(etherValue); // Use ethers.BigNumber

  console.log(weiValue.toString());

  return (
    <form className="m-4">
      <div className="credit-card w-full lg:w-1/2 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
        <main className="mt-4 p-4">
          <h1 className="text-xl font-semibold text-gray-700 text-center">
            Add game coins
          </h1>
          <div className="">
            <div className="my-3">
              <input
                name="ether"
                type="text"
                className="input input-bordered block w-full focus:ring focus:outline-none"
                placeholder="Amount in Matic , 1 MATIC = 1 Coin"
                onChange={(e) => setCoins(e.target.value)}
              />
            </div>
          </div>
        </main>
        <footer className="p-4">
          {isMobile ? (
            <a
              href={`https://metamask.app.link/send/${receiverWalletAddress}?value=${weiValue}`}
              className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
            >
              Pay now
            </a>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
            >
              Pay now
            </button>
          )}
          <ErrorMessage message={error} />
          <TxList txs={txs} />
        </footer>
      </div>
    </form>
  );
}
