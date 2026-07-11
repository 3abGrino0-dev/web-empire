"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel: string;
  children: ReactNode;
};

export function FormPendingButton({
  pendingLabel,
  children,
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  const isDisabled = pending || Boolean(disabled);

  return (
    <button {...props} disabled={isDisabled} aria-disabled={isDisabled} data-pending={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
