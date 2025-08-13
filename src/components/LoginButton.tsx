"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import TunityLogo from "./TunityLogo";

export default function LoginButton() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    console.log("Google OAuth success:", credentialResponse);
    
    if (!credentialResponse?.credential) {
      console.error("No credential in response");
      alert("Authentication failed: No credential received");
      return;
    }

    try {
      console.log("Skipping API validation - using fake response for testing...");
      
      // FAKE RESPONSE FOR TESTING - SKIP API VALIDATION
      const fakeResponse = {
        success: true,
        user: {
          email: "test@tunity.com",
          name: "Test User",
          picture: "https://via.placeholder.com/40",
          roles: ["admin", "qa", "developer", "viewer"]
        },
        message: "Authentication successful"
      };
      
      console.log("Using fake backend response:", fakeResponse);
      
      if (fakeResponse.success) {
        // Store token for API calls
        localStorage.setItem("google_token", credentialResponse.credential);
        console.log("Authentication successful, redirecting to dashboard...");
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        console.error("Backend validation failed:", fakeResponse.message);
        alert(fakeResponse.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Authentication request failed:", error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              tunity
            </h1>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              Back Office
            </h2>
            <p className="text-sm text-gray-500">
              Sign in to manage streaming resources
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log("Login Failed")}
                text="signin_with"
                shape="rectangular"
                theme="outline"
                size="large"
              />
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-400">
                Secure authentication powered by Google
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-white/80">
            © 2025 Tunity. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
