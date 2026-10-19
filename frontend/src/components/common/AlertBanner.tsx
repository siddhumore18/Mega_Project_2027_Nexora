import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface AlertBannerProps {
  type: "info" | "success" | "warning" | "danger";
  title?: string;
  message: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  title,
  message,
  action,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} className="alert-icon text-success" />;
      case "warning":
        return <AlertTriangle size={18} className="alert-icon text-warning" />;
      case "danger":
        return <AlertCircle size={18} className="alert-icon text-danger" />;
      case "info":
      default:
        return <Info size={18} className="alert-icon text-brand" />;
    }
  };

  return (
    <div className={`alert-banner alert-${type}`} role="alert">
      <div className="alert-icon-container">{getIcon()}</div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{message}</div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-secondary btn-sm"
          style={{ whiteSpace: "nowrap" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
