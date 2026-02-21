import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  HeartPulse,
  Thermometer,
  Droplets,
  Activity,
  Shield,
  Phone,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const bpData = [
  { date: "Jan", systolic: 125, diastolic: 82 },
  { date: "Feb", systolic: 130, diastolic: 85 },
  { date: "Mar", systolic: 128, diastolic: 80 },
  { date: "Apr", systolic: 135, diastolic: 88 },
  { date: "May", systolic: 132, diastolic: 86 },
];

const hrData = [
  { date: "Jan", hr: 72 },
  { date: "Feb", hr: 78 },
  { date: "Mar", hr: 70 },
  { date: "Apr", hr: 85 },
  { date: "May", hr: 76 },
];

const visits = [
  { date: "May 2024", note: "Fever, cough, body pain. BP slightly high. Referred for blood test.", chew: "Amina B.", risk: "yellow" },
  { date: "Feb 2024", note: "Routine check. All vitals normal. Advised on nutrition.", chew: "Amina B.", risk: "green" },
  { date: "Oct 2023", note: "Headache and weakness. Given ORS. Recovered.", chew: "Emeka O.", risk: "green" },
];

const DoctorPatientView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Patient Record</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Patient Header */}
        <div className="bg-card rounded-xl p-5 card-shadow flex items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
            BA
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Bola Adeyemi</h2>
            <p className="text-sm text-muted-foreground">34 years · Female · ID: NG-CHW-2024-00048</p>
          </div>
        </div>

        {/* Risk + AI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-warning/15 border-2 border-warning/40 rounded-xl p-4 text-center animate-fade-in">
            <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-1" />
            <h3 className="text-lg font-bold text-warning-foreground">MEDIUM RISK</h3>
            <p className="text-xs text-muted-foreground mt-1">See within 24 hours</p>
          </div>

          <div className="bg-card rounded-xl p-4 card-shadow animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">AI Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fever, cough, body pain for 3 days. BP slightly elevated. Suspect malaria or URI. Needs blood test.
            </p>
          </div>
        </div>

        {/* Vitals */}
        <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Latest Vitals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Blood Pressure", value: "135/88", icon: HeartPulse, color: "text-danger" },
              { label: "Heart Rate", value: "85 bpm", icon: Activity, color: "text-primary" },
              { label: "Temperature", value: "38.5°C", icon: Thermometer, color: "text-accent" },
              { label: "Oxygen", value: "97%", icon: Droplets, color: "text-primary" },
            ].map((v) => (
              <div key={v.label} className="bg-secondary/50 rounded-xl p-3 text-center">
                <v.icon className={`w-5 h-5 mx-auto mb-1 ${v.color}`} />
                <p className="text-lg font-bold text-foreground">{v.value}</p>
                <p className="text-xs text-muted-foreground">{v.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage */}
        <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Coverage & Guarantor
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-medium text-foreground">NHIS (Government)</p>
            </div>
            <div>
              <p className="text-muted-foreground">NHIS Number</p>
              <p className="font-medium text-foreground">NHF-340291</p>
            </div>
            <div>
              <p className="text-muted-foreground">Guarantor</p>
              <p className="font-medium text-foreground">Alhaji Yusuf</p>
            </div>
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </p>
              <p className="font-medium text-foreground">0802-345-6789</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Blood Pressure Trend
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
                <Tooltip />
                <Line type="monotone" dataKey="systolic" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="diastolic" stroke="hsl(155,100%,27%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-danger" /> Heart Rate Trend
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={hrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(150,10%,45%)" />
                <Tooltip />
                <Line type="monotone" dataKey="hr" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visit History */}
        <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Visit History
          </h3>
          <div className="space-y-4">
            {visits.map((v, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      v.risk === "green" ? "bg-success" : v.risk === "yellow" ? "bg-warning" : "bg-danger"
                    }`}
                  />
                  {i < visits.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-foreground">{v.date}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{v.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">CHEW: {v.chew}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctor Action */}
        <div className="pb-6">
          <Button className="w-full h-12 text-base font-semibold rounded-xl">
            Add Outcome Note
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientView;
