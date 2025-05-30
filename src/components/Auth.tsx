"use client"

import { useState } from "react"
import "./Auth.css"

interface User {
  id: string
  username: string
  displayName: string
  createdAt: string
}

interface AuthProps {
  onLogin: (user: User) => void
}

// Helper function to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Helper function to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const checkPasskeySupport = () => {
    if (!window.PublicKeyCredential) {
      setError("Passkeys are not supported in this browser")
      return false
    }
    return true
  }

  const handleRegister = async () => {
    if (!checkPasskeySupport()) return
    if (!username.trim() || !displayName.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]")
      if (existingUsers.find((u: User) => u.username === username)) {
        setError("Username already exists")
        setLoading(false)
        return
      }

      const userId = crypto.randomUUID()
      const challenge = crypto.getRandomValues(new Uint8Array(32))

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Passkey Demo App",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: username,
          displayName: displayName,
        },
        pubKeyCredParams: [
          {
            alg: -7, // ES256
            type: "public-key",
          },
          {
            alg: -257, // RS256
            type: "public-key",
          },
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "direct",
      }

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      })) as PublicKeyCredential

      if (!credential) {
        throw new Error("Failed to create credential")
      }

      const response = credential.response as AuthenticatorAttestationResponse

      // Store user data and credential
      const newUser: User = {
        id: userId,
        username,
        displayName,
        createdAt: new Date().toISOString(),
      }

      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64(credential.rawId),
        response: {
          attestationObject: arrayBufferToBase64(response.attestationObject),
          clientDataJSON: arrayBufferToBase64(response.clientDataJSON),
        },
        type: credential.type,
      }

      // Save to localStorage (in a real app, this would be sent to a server)
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      const credentials = JSON.parse(localStorage.getItem("credentials") || "[]")
      credentials.push({ userId, credential: credentialData })
      localStorage.setItem("credentials", JSON.stringify(credentials))

      onLogin(newUser)
    } catch (err) {
      console.error("Registration failed:", err)
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!checkPasskeySupport()) return
    if (!username.trim()) {
      setError("Please enter your username")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Find user
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u: User) => u.username === username)

      if (!user) {
        setError("User not found")
        setLoading(false)
        return
      }

      // Get stored credentials for this user
      const credentials = JSON.parse(localStorage.getItem("credentials") || "[]")
      const userCredentials = credentials.filter((c: any) => c.userId === user.id)

      if (userCredentials.length === 0) {
        setError("No passkey found for this user")
        setLoading(false)
        return
      }

      const challenge = crypto.getRandomValues(new Uint8Array(32))

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: userCredentials.map((cred: any) => ({
          id: base64ToArrayBuffer(cred.credential.rawId),
          type: "public-key",
        })),
        userVerification: "required",
        timeout: 60000,
      }

      const assertion = (await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      })) as PublicKeyCredential

      if (!assertion) {
        throw new Error("Authentication failed")
      }

      // In a real app, you would verify the assertion on the server
      // For this demo, we'll just check if the credential ID matches
      const assertionId = arrayBufferToBase64(assertion.rawId)
      const matchingCredential = userCredentials.find((cred: any) => cred.credential.rawId === assertionId)

      if (!matchingCredential) {
        throw new Error("Invalid credential")
      }

      onLogin(user)
    } catch (err) {
      console.error("Login failed:", err)
      setError("Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
              setIsLogin(true)
              setError("")
            }}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false)
              setError("")
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
              <>{isLogin ? "🔓 Login with Passkey" : "🔐 Register with Passkey"}</>
            )}
          </button>
        </form>

        <div className="auth-info">
          <h3>What are Passkeys?</h3>
          <p>
            Passkeys are a secure, passwordless way to sign in using your device's built-in authentication like Face ID,
            Touch ID, or Windows Hello.
          </p>
        </div>
      </div>
    </div>
  )
}
