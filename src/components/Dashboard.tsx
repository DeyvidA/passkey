"use client";

import { useState } from "react";
import "./Dashboard.css";

interface User {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStoredData = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const credentials = JSON.parse(localStorage.getItem("credentials") || "[]");
    const userCredentials = credentials.filter(
      (c: any) => c.userId === user.id
    );

    return {
      totalUsers: users.length,
      userCredentials: userCredentials.length,
    };
  };

  const { totalUsers, userCredentials } = getStoredData();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🎉 Welcome, {user.displayName}!</h1>
          <button className="logout-button" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="info-card">
            <div className="card-icon">👤</div>
            <div className="card-content">
              <h3>User Profile</h3>
              <div className="profile-info">
                <div className="info-row">
                  <span className="label">Username:</span>
                  <span className="value">{user.username}</span>
                </div>
                <div className="info-row">
                  <span className="label">Display Name:</span>
                  <span className="value">{user.displayName}</span>
                </div>
                <div className="info-row">
                  <span className="label">User ID:</span>
                  <span className="value">{user.id}</span>
                </div>
                <div className="info-row">
                  <span className="label">Account Created:</span>
                  <span className="value">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">🔐</div>
            <div className="card-content">
              <h3>Security Information</h3>
              <div className="security-info">
                <div className="security-item">
                  <span className="security-label">Authentication Method:</span>
                  <span className="security-value">Passkey (WebAuthn)</span>
                </div>
                <div className="security-item">
                  <span className="security-label">Registered Passkeys:</span>
                  <span className="security-value">{userCredentials}</span>
                </div>
                <div className="security-item">
                  <span className="security-label">Last Login:</span>
                  <span className="security-value">Just now</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>System Statistics</h3>
              <div className="stats-info">
                <div className="stat-item">
                  <span className="stat-number">{totalUsers}</span>
                  <span className="stat-label">Total Users</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userCredentials}</span>
                  <span className="stat-label">Your Passkeys</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">⚙️</div>
            <div className="card-content">
              <h3>Account Actions</h3>
              <div className="actions">
                <button
                  className="action-button"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "Hide" : "Show"} Technical Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="technical-details">
            <h3>🔧 Technical Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <strong>Browser Support:</strong>
                <span>
                  {window.PublicKeyCredential
                    ? "✅ Supported"
                    : "❌ Not Supported"}
                </span>
              </div>
              <div className="detail-item">
                <strong>Platform:</strong>
                <span>{navigator.platform}</span>
              </div>
              <div className="detail-item">
                <strong>User Agent:</strong>
                <span>{navigator.userAgent.split(" ")[0]}</span>
              </div>
              <div className="detail-item">
                <strong>Session Storage:</strong>
                <span>localStorage (Demo only)</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
