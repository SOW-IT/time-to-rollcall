import { signInWithPopup } from "firebase/auth";
import { auth, microsoftProvider } from "@/lib/firebase";

export default function SignInButton() {
  const signInWithMicrosoft = async () => {
    try {
      await signInWithPopup(auth, microsoftProvider);
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  return (
    <button
      type="button"
      className="rounded-full text-gray-600 bg-transparent border hover:bg-gray-300 active:bg-gray-300 border-gray-600 font-medium text-xs px-3 py-2"
      onClick={signInWithMicrosoft}
    >
      Sign-in
    </button>
  );
}
