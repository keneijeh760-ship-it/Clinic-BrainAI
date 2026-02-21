import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle, QrCode, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";

const PatientResult = () => {
  const navigate = useNavigate();
  const patientId = "NG-CHW-2024-00048";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/chew/dashboard")}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">Patient Report</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Success Banner */}
        <div className="bg-success/10 border-2 border-success/30 rounded-xl p-4 flex items-start gap-3 animate-scale-in">
          <CheckCircle className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Patient Registered!</p>
            <p className="text-sm text-muted-foreground">You earned +5 points for this registration</p>
          </div>
        </div>

        {/* Risk Badge */}
        <div className="animate-fade-in">
          <div className="bg-warning/15 border-2 border-warning/40 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-warning-foreground">MEDIUM RISK</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This patient should see a doctor within 24 hours
            </p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-card rounded-xl p-5 card-shadow animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-foreground">AI Health Summary</h3>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4 text-sm leading-relaxed text-foreground">
            <p>
              <strong>Bola Adeyemi, 34, Female</strong> — presented with fever (38.5°C),
              cough, and body pain for 3 days. Blood pressure is slightly high at 135/88.
              Oxygen level is normal at 97%.
            </p>
            <p className="mt-2">
              <strong>Possible concerns:</strong> Could be malaria, upper respiratory
              infection, or early typhoid. The high BP needs monitoring.
            </p>
            <p className="mt-2">
              <strong>What to do:</strong> Patient should visit the nearest health facility
              for blood test (malaria RDT + full blood count). Keep drinking water and rest.
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-card rounded-xl p-5 card-shadow text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-3">
            <QrCode className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Patient Health ID</h3>
          </div>
          <div className="inline-block bg-card p-4 rounded-xl border border-border">
            <QRCodeSVG
              value={`https://chewlink.ng/patient/${patientId}`}
              size={180}
              fgColor="hsl(155, 100%, 27%)"
              bgColor="transparent"
            />
          </div>
          <p className="text-sm font-mono text-muted-foreground mt-3">{patientId}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Doctor can scan this to see full patient record
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => navigate("/chew/dashboard")}
          >
            Back to Home
          </Button>
          <Button className="flex-1 h-12 rounded-xl">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatientResult;
