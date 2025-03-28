/**
 * @fileoverview This component provides an overview of a bank account,
 * including the current balance, interest rate, and the latest transaction.
 * It also allows users to change the interest rate.
 */

"use client";

import { useEffect, useState } from "react";
import { createNewTransaction } from "@/lib/actions";
import { BankAccount, Transaction } from "@/types/bank";
import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    idToken?: string;
  }
}
import router from "next/router";

/**
 * Props for the AccountOverview component.
 *
 * @typedef {Object} AccountOverviewProps
 * @property {Session} session - The current user's session.
 * @property {BankAccount | null} account - The bank account to display.
 * @property {number | undefined} balance - The current balance of the account.
 * @property {number | undefined} interestRate - The current interest rate of the account.
 * @property {Transaction | null} latestTransaction - The latest transaction for the account.
 * @property {() => void} onCreateNewTransaction - Callback to handle new transactions.
 */
interface AccountOverviewProps {
  session: Session;
  account: BankAccount | null;
  balance: number | undefined;
  interestRate: number | undefined;
  latestTransaction: Transaction | null;
  onInterestRateChange: (_newRate: number) => void;
  onCreateNewTransaction: () => void;
}

/**
 * A component that displays an overview of a bank account, including the
 * current balance, interest rate, and the latest transaction. It also allows
 * users to change the interest rate.
 *
 * @param {AccountOverviewProps} props - The props for the component.
 * @returns {JSX.Element} The JSX structure for the account overview.
 */
export default function AccountOverview({
  session,
  account,
  balance,
  interestRate,
  latestTransaction,
  onInterestRateChange: _onInterestRateChange,
  onCreateNewTransaction: _onTransactionsChange,
}: AccountOverviewProps) {
  const [isRateChanging, setIsRateChanging] = useState(false);
  const [inputRate, setInputRate] = useState(interestRate) || 0;
  const [isLoading, setIsLoading] = useState(false);

  // TODO: remove useEffect - unnecessary here
  // Update input placeholder rate when initialBalance changes
  useEffect(() => {
    setInputRate(interestRate || 0);
  }, [interestRate]);

  /**
   * Handles the interest rate change process, including creating a transaction
   * to record the change and updating the account's interest rate.
   */
  const handleRateChange = async () => {
    setIsLoading(true);
    if (!account) {
      console.error("No account selected");
      return;
    }

    if (inputRate === undefined) {
      console.error("No inputRate provided");
      return;
    }

    if (inputRate === account.interestRate) {
      setIsRateChanging(false);
      return;
    }

    const transaction: Omit<
      Transaction,
      "transactionId" | "runningBalance" | "accumulatedInterest"
    > = {
      type: "deposit",
      amount: 0,
      timestamp: new Date().toISOString(),
      description: `Interest Rate changed from ${account?.interestRate.toFixed(
        1
      )}% to ${inputRate?.toFixed(1)}%`,
    };

    const newTransaction = await createNewTransaction(
      session,
      account,
      transaction
    );

    if (!newTransaction) {
      console.error("Unable to create new transaction");
      return;
    }
    if (inputRate !== undefined) {
      await handleInterestRateChange(inputRate);
    }

    setIsRateChanging(false);
    setIsLoading(false);

    _onTransactionsChange();
  };

  const handleInterestRateChange = async (newRate: number) => {
    try {
      const response = await fetch(
        `/api/accounts/${account?.accountId}/interestRate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.idToken}`,
          },
          body: JSON.stringify({ interestRate: Number(newRate) }),
        }
      );

      if (response.status === 401) {
        // Token expired, redirect to sign in
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update interest rate");
      }

      _onInterestRateChange(newRate);
    } catch (error) {
      console.error("Error updating interst rate:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-green-100 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-green-800 mb-1">
          Current Balance
        </h3>
        <p className="text-2xl font-bold text-green-900">
          ${(balance ?? 0).toFixed(2)}
        </p>
      </div>
      <div className="bg-purple-100 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-purple-800 mb-1">
          Interest Rate
        </h3>
        <p className="text-2xl font-bold text-purple-900">
          {(interestRate ?? 0).toFixed(1)}%
        </p>
        {isRateChanging ? (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder={(interestRate ?? 0).toFixed(1) || ""}
              step="0.1"
              min="0"
              max="100"
              value={inputRate}
              onChange={(e) => setInputRate(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
            <button
              onClick={handleRateChange}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Change"}
            </button>
            {!isLoading && (
              <button
                onClick={() => setIsRateChanging(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsRateChanging(true)}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            Change
          </button>
        )}{" "}
      </div>
      <div className="bg-orange-100 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-medium text-orange-800 mb-1">
          Last Transaction
          <span className="font-normal text-orange-700">
            {" "}
            (
            {new Date(
              latestTransaction?.timestamp
                ? new Date(latestTransaction.timestamp)
                : new Date()
            ).toLocaleDateString()}
            )
          </span>
        </h3>
        <p className="text-2xl font-bold text-orange-900">
          {latestTransaction ? (
            <span
              className={
                latestTransaction.type === "deposit"
                  ? "text-green-700"
                  : "text-red-700"
              }
            >
              {latestTransaction.type === "deposit" ? "+" : "-"}$
              {latestTransaction.amount.toFixed(2)}
            </span>
          ) : (
            "No transactions"
          )}
        </p>
      </div>
    </div>
  );
}
