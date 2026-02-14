import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import authService from "../api/auth";
import { Button } from "../components";

function VerifyEmailPending() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resendVerification = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await authService.resendEmailVerification();
      setMessage("Verification email sent. Please check your inbox.");
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[65vh] place-items-center py-8">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-900/10 bg-white/80 p-7 shadow-lg backdrop-blur sm:p-10">
        <p className="section-kicker">Account Created</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Verify your email to continue</h1>
        <p className="mt-3 text-sm text-slate-600">
          {email ? `We sent a verification link to ${email}.` : "We sent a verification link to your email."}
          {" "}Open the email and click the link to activate your account.
        </p>

        {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button type="button" onClick={resendVerification} className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Resend Verification"}
          </Button>
          <Link
            to="/profile"
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-900/20 hover:text-slate-900"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPending;
