import { NextRequest, NextResponse } from "next/server";
import { getWaitlist, getSettings, updateSettings, markNotified } from "@/lib/db";
import { sendLaunchEmail } from "@/lib/email";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  const password = process.env.ADMIN_PASSWORD || "admin123";
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === password;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const waitlist = getWaitlist();
  const settings = getSettings();
  return NextResponse.json({ waitlist, settings, count: waitlist.length });
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const settings = updateSettings({
      dropDate: body.dropDate ?? undefined,
      productName: body.productName ?? undefined,
      launchMessage: body.launchMessage ?? undefined,
    });
    return NextResponse.json({ success: true, settings });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Trigger emails to waitlist
  try {
    const body = await req.json().catch(() => ({}));
    const onlyUnnotified = body.onlyUnnotified !== false;
    const waitlist = getWaitlist();
    const settings = getSettings();
    const targets = onlyUnnotified
      ? waitlist.filter((e) => !e.notified)
      : waitlist;

    const results: { email: string; success: boolean }[] = [];
    for (const entry of targets) {
      const res = await sendLaunchEmail(
        entry.email,
        settings.productName,
        settings.launchMessage,
        settings.dropDate
      );
      results.push({ email: entry.email, success: !!res.success });
    }
    const successIds = targets
      .filter((_, i) => results[i]?.success)
      .map((e) => e.id);
    if (successIds.length) {
      markNotified(successIds);
      updateSettings({ lastNotifiedAt: new Date().toISOString() });
    }
    return NextResponse.json({
      success: true,
      sent: results.filter((r) => r.success).length,
      total: targets.length,
      results,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
