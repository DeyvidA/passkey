"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import "./Auth.css";

interface User {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
}

interface AuthProps {
  onLogin: (user: User) => void;
}

// Helper function to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper function to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkPasskeySupport = () => {
    if (!window.PublicKeyCredential) {
      setError("Passkeys are not supported in this browser");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {};

  const handleLogin = async () => {};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔐 Passkey Auth</h1>
          <p>Secure passwordless authentication</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-button"
            onClick={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner"></span>
                {isLogin ? "Authenticating..." : "Creating Account..."}
              </span>
            ) : (
              <>
                {isLogin ? "🔓 Login with Passkey" : "🔐 Register with Passkey"}
              </>
            )}
          </button>
        </form>

        <div className="auth-info">
          <h3>What are Passkeys?</h3>
          <p>
            Passkeys are a secure, passwordless way to sign in using your
            device's built-in authentication like Face ID, Touch ID, or Windows
            Hello.
          </p>
        </div>
      </div>
    </div>
  );
}
