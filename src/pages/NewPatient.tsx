import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Activity,
  Thermometer,
  HeartPulse,
  Droplets,
  Shield,
  Phone,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const symptomsList = [
  { id: "fever", label: "🤒 Fever", icon: Thermometer },
  { id: "cough", label: "😷 Cough", icon: null },
  { id: "headache", label: "🤕 Headache", icon: null },
  { id: "body-pain", label: "💪 Body Pain", icon: null },
  { id: "breathing", label: "😤 Hard to Breathe", icon: null },
  { id: "diarrhea", label: "🚽 Diarrhea", icon: null },
  { id: "vomiting", label: "🤮 Vomiting", icon: null },
  { id: "rash", label: "🔴 Skin Rash", icon: null },
  { id: "weakness", label: "😩 Very Weak", icon: null },
  { id: "bleeding", label: "🩸 Bleeding", icon: null },
];

const steps = ["Personal Info", "Vitals", "Symptoms", "Coverage", "Emergency"];

const NewPatient = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    navigate("/chew/patient-result");
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => (currentStep > 0 ? prevStep() : navigate(-1))}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">New Patient</h1>
            <p className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length} — {steps[currentStep]}
            </p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-lg mx-auto px-4 mt-3">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 animate-fade-in">
        {/* Step 0: Personal Info */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-5 card-shadow space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Personal Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">First Name</Label>
                  <Input placeholder="e.g. Bola" className="mt-1 h-11" />
                </div>
                <div>
                  <Label className="text-sm">Last Name</Label>
                  <Input placeholder="e.g. Adeyemi" className="mt-1 h-11" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Age</Label>
                  <Input placeholder="e.g. 34" type="number" className="mt-1 h-11" />
                </div>
                <div>
                  <Label className="text-sm">Sex</Label>
                  <div className="flex gap-2 mt-1">
                    <Button variant="outline" className="flex-1 h-11">Male</Button>
                    <Button variant="outline" className="flex-1 h-11">Female</Button>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm">Community / Village</Label>
                <Input placeholder="e.g. Agege, Lagos" className="mt-1 h-11" />
              </div>
              <div>
                <Label className="text-sm">Phone Number (optional)</Label>
                <Input placeholder="080XXXXXXXX" type="tel" className="mt-1 h-11" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Vitals */}
        {currentStep === 1 && (
          <div className="bg-card rounded-xl p-5 card-shadow space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Vitals</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the readings from your tools. Leave blank if you can't measure.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-danger" /> Blood Pressure
                </Label>
                <Input placeholder="e.g. 120/80" className="mt-1 h-11" />
              </div>
              <div>
                <Label className="text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" /> Heart Rate
                </Label>
                <Input placeholder="e.g. 72 bpm" className="mt-1 h-11" />
              </div>
              <div>
                <Label className="text-sm flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-accent" /> Temperature
                </Label>
                <Input placeholder="e.g. 37.2°C" className="mt-1 h-11" />
              </div>
              <div>
                <Label className="text-sm flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-primary" /> Oxygen Level
                </Label>
                <Input placeholder="e.g. 98%" className="mt-1 h-11" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Weight (kg)</Label>
              <Input placeholder="e.g. 65" className="mt-1 h-11" />
            </div>
          </div>
        )}

        {/* Step 2: Symptoms */}
        {currentStep === 2 && (
          <div className="bg-card rounded-xl p-5 card-shadow space-y-4">
            <h2 className="font-semibold text-foreground">What is the patient feeling?</h2>
            <p className="text-sm text-muted-foreground">Tap all that apply</p>
            <div className="grid grid-cols-2 gap-2">
              {symptomsList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSymptom(s.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-all ${
                    selectedSymptoms.includes(s.id)
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {selectedSymptoms.includes(s.id) && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            <div>
              <Label className="text-sm">Other symptoms (type here)</Label>
              <Input placeholder="Describe anything else..." className="mt-1 h-11" />
            </div>
          </div>
        )}

        {/* Step 3: Coverage */}
        {currentStep === 3 && (
          <div className="bg-card rounded-xl p-5 card-shadow space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Insurance & Payment</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Who will pay for this patient's care?
            </p>
            <div className="space-y-2">
              {["NHIS (Government Insurance)", "HMO / Private Insurance", "Self Pay (Out of Pocket)", "Community Fund", "Don't Know"].map(
                (opt) => (
                  <button
                    key={opt}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-card hover:border-primary/40 text-left text-sm transition-all"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />
                    <span>{opt}</span>
                  </button>
                )
              )}
            </div>
            <div>
              <Label className="text-sm">Guarantor Name</Label>
              <Input placeholder="Name of person responsible" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">Guarantor Phone</Label>
              <Input placeholder="080XXXXXXXX" type="tel" className="mt-1 h-11" />
            </div>
          </div>
        )}

        {/* Step 4: Emergency */}
        {currentStep === 4 && (
          <div className="bg-card rounded-xl p-5 card-shadow space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-5 h-5 text-danger" />
              <h2 className="font-semibold text-foreground">Emergency Contact</h2>
            </div>
            <div>
              <Label className="text-sm">Contact Name</Label>
              <Input placeholder="e.g. Mama Bola" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">Relationship</Label>
              <Input placeholder="e.g. Mother, Husband" className="mt-1 h-11" />
            </div>
            <div>
              <Label className="text-sm">Phone Number</Label>
              <Input placeholder="080XXXXXXXX" type="tel" className="mt-1 h-11" />
            </div>
          </div>
        )}

        {/* Navigation Button */}
        <div className="mt-6 pb-6">
          <Button onClick={nextStep} className="w-full h-12 text-base font-semibold rounded-xl">
            {currentStep < steps.length - 1 ? (
              <span className="flex items-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </span>
            ) : (
              "Submit & Generate Report"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewPatient;
