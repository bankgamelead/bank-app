"use client";

import type { BankAccount } from "../../types/bank";

interface AccountOverviewProps {
  account: BankAccount;
}

export default function AccountOverview({ account }: AccountOverviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Account Number</h3>
        <p className="mt-1 text-lg font-semibold">{account.accountNumber}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
        <p className="mt-1 text-2xl font-bold text-blue-600">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(account.balance)}
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Interest Rate</h3>
        <p className="mt-1 text-lg font-semibold">{account.interestRate}%</p>
      </div>
      {account.transactions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500">
            Last Transaction
          </h3>
          <p className="mt-1 text-lg">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              signDisplay: "always",
            }).format(
              account.transactions[0].type === "withdrawal"
                ? -account.transactions[0].amount
                : account.transactions[0].amount
            )}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(account.transactions[0].timestamp).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
