import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"chew" | "doctor" | null>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "chew") navigate("/chew/dashboard");
    else navigate("/doctor/patient/1");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl hero-gradient mb-4">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CHEWLink</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Connecting communities to better healthcare
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <p className="text-sm font-medium text-foreground mb-3 text-center">
            Who are you?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("chew")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "chew"
                  ? "border-primary bg-primary/5 card-shadow-hover"
                  : "border-border bg-card card-shadow hover:border-primary/40"
              }`}
            >
              <Users className={`w-7 h-7 ${role === "chew" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-semibold ${role === "chew" ? "text-primary" : "text-foreground"}`}>
                Health Worker
              </span>
              <span className="text-xs text-muted-foreground">CHEW</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "doctor"
                  ? "border-primary bg-primary/5 card-shadow-hover"
                  : "border-border bg-card card-shadow hover:border-primary/40"
              }`}
            >
              <Stethoscope className={`w-7 h-7 ${role === "doctor" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-semibold ${role === "doctor" ? "text-primary" : "text-foreground"}`}>
                Doctor
              </span>
              <span className="text-xs text-muted-foreground">Physician</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        {role && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div className="bg-card rounded-xl p-5 card-shadow space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="080XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1.5 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="pin" className="text-sm font-medium">
                  PIN
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter your 4-digit PIN"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="mt-1.5 h-12 text-base"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl">
              Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Don't have an account? Contact your supervisor
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
