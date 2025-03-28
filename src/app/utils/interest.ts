/**
 * @fileoverview Utility functions for calculating interest based on transactions and interest rates.
 */

import type { Transaction } from "@/types/bank";

/**
 * Calculates the interest accumulated since the last transaction.
 *
 * @param {number} interestRate - The annual interest rate as a percentage.
 * @param {Transaction[]} transactions - The list of transactions for the account.
 * @returns {Object} An object containing the interest since the last transaction, the new balance, and date details.
 */
export function calculateInterestSinceLastTransaction( interestRate: number, transactions: Transaction[]) {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get the last transaction and its running balance
  const lastTransaction = sortedTransactions[0];

  if (!lastTransaction) {
    return {
      interestSinceLastTransaction: 0,
      newBalance: 0,
      lastTransactionDate: new Date(),
      today: new Date()
    };
  }

  const today = new Date();
  const lastTransactionDate = new Date(lastTransaction.timestamp);

  // Calculate days between last transaction and today
  const daysSinceLastTransaction = Math.floor(
    (today.getTime() - lastTransactionDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate interest since last transaction using the stored running balance
  const interestSinceLastTransaction =
    lastTransaction.runningBalance * ((interestRate/100) / 365) * daysSinceLastTransaction;

  // New balance is last transaction's running balance plus any new interest
  const newBalance = lastTransaction.runningBalance + interestSinceLastTransaction;


  return {
    interestSinceLastTransaction,
    newBalance,
    lastTransactionDate,
    today,
  };
}