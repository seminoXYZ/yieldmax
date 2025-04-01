// keplr.js

document.addEventListener("DOMContentLoaded", () => {
    const getMoneyButton = document.getElementById("getMoneyButton");
    if (!getMoneyButton) {
      console.error("getMoneyButton element not found.");
      return;
    }
  
    getMoneyButton.addEventListener("click", async (event) => {
      event.preventDefault();
  
      // Define the chain ID for the Agoric network; adjust this as needed.
      const chainId = "agoric-3";
  
      if (!window.keplr) {
        alert("Keplr wallet is not installed. Please install Keplr to proceed.");
        return;
      }
  
      try {
        // Ask Keplr to enable access to the specified chain
        await window.keplr.enable(chainId);
  
        // Retrieve the offline signer which will be used to sign transactions
        const offlineSigner = window.getOfflineSigner(chainId);
  
        // Get the accounts from Keplr
        const accounts = await offlineSigner.getAccounts();
        if (accounts.length === 0) {
          alert("No accounts found in Keplr.");
          return;
        }
  
        console.log("Connected account:", accounts[0].address);
        alert("Connected to Keplr wallet: " + accounts[0].address);
  
        // At this point, you can trigger additional logic (such as preparing a deposit)
        // For example: call your smart contract deposit function here.
        
      } catch (error) {
        console.error("Error connecting to Keplr wallet:", error);
        alert("Error connecting to Keplr wallet: " + error.message);
      }
    });
  });
  