import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import authService from "../api/auth";
import { useDispatch } from "react-redux";
import { updateUser } from "../store/authSlice";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    authService
      .verifyEmail(token)
      .then((user) => {
        if (user) dispatch(updateUser({ userData: user }));
        setStatus("success");
        setMessage("Email verified successfully.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Failed to verify email.");
      });
  }, [searchParams, dispatch]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-900/10 bg-white/80 p-8 text-center shadow-lg backdrop-blur">
        <h1 className="text-2xl font-semibold text-slate-900">Email Verification</h1>
        <p className="mt-3 text-sm text-slate-600">
          {status === "verifying" ? "Verifying your email..." : message}
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Go to Profile
        </Link>
      </div>
    </div>
  );
}

export default VerifyEmail;
