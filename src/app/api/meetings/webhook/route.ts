/**
 * POST /api/meetings/webhook
 * Handles incoming webhooks from Recall.ai for bot status changes.
 * Called when a bot joins, starts recording, finishes, or fails.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature, mapBotStatusToInternal, getRecordingUrl } from "@/lib/recall";
import { processMeetingRecording } from "@/lib/meeting-processor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-recall-signature") || "";

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    const botId = event.data?.bot_id || event.data?.id;

    if (!botId) {
      return NextResponse.json(
        { error: "Missing bot_id in webhook payload" },
        { status: 400 }
      );
    }

    console.log(`[Recall Webhook] Event: ${eventType}, Bot: ${botId}`);

    // Find the meeting associated with this bot
    const meeting = await db.meetingSchedule.findFirst({
      where: { botId },
    });

    if (!meeting) {
      // Bot might have been created outside our system
      console.warn(`[Recall Webhook] No meeting found for bot ${botId}`);
      return NextResponse.json({ success: true, message: "Bot not tracked" });
    }

    // Handle different event types
    switch (eventType) {
      case "bot.status_change": {
        const recallStatus = event.data?.status?.code;
        const internalStatus = mapBotStatusToInternal(recallStatus);

        await db.meetingSchedule.update({
          where: { id: meeting.id },
          data: {
            botStatus: internalStatus,
            botError: recallStatus === "fatal" ? event.data?.status?.message : null,
          },
        });

        console.log(
          `[Recall Webhook] Bot ${botId} status: ${recallStatus} → ${internalStatus}`
        );
        break;
      }

      case "bot.recording.done":
      case "bot.done": {
        // Recording is complete — trigger processing pipeline
        try {
          const recordingUrl = await getRecordingUrl(botId);

          if (recordingUrl) {
            // Process in the background (don't block the webhook response)
            processMeetingRecording({
              meetingId: meeting.id,
              recordingUrl,
              botId,
            }).catch((err) => {
              console.error(
                `[Recall Webhook] Background processing failed for meeting ${meeting.id}:`,
                err
              );
            });
          } else {
            await db.meetingSchedule.update({
              where: { id: meeting.id },
              data: {
                botStatus: "failed",
                botError: "No recording URL available",
              },
            });
          }
        } catch (err) {
          console.error(
            `[Recall Webhook] Failed to start processing for meeting ${meeting.id}:`,
            err
          );
          await db.meetingSchedule.update({
            where: { id: meeting.id },
            data: {
              botStatus: "failed",
              botError:
                err instanceof Error ? err.message : "Processing failed",
            },
          });
        }
        break;
      }

      case "bot.fatal": {
        await db.meetingSchedule.update({
          where: { id: meeting.id },
          data: {
            botStatus: "failed",
            botError: event.data?.status?.message || "Bot encountered a fatal error",
          },
        });
        break;
      }

      default:
        console.log(`[Recall Webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Recall webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
