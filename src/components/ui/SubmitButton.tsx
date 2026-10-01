"use client";
import { useFormStatus } from "react-dom";
export default function SubmitButton({ children, pendingText, disabled }: { children: React.ReactNode; pendingText: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button className="shop-button mt-4 w-full" disabled={disabled || pending}>{pending ? pendingText : children}</button>;
}
