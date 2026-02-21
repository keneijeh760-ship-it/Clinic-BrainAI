import { useNavigate } from "react-router-dom";
import { UserPlus, Users, Trophy, Heart, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Patients Today", value: "3", color: "text-primary" },
  { label: "Total Patients", value: "47", color: "text-foreground" },
  { label: "My Points", value: "235", color: "text-accent" },
];

const actions = [
  {
    title: "Register New Patient",
    description: "Capture health info for a new patient",
    icon: UserPlus,
    path: "/chew/new-patient",
    accent: "bg-primary/10 text-primary",
  },
  {
    title: "View My Patients",
    description: "See all patients you have registered",
    icon: Users,
    path: "/chew/dashboard",
    accent: "bg-accent/10 text-accent",
  },
  {
    title: "Leaderboard",
    description: "See top health workers this month",
    icon: Trophy,
    path: "/leaderboard",
    accent: "bg-warning/20 text-warning-foreground",
  },
];

const CHEWDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="hero-gradient px-4 pt-6 pb-10 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary-foreground" />
              <span className="font-bold text-primary-foreground">CHEWLink</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/")}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
          <h1 className="text-xl font-bold text-primary-foreground">
            Welcome back, Amina 👋
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Ikeja LGA Health Centre
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-3 text-center card-shadow animate-scale-in"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="w-full flex items-center gap-4 bg-card rounded-xl p-4 card-shadow hover:card-shadow-hover transition-shadow text-left"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${action.accent}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Recent Patients */}
        <div className="mt-6 mb-8">
          <h2 className="font-semibold text-foreground mb-3">Recent Patients</h2>
          <div className="space-y-2">
            {[
              { name: "Bola Adeyemi", age: 34, risk: "green" },
              { name: "Chidi Okafor", age: 56, risk: "yellow" },
              { name: "Fatima Yusuf", age: 28, risk: "green" },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-3 bg-card rounded-xl p-3 card-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-foreground">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">Age {p.age}</p>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${
                    p.risk === "green"
                      ? "bg-success"
                      : p.risk === "yellow"
                      ? "bg-warning"
                      : "bg-danger"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CHEWDashboard;
