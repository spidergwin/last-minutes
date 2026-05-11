import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

const secret = process.env.PAYSTACK_SECRET_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // Handle the event
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulCharge(event.data);
        break;
      case "subscription.create":
        await handleSubscriptionCreate(event.data);
        break;
      case "subscription.disable":
        await handleSubscriptionDisable(event.data);
        break;
      // Add other relevant Paystack events
      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulCharge(data: any) {
  console.log("Successful charge:", data.reference);
  
  // If this was a one-off payment or the first payment of a subscription
  const metadata = data.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.warn("Charge successful but no userId found in metadata");
    return;
  }

  // Update user's billing status
  // Wait for auth & schema updates to fully implement
}

async function handleSubscriptionCreate(data: any) {
  console.log("Subscription created:", data.subscription_code);
  
  // Update user subscription status in DB
}

async function handleSubscriptionDisable(data: any) {
  console.log("Subscription disabled:", data.subscription_code);
  
  // Mark user subscription as canceled in DB
}
