import { NextResponse } from "next/server";
import { EconomicCalendarService } from "@/lib/providers/economic-calendar";

export async function GET() {
  try {
    const events =
      await EconomicCalendarService.today();

    return NextResponse.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}