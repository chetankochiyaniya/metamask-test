const express = require("express");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
const port = 3000; // Change to your desired port

app.use(cors());

// Replace with your Infura API key or Alchemy API key
const infuraApiKey = "88bc68ed0f3449368d0549efb25f20f6";
const walletAddress = "0x4C1C6e4fAf48D3f90d4678DBD220116A56B9a5f4";

app.use(bodyParser.json());

// app.post("/validate-transaction", async (req, res) => {
//   try {
//     const { transactionHash } = req.body;
//     // console.log("==", transactionHash);

//     if (!transactionHash) {
//       return res
//         .status(400)
//         .json({ error: "Transaction hash and wallet address are required." });
//     }

//     // Initialize Web3 provider
//     const provider = new ethers.JsonRpcProvider(
//       `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`
//     );

//     // Step 1: Retrieve Transaction Information
//     const tx = await provider.getTransaction(transactionHash);

//     if (tx === null) {
//       return res.status(404).json({ error: "Transaction not found." });
//     }

//     // Step 2: Check Transaction Status
//     const receipt = await provider.getTransactionReceipt(transactionHash);

//     if (receipt && receipt.status === 1) {
//       console.log("===", tx.value);

//       // const weiValue = 800000000000000n; // 800,000,000,000,000 Wei

//       // Convert Ether to Matic (1 Ether = 1 Matic on Polygon)
//       const maticValue = parseFloat(tx.value) / 1e18;
//       console.log("matic", maticValue);
//       // Step 3: Validate Wallet Address
//       if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
//         return res.json({
//           status: true,
//           coins: maticValue.toString(),
//           message: "Transaction is confirmed and valid.",
//         });
//       } else {
//         return res.json({
//           status: false,
//           message:
//             "Transaction is confirmed and valid. Transaction is not coming to your wallet address.",
//         });
//       }
//     } else if (receipt && receipt.status === 0) {
//       return res.json({ status: false, message: "Transaction failed." });
//     } else {
//       return res.json({ status: false, message: "Transaction is pending." });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while processing the request." });
//   }
// });

app.post("/validate-transaction", async (req, res) => {
  try {
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({ error: "Transaction hash is required." });
    }

    const provider = new ethers.JsonRpcProvider(
      `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`
    );

    const maxWaitTime = 30000; // 30 seconds in milliseconds
    const pollingInterval = 1000; // 1 second in milliseconds
    let waitedTime = 0;

    // Poll for the transaction receipt until it's mined or the timeout is reached
    while (waitedTime < maxWaitTime) {
      const receipt = await provider.getTransactionReceipt(transactionHash);

      if (receipt) {
        if (receipt.status === 1) {
          // Transaction mined successfully
          const tx = await provider.getTransaction(transactionHash);
          const maticValue = parseFloat(tx.value) / 1e18;

          if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
            return res.json({
              status: true,
              coins: maticValue.toString(),
              message:
                "Transaction is confirmed and valid.Transaction is coming to your wallet address.",
            });
          } else {
            return res.json({
              status: false,
              message:
                "Transaction is confirmed and valid. Transaction is not coming to your wallet address.",
            });
          }
        } else if (receipt.status === 0) {
          // Transaction failed
          return res.json({ status: false, message: "Transaction failed." });
        } else {
          // Transaction status is neither 0 nor 1, which means it's still pending
          await new Promise((resolve) => setTimeout(resolve, pollingInterval));
          waitedTime += pollingInterval;
        }
      } else {
        // Transaction receipt is null, indicating the transaction is pending
        await new Promise((resolve) => setTimeout(resolve, pollingInterval));
        waitedTime += pollingInterval;
      }
    }

    // If the loop exits, it means the transaction is still pending after the timeout
    return res.json({
      status: false,
      message: "Transaction is still pending after 30 seconds.",
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
