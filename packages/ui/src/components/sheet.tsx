"use client";

import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "../cn";

/**
 * Sheet: a Dialog that slides in from an edge. `side="bottom"` is the mobile
 * bottom sheet (rounded top, drag-handle affordance, safe-area padding).
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  side = "right",
  className,
  children,
  closeLabel = "Close",
  showClose = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  side?: "right" | "bottom" | "left";
  closeLabel?: string;
  showClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-background text-foreground shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:duration-150 data-[state=open]:animate-in data-[state=open]:duration-200",
          side === "right" &&
            "inset-y-0 right-0 w-full max-w-sm border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "left" &&
            "inset-y-0 left-0 w-full max-w-sm border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl border-t border-border pb-[env(safe-area-inset-bottom)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
        {...props}
      >
        {side === "bottom" ? (
          <div
            className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border"
            aria-hidden="true"
          />
        ) : null}
        {children}
        {showClose ? (
          <DialogPrimitive.Close className="absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <XIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-sm font-semibold", className)} {...props} />;
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}
