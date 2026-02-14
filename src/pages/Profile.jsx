import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import authService from "../api/auth";
import { updateUser } from "../store/authSlice";
import { Button, Input } from "../components";

function Profile() {
  const userData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const { register, handleSubmit, setValue } = useForm();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userData) return;
    setValue("name", userData.name || "");
    setValue("email", userData.email || "");
    setValue("phone", userData.phone || "");
    setValue("description", userData.description || "");
    if (userData.dob) {
      const iso = new Date(userData.dob).toISOString().slice(0, 10);
      setValue("dob", iso);
    }
  }, [userData, setValue]);

  const onSubmit = async (data) => {
    setError("");
    setMessage("");
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        dob: data.dob || "",
        description: data.description || "",
        avatar: data.avatar && data.avatar[0] ? data.avatar[0] : null,
      };
      const updated = await authService.updateProfile(payload);
      dispatch(updateUser({ userData: updated }));
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    }
  };

  const handleResendEmail = async () => {
    setError("");
    setMessage("");
    try {
      await authService.resendEmailVerification();
      setMessage("Verification email sent.");
    } catch (err) {
      setError(err.message || "Failed to resend verification email.");
    }
  };

  if (!userData) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-slate-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-slate-900/10 bg-white/80 p-6 shadow-lg backdrop-blur sm:p-10">
      <h1 className="text-2xl font-semibold text-slate-900">Your Profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        Update your details and complete verification.
      </p>

      {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-200">
          {userData.avatarUrl ? (
            <img src={userData.avatarUrl} alt={userData.name} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="text-sm text-slate-600">
          <p>
            Email:{" "}
            <span className={userData.isEmailVerified ? "text-emerald-700" : "text-amber-700"}>
              {userData.isEmailVerified ? "Verified" : "Unverified"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Button type="button" onClick={handleResendEmail} className="w-full">
          Resend Email Verification
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5">
        <Input label="Full name" {...register("name", { required: true })} />
        <Input label="Email" type="email" {...register("email", { required: true })} />
        <Input label="Phone number" type="tel" {...register("phone", { required: true })} />
        <Input label="Date of birth (optional)" type="date" {...register("dob")} />
        <Input label="Short bio (optional)" {...register("description")} />
        <Input
          label="Update profile photo"
          type="file"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("avatar")}
        />
        <Button type="submit" className="w-full">
          Save changes
        </Button>
      </form>
    </div>
  );
}

export default Profile;
