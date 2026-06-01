import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "../backend";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import Logosvg from "../assets/logo.svg";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { actor } = useActor();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDemo, setSelectedDemo] = useState("");
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.navigate({
        to:
          user.role === "Investor"
            ? "/investor/dashboard"
            : "/borrower/dashboard",
      });
    }
  }, [user, router]);

  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getUsersByRole("Investor"),
      actor.getUsersByRole("Borrower"),
    ])
      .then(([investors, borrowers]) => {
        const allUsers = [...investors, ...borrowers];
        const seedUsers = allUsers.filter(
          (u) =>
            (u.name.startsWith("Investor ") || u.name.startsWith("Borrower ")) &&
            u.email.endsWith("@email.com")
        );
        setDemoUsers(seedUsers);
      })
      .catch(() => { });
  }, [actor]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Backend connection is not ready, please try again later");
      return;
    }

    setIsLoading(true);
    try {
      let foundUser: User | null = null;

      if (selectedDemo) {
        const demoUserId = BigInt(selectedDemo);
        foundUser = await actor.loginUserById(demoUserId, "password123");
      } else {
        if (!email || !password) {
          toast.error("Please enter email and password.");
          setIsLoading(false);
          return;
        }
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();
        foundUser = await actor.loginUser(trimmedEmail, trimmedPassword);
      }

      if (!foundUser) {
        toast.error("Invalid email or password.");
        setIsLoading(false);
        return;
      }

      login({
        userId: String(foundUser.id),
        role: foundUser.role,
        name: foundUser.name,
      });
      toast.success(`Welcome, ${foundUser.name}!`);
      router.navigate({
        to:
          foundUser.role === "Investor"
            ? "/investor/dashboard"
            : "/borrower/dashboard",
      });
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#e8eef3" }}>
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Panel biru muda */}
        <div
          style={{
            backgroundColor: "rgba(0, 85, 150, 0.1)",
            backdropFilter: "blur(2px)",
            borderRadius: "2rem",
            padding: "3rem 4rem",
            width: "100%",
            maxWidth: "900px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "500px",
          }}
        >
          <Card className="w-full rounded-2xl shadow-md" style={{ maxWidth: "420px" }}>
            <CardContent className="pt-8 pb-6 px-8">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img src={Logosvg} width={60} height={60} alt="SODALIS logo" />
              </div>

              <h2 className="text-xl font-bold mb-4" style={{ color: "#1a3a5c" }}>
                Login
              </h2>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm" style={{ color: "#1a3a5c" }}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg text-sm"
                    data-ocid="login.input"
                  />
                </div>

                {demoUsers.length > 0 && (
                  <div className="space-y-1 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs font-semibold text-amber-700">
                      💡 Demo Mode: Choose an available account
                    </p>
                    <Select
                      value={selectedDemo}
                      onValueChange={(val) => {
                        if (val === "custom_login") {
                          setSelectedDemo("");
                        } else {
                          setSelectedDemo(val);
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-lg" data-ocid="login.select">
                        <SelectValue placeholder="Select demo account..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDemo && (
                          <SelectItem value="custom_login" className="text-red-500 font-semibold">
                            ❌ Clear Selection (Use Credentials)
                          </SelectItem>
                        )}
                        {demoUsers.map((u) => (
                          <SelectItem key={String(u.id)} value={String(u.id)}>
                            {u.name} ({u.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm" style={{ color: "#1a3a5c" }}>
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!selectedDemo}
                    className="rounded-lg text-sm"
                    data-ocid="login.password_input"
                  />
                </div>

                <p className="text-xs" style={{ color: "#4a7a9b" }}>
                  Forgot Password?
                </p>

                <Button
                  type="submit"
                  disabled={isLoading || (!email && !selectedDemo)}
                  className="w-full rounded-lg text-white font-semibold py-5 mt-1"
                  style={{ backgroundColor: "#1a3a5c" }}
                  data-ocid="login.submit_button"
                >
                  {isLoading ? "Processing..." : "Sign In"}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Don't have an account yet?{" "}
                <Link
                  to="/register"
                  className="font-semibold hover:underline"
                  style={{ color: "#1a6bbf" }}
                  data-ocid="login.register_link"
                >
                  Register for free
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
