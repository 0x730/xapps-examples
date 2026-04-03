import React from "react";

export function StatusBox({ tone = "neutral", children }) {
  return <div className={`creator-status ${tone}`}>{children}</div>;
}
