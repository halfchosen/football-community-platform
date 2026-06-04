import { signInWithGoogle } from "@/server/actions/auth/oauth";
import { Button } from "@/components/ui/button";

export function SocialLoginButton() {
  return (
    <form action={signInWithGoogle}>
      <Button className="w-full" type="submit" variant="secondary">
        Continue with Google
      </Button>
    </form>
  );
}
