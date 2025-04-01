// contract.js
import { assert } from '@agoric/assert';

export const start = async (zcf) => {
  // State to store yield rates from vaults.
  // Example structure: { vaultA: 0.12, vaultB: 0.15 }
  let vaultYields = {};

  // Authorized updater's address – only this address can update yield data.
  const authorizedUpdater = 'agoric1updateraddress...'; // <-- Replace with actual address

  // Map to track deposits.
  // We use the seat (the offer instance) as a key for this simplified example.
  const deposits = new Map();

  // ======================================================
  // Deposit Offer Handler
  // ======================================================
  const depositOfferHandler = (seat) => {
    // Expect the user to deposit USDC under the keyword "Deposit"
    const allocation = zcf.getCurrentAllocation(seat);
    const depositPayment = allocation.Deposit;
    assert(depositPayment, 'A deposit payment under keyword "Deposit" is required.');
    // For this prototype, assume depositPayment has a "value" property that is a number.
    const depositAmount = depositPayment.value;
    assert(depositAmount > 0, 'Deposit must be greater than zero.');

    // Choose the vault with the highest yield from the currently stored yield data.
    let bestVault = null;
    let bestYield = -Infinity;
    for (const [vault, yieldRate] of Object.entries(vaultYields)) {
      if (yieldRate > bestYield) {
        bestVault = vault;
        bestYield = yieldRate;
      }
    }

    // Record the deposit and its allocation.
    deposits.set(seat, {
      depositAmount,
      allocatedVault: bestVault,
      // In a full implementation, you might also store the depositor's address and timestamp.
    });

    console.log(`Deposit received: ${depositAmount} USDC allocated to vault: ${bestVault} (yield: ${bestYield}).`);

    // Exit the offer. In a production contract you might mint a receipt or update a state.
    seat.exit();
    return `Deposit of ${depositAmount} USDC successful. Allocated to vault: ${bestVault}.`;
  };

  // ======================================================
  // Withdrawal Offer Handler
  // ======================================================
  const withdrawOfferHandler = (seat) => {
    // In a real contract, you would verify that the deposit has accrued enough yield.
    // For this prototype, if a deposit record exists, allow immediate withdrawal.
    if (!deposits.has(seat)) {
      seat.fail(new Error('No deposit record found for this offer.'));
      return;
    }
    const depositRecord = deposits.get(seat);
    deposits.delete(seat);
    console.log(`Withdrawal processed for deposit of ${depositRecord.depositAmount} USDC from vault: ${depositRecord.allocatedVault}.`);
    seat.exit();
    return `Withdrawal of ${depositRecord.depositAmount} USDC successful.`;
  };

  // ======================================================
  // Oracle Update Function
  // ======================================================
  // This function is callable on the public facet.
  // It merges in new yield data after verifying the updater is authorized.
  const updateVaultYields = (updaterAddress, newYields) => {
    assert(
      updaterAddress === authorizedUpdater,
      `Updater ${updaterAddress} is not authorized to update vault yields.`
    );
    vaultYields = { ...vaultYields, ...newYields };
    console.log('Vault yields updated:', vaultYields);
    return vaultYields;
  };

  // ======================================================
  // Public Facet
  // ======================================================
  // These functions are available to external parties.
  const publicFacet = harden({
    getVaultYields: () => vaultYields,
    updateVaultYields,
  });

  // ======================================================
  // Creator Facet (for administrative purposes)
  // ======================================================
  // We create invitations for deposit and withdrawal offers.
  const depositInvitation = zcf.makeInvitation(depositOfferHandler, 'Deposit USDC');
  const withdrawInvitation = zcf.makeInvitation(withdrawOfferHandler, 'Withdraw USDC');

  const creatorFacet = harden({
    getDepositInvitation: () => depositInvitation,
    getWithdrawInvitation: () => withdrawInvitation,
  });

  return harden({ publicFacet, creatorFacet });
};
