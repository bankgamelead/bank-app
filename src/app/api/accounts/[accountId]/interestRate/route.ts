import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  updateInterestRate,
  getAccount,
} from "../../../services/dynamoDBService";

export async function POST(request: Request, context: { params: { accountId: string } }) {
  const params = context.params;
  const accountId = params.accountId;
  if (!accountId) {
    return new NextResponse("Account ID is required", { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.idToken) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { interestRate } = await request.json();
    if (interestRate === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const account = await getAccount(accountId);
    if (!account) {
      return new NextResponse("Account not found", { status: 404 });
    }

    const updatedAccount = await updateInterestRate(accountId, interestRate);

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error("Error updating interest rate:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
