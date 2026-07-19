import { FormEvent, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Church, LockKeyhole } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginScreenProps {
  role: "user" | "admin";
}

export function LoginScreen({ role }: LoginScreenProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isAdmin = role === "admin";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const isValid = login(role, username.trim(), password);
    if (!isValid) {
      setError("Invalid username or password.");
      return;
    }

    void navigate({ to: isAdmin ? "/dashboard" : "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="panel-surface w-full max-w-md rounded-xl">
        <CardHeader className="items-center text-center">
          <span className="parish-gradient grid size-14 place-items-center rounded-full text-primary-foreground shadow-lg">
            {isAdmin ? <LockKeyhole className="size-7" /> : <Church className="size-7" />}
          </span>
          <CardTitle className="text-2xl">
            {isAdmin ? "Admin Login" : "Parish Census Login"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Enter admin credentials to access the dashboard and census records."
              : "Enter user credentials to open the census data collection form."}
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor={`${role}-username`}>Username</Label>
              <Input
                id={`${role}-username`}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${role}-password`}>Password</Label>
              <Input
                id={`${role}-password`}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
                required
              />
            </div>

            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={() => void navigate({ to: isAdmin ? "/" : "/dashboard" })}
            >
              {isAdmin ? "Go to user login instead" : "Go to admin login instead"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
