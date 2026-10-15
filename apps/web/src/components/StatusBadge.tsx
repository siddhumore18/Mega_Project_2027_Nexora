import React from "react";

interface StatusBadgeProps {
  status: "FEASIBLE" | "OPTIMAL" | "PUBLISHED" | "APPROVED" | "DRAFT" | "REVIEW" | "QUEUED" | "RUNNING" | "INFEASIBLE" | "FAILED" | "UNKNOWN" | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeClass = "badge-neutral";

  switch (status.toUpperCase()) {
    case "FEASIBLE":
    case "OPTIMAL":
    case "PUBLISHED":
    case "APPROVED":
    case "OK":
      badgeClass = "badge-success";
      break;
    case "DRAFT":
    case "REVIEW":
    case "QUEUED":
    case "RUNNING":
      badgeClass = "badge-warning";
      break;
    case "INFEASIBLE":
    case "FAILED":
      badgeClass = "badge-danger";
      break;
    default:
      badgeClass = "badge-neutral";
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};
