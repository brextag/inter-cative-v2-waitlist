"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Lock,
  Users,
  Calendar,
  Send,
  Settings,
  Loader2,
  CheckCircle2,
  LogOut,
  RefreshCw,
} from "lucide-react";

type WaitlistEntry = {
  id: string;
  email: string;
  createdAt: string;
  notified?: boolean;
};

type Settings = {
  dropDate: string | null;
  productName: string;
  launchMessage: string;
  lastNotifiedAt: string | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [dropDateInput, setDropDateInput] = useState("");
  const [productName, setProductName] = useState("");
  const [launchMessage, setLaunchMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  const fetchData = useCallback(async (authToken: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        setToken(null);
        localStorage.removeItem("admin_token");
        setAuthError("Invalid password");
        return;
      }
      const data = await res.json();
      setWaitlist(data.waitlist || []);
      setSettings(data.settings);
      setDropDateInput(
        data.settings?.dropDate
          ? format(new Date(data.settings.dropDate), "yyyy-MM-dd'T'HH:mm")
          : ""
      );
      setProductName(data.settings?.productName || "");
      setLaunchMessage(data.settings?.launchMessage || "");
    } catch {
      setAuthError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");
    if (saved) {
      setToken(saved);
      fetchData(saved);
    }
  }, [fetchData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setAuthError("Wrong password");
        setLoading(false);
        return;
      }
      localStorage.setItem("admin_token", password);
      setToken(password);
      const data = await res.json();
      setWaitlist(data.waitlist || []);
      setSettings(data.settings);
      setDropDateInput(
        data.settings?.dropDate
          ? format(new Date(data.settings.dropDate), "yyyy-MM-dd'T'HH:mm")
          : ""
      );
      setProductName(data.settings?.productName || "");
      setLaunchMessage(data.settings?.launchMessage || "");
    } catch {
      setAuthError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken(null);
    setPassword("");
  }

  async function saveSettings() {
    if (!token) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dropDate: dropDateInput ? new Date(dropDateInput).toISOString() : null,
          productName,
          launchMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSaveResult("Settings saved");
      } else {
        setSaveResult("Failed to save");
      }
    } catch {
      setSaveResult("Error saving");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveResult(null), 3000);
    }
  }

  async function sendEmails() {
    if (!token) return;
    if (!confirm("Send launch email to all un-notified waitlist members?")) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ onlyUnnotified: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSendResult(`Sent ${data.sent} of ${data.total} emails`);
        fetchData(token);
      } else {
        setSendResult(data.error || "Failed");
      }
    } catch {
      setSendResult("Error sending");
    } finally {
      setSending(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#fafafa]">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-center mb-1">Admin</h1>
          <p className="text-sm text-neutral-500 text-center mb-6">
            Enter the admin password to manage the waitlist and drop date.
          </p>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              autoFocus
            />
            {authError && (
              <p className="text-sm text-red-500 text-center">{authError}</p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full h-11 rounded-xl bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-xs text-neutral-400 text-center">
            Default password: <code className="bg-neutral-100 px-1 rounded">admin123</code> (set{" "}
            <code className="bg-neutral-100 px-1 rounded">ADMIN_PASSWORD</code> env)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-neutral-500" />
            <span className="font-medium text-sm">Waitlist Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => token && fetchData(token)}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
              <Users className="w-4 h-4" />
              Waitlist
            </div>
            <p className="text-3xl font-semibold">{waitlist.length}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {waitlist.filter((e) => e.notified).length} already notified
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
              <Calendar className="w-4 h-4" />
              Drop date
            </div>
            <p className="text-lg font-medium">
              {settings?.dropDate
                ? format(new Date(settings.dropDate), "MMM d, yyyy · HH:mm")
                : "Not set"}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2 text-neutral-500 text-sm mb-1">
              <Send className="w-4 h-4" />
              Last notified
            </div>
            <p className="text-lg font-medium">
              {settings?.lastNotifiedAt
                ? format(new Date(settings.lastNotifiedAt), "MMM d, HH:mm")
                : "Never"}
            </p>
          </div>
        </div>

        {/* Settings form */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-medium mb-4">Launch settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-500 mb-1.5">Drop date & time</label>
              <input
                type="datetime-local"
                value={dropDateInput}
                onChange={(e) => setDropDateInput(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <p className="text-xs text-neutral-400 mt-1">
                Set when v2 is expected to drop. Customers will see this and get emailed when you trigger.
              </p>
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1.5">Product name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-500 mb-1.5">Launch email message</label>
              <textarea
                value={launchMessage}
                onChange={(e) => setLaunchMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save settings
              </button>
              {saveResult && (
                <span className="text-sm text-teal-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {saveResult}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Send emails */}
        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-medium mb-2">Notify waitlist</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Send the launch email to everyone who hasn&apos;t been notified yet. Requires{" "}
            <code className="bg-neutral-100 px-1 rounded text-xs">RESEND_API_KEY</code> (otherwise
            logs to console as mock).
          </p>
          <button
            onClick={sendEmails}
            disabled={sending || waitlist.filter((e) => !e.notified).length === 0}
            className="h-10 px-5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send launch emails ({waitlist.filter((e) => !e.notified).length} pending)
          </button>
          {sendResult && (
            <p className="mt-3 text-sm text-neutral-600">{sendResult}</p>
          )}
        </section>

        {/* Waitlist table */}
        <section className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="font-medium">Waitlist entries</h2>
          </div>
          {waitlist.length === 0 ? (
            <p className="p-6 text-sm text-neutral-400">No one has joined yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500 border-b border-neutral-100">
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3 font-medium">Notified</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist
                    .slice()
                    .reverse()
                    .map((e) => (
                      <tr key={e.id} className="border-b border-neutral-50 last:border-0">
                        <td className="px-6 py-3 font-medium">{e.email}</td>
                        <td className="px-6 py-3 text-neutral-500">
                          {format(new Date(e.createdAt), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="px-6 py-3">
                          {e.notified ? (
                            <span className="inline-flex items-center gap-1 text-teal-600 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Yes
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-xs">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
