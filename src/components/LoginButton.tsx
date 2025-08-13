"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

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
      console.log("Sending validation request to backend...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: credentialResponse.credential }),
        }
      );

      console.log("Backend response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        alert(`Authentication failed: ${response.status} - ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log("Backend response data:", data);
      
      if (data.success) {
        // Store token for API calls
        localStorage.setItem("google_token", credentialResponse.credential);
        console.log("Authentication successful, redirecting to dashboard...");
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        console.error("Backend validation failed:", data.message);
        alert(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Authentication request failed:", error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Tunity Back Office
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log("Login Failed")}
            text="signin_with"
            shape="rectangular"
            theme="outline"
          />
        </div>
      </div>
    </div>
  );
}
