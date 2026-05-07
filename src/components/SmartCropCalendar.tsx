import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sprout,
  Droplets,
  Leaf,
  ShieldAlert,
  Wheat,
  CalendarDays,
  Bell,
  BellRing,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

interface Stage {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  titleEn: string;
  titleTa: string;
  startDay: number; // days from sowing
  endDay: number;
  detailsEn: string;
  detailsTa: string;
  alertEn?: string;
  alertTa?: string;
  color: string; // tailwind text/bg accent
}

interface CropProfile {
  durationDays: number;
  sowingSeasonEn: string;
  sowingSeasonTa: string;
  stages: Stage[];
}

// Crop-specific cultivation profiles tuned for Tamil Nadu
const CROP_PROFILES: Record<string, CropProfile> = {
  paddy: {
    durationDays: 130,
    sowingSeasonEn: "Kuruvai (Jun–Jul) / Samba (Aug–Sep)",
    sowingSeasonTa: "குறுவை (ஜூன்–ஜூலை) / சம்பா (ஆக–செப்)",
    stages: [
      { key: "sow", icon: Sprout, titleEn: "Sowing & Transplanting", titleTa: "விதைப்பு & நடவு",
        startDay: 0, endDay: 25,
        detailsEn: "Soak seeds 24h. Transplant 21–25 day seedlings at 20×15 cm spacing.",
        detailsTa: "விதைகளை 24 மணி ஊறவைக்கவும். 21–25 நாள் நாற்றுகளை 20×15 செ.மீ. இடைவெளியில் நடவு செய்க.",
        color: "text-primary bg-primary/10" },
      { key: "irrig", icon: Droplets, titleEn: "Irrigation Schedule", titleTa: "பாசன அட்டவணை",
        startDay: 0, endDay: 110,
        detailsEn: "Maintain 2–5 cm standing water until panicle initiation; drain 10 days before harvest.",
        detailsTa: "கதிர் வெளிவரும் வரை 2–5 செ.மீ. நீர் தேக்கி வைக்கவும்; அறுவடைக்கு 10 நாள் முன் வடிக்கவும்.",
        alertEn: "Skip irrigation if rainfall >25mm/day.",
        alertTa: "மழை 25மிமீ/நாள் தாண்டினால் பாசனம் தவிர்க்கவும்.",
        color: "text-agri-sky bg-agri-sky/10" },
      { key: "fert", icon: Leaf, titleEn: "Fertilizer Application", titleTa: "உரம் இடுதல்",
        startDay: 15, endDay: 65,
        detailsEn: "Basal NPK at transplant. Top-dress urea at 20 & 45 DAT. Apply potash at panicle stage.",
        detailsTa: "நடவின்போது அடியுரம் NPK. 20 & 45 நாட்களில் யூரியா மேலுரம். கதிர் காலத்தில் பொட்டாஷ் இடவும்.",
        alertEn: "Reminder: Top-dress urea on Day 20 and Day 45.",
        alertTa: "நினைவூட்டல்: 20 & 45-ம் நாள் யூரியா இடவும்.",
        color: "text-secondary bg-secondary/10" },
      { key: "pest", icon: ShieldAlert, titleEn: "Pest & Disease Watch", titleTa: "பூச்சி & நோய் கண்காணிப்பு",
        startDay: 30, endDay: 100,
        detailsEn: "Watch for stem borer, leaf folder, blast, BLB. Scout fields weekly.",
        detailsTa: "தண்டு துளைப்பான், இலை சுருட்டு, இலை வெடிப்பு, BLB-ஐ கவனிக்கவும். வாரத்திற்கு ஒருமுறை வயல் ஆய்வு.",
        alertEn: "Spray neem oil at first sight of larvae.",
        alertTa: "புழுக்களை கண்டவுடன் வேப்பெண்ணெய் தெளிக்கவும்.",
        color: "text-destructive bg-destructive/10" },
      { key: "harvest", icon: Wheat, titleEn: "Harvest", titleTa: "அறுவடை",
        startDay: 115, endDay: 130,
        detailsEn: "Harvest when 80% grains turn straw-yellow. Moisture ~20%.",
        detailsTa: "80% தானியம் வைக்கோல் மஞ்சள் ஆனதும் அறுவடை. ஈரப்பதம் ~20%.",
        color: "text-agri-gold bg-agri-gold/10" },
    ],
  },
  sugarcane: {
    durationDays: 330,
    sowingSeasonEn: "Dec–Feb (early) / Jun–Jul (Adi)",
    sowingSeasonTa: "டிச–பிப் (ஆரம்பம்) / ஜூன்–ஜூலை (ஆடி)",
    stages: [
      { key: "sow", icon: Sprout, titleEn: "Setts Planting", titleTa: "கன்று நடவு",
        startDay: 0, endDay: 30,
        detailsEn: "Plant 3-budded setts in furrows 90 cm apart. Treat with carbendazim.",
        detailsTa: "3-முகுள கன்றுகளை 90 செ.மீ. சால்களில் நடவு. கார்பெண்டாசிம் சிகிச்சை.",
        color: "text-primary bg-primary/10" },
      { key: "irrig", icon: Droplets, titleEn: "Irrigation", titleTa: "பாசனம்",
        startDay: 0, endDay: 300,
        detailsEn: "Weekly in summer, 10–14 days in winter. Drip preferred.",
        detailsTa: "கோடையில் வாரம் ஒருமுறை, குளிரில் 10–14 நாள். துளி பாசனம் சிறந்தது.",
        color: "text-agri-sky bg-agri-sky/10" },
      { key: "fert", icon: Leaf, titleEn: "Fertilizer Splits", titleTa: "உர பிரிவுகள்",
        startDay: 30, endDay: 150,
        detailsEn: "N in 3 splits (30, 60, 120 DAP). Full P basal, K in 2 splits.",
        detailsTa: "தழைச்சத்தை 3 பிரிவாக (30, 60, 120 நாட்கள்). பாஸ்பரஸ் முழுவதும் அடியுரம்.",
        alertEn: "Reminder: 60 DAP nitrogen top-dress is critical.",
        alertTa: "நினைவூட்டல்: 60-ம் நாள் தழைச்சத்து மேலுரம் முக்கியம்.",
        color: "text-secondary bg-secondary/10" },
      { key: "pest", icon: ShieldAlert, titleEn: "Pest Monitoring", titleTa: "பூச்சி கண்காணிப்பு",
        startDay: 60, endDay: 280,
        detailsEn: "Watch for early shoot borer, woolly aphid, red rot.",
        detailsTa: "ஆரம்ப தண்டு துளைப்பான், கம்பளி அசுவினி, சிவப்பு அழுகலை கண்காணிக்கவும்.",
        color: "text-destructive bg-destructive/10" },
      { key: "harvest", icon: Wheat, titleEn: "Harvest", titleTa: "அறுவடை",
        startDay: 300, endDay: 330,
        detailsEn: "Harvest at 11–12 months when brix >18%.",
        detailsTa: "11–12 மாதங்களில், பிரிக்ஸ் 18%-க்கு மேல் இருக்கும்போது அறுவடை.",
        color: "text-agri-gold bg-agri-gold/10" },
    ],
  },
  groundnut: {
    durationDays: 110,
    sowingSeasonEn: "Jun–Jul (Kharif) / Dec–Jan (Rabi)",
    sowingSeasonTa: "ஜூன்–ஜூலை / டிச–ஜனவரி",
    stages: [
      { key: "sow", icon: Sprout, titleEn: "Sowing", titleTa: "விதைப்பு",
        startDay: 0, endDay: 10,
        detailsEn: "Sow at 30×10 cm. Treat seeds with Rhizobium + Trichoderma.",
        detailsTa: "30×10 செ.மீ. இடைவெளியில் விதை. ரைசோபியம் + டிரைக்கோடெர்மா சிகிச்சை.",
        color: "text-primary bg-primary/10" },
      { key: "irrig", icon: Droplets, titleEn: "Irrigation", titleTa: "பாசனம்",
        startDay: 0, endDay: 95,
        detailsEn: "Critical at flowering (35 DAS) and pegging (55 DAS).",
        detailsTa: "பூக்கும் (35 நாள்) மற்றும் காய்பிடிக்கும் (55 நாள்) நிலை முக்கியம்.",
        color: "text-agri-sky bg-agri-sky/10" },
      { key: "fert", icon: Leaf, titleEn: "Fertilizer", titleTa: "உரம்",
        startDay: 0, endDay: 45,
        detailsEn: "Basal 20:40:40 NPK + gypsum at flowering for pod filling.",
        detailsTa: "அடியுரம் 20:40:40 NPK + பூக்கும் காலத்தில் ஜிப்சம்.",
        alertEn: "Apply gypsum on Day 40 for better pods.",
        alertTa: "40-ம் நாள் ஜிப்சம் இடவும் — காய் பருமன் அதிகரிக்கும்.",
        color: "text-secondary bg-secondary/10" },
      { key: "pest", icon: ShieldAlert, titleEn: "Pest Watch", titleTa: "பூச்சி கண்காணிப்பு",
        startDay: 25, endDay: 90,
        detailsEn: "Leaf miner, tikka leaf spot, bud necrosis. Spray mancozeb if needed.",
        detailsTa: "இலை சுரங்கப்புழு, டிக்கா புள்ளி நோய், மொட்டு நோய். தேவையானால் மான்கோசெப் தெளி.",
        color: "text-destructive bg-destructive/10" },
      { key: "harvest", icon: Wheat, titleEn: "Harvest", titleTa: "அறுவடை",
        startDay: 100, endDay: 110,
        detailsEn: "Harvest when leaves yellow & inner pod shells darken.",
        detailsTa: "இலைகள் மஞ்சளானதும், காய் உள்ளுறை கருத்ததும் அறுவடை.",
        color: "text-agri-gold bg-agri-gold/10" },
    ],
  },
};

const DEFAULT_PROFILE: CropProfile = {
  durationDays: 120,
  sowingSeasonEn: "Best at season onset for Tamil Nadu",
  sowingSeasonTa: "தமிழ்நாட்டின் பருவ துவக்கத்தில் சிறந்தது",
  stages: [
    { key: "sow", icon: Sprout, titleEn: "Sowing", titleTa: "விதைப்பு",
      startDay: 0, endDay: 15,
      detailsEn: "Prepare field, treat seeds, sow at recommended spacing.",
      detailsTa: "வயலை தயாரிக்கவும், விதை சிகிச்சை, பரிந்துரைக்கப்பட்ட இடைவெளியில் விதைக்கவும்.",
      color: "text-primary bg-primary/10" },
    { key: "irrig", icon: Droplets, titleEn: "Irrigation", titleTa: "பாசனம்",
      startDay: 0, endDay: 100,
      detailsEn: "Light, frequent irrigation early; deep irrigation at flowering.",
      detailsTa: "ஆரம்பத்தில் இலேசான பாசனம்; பூக்கும் காலத்தில் ஆழமான பாசனம்.",
      color: "text-agri-sky bg-agri-sky/10" },
    { key: "fert", icon: Leaf, titleEn: "Fertilizer", titleTa: "உரம்",
      startDay: 10, endDay: 60,
      detailsEn: "Basal NPK + 2 split top-dressings of N.",
      detailsTa: "அடியுரம் NPK + தழைச்சத்து 2 பிரிவாக மேலுரம்.",
      alertEn: "Reminder: Mid-season top-dress around Day 30.",
      alertTa: "நினைவூட்டல்: 30-ம் நாள் மேலுரம் இடவும்.",
      color: "text-secondary bg-secondary/10" },
    { key: "pest", icon: ShieldAlert, titleEn: "Pest & Disease Watch", titleTa: "பூச்சி & நோய் கண்காணிப்பு",
      startDay: 25, endDay: 100,
      detailsEn: "Scout weekly. Use IPM — neem, pheromone traps, biocontrols.",
      detailsTa: "வாரம் ஒருமுறை ஆய்வு. IPM — வேப்பு, பெரோமோன் பொறிகள், உயிரியக்க கட்டுப்பாடு.",
      color: "text-destructive bg-destructive/10" },
    { key: "harvest", icon: Wheat, titleEn: "Harvest", titleTa: "அறுவடை",
      startDay: 105, endDay: 120,
      detailsEn: "Harvest at physiological maturity for best yield & quality.",
      detailsTa: "உடலியல் முதிர்ச்சியில் அறுவடை — சிறந்த விளைச்சல் & தரம்.",
      color: "text-agri-gold bg-agri-gold/10" },
  ],
};

function getProfile(crop: string): CropProfile {
  const k = crop.toLowerCase();
  if (k.includes("paddy") || k.includes("rice") || k.includes("நெல்")) return CROP_PROFILES.paddy;
  if (k.includes("sugar") || k.includes("கரும்")) return CROP_PROFILES.sugarcane;
  if (k.includes("groundnut") || k.includes("peanut") || k.includes("நிலக்கடலை")) return CROP_PROFILES.groundnut;
  return DEFAULT_PROFILE;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function fmt(d: Date, lang: "en" | "ta") {
  return d.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function SmartCropCalendar({ crop }: { crop: string }) {
  const { lang } = useLanguage();
  const profile = useMemo(() => getProfile(crop), [crop]);
  const [sowingDate, setSowingDate] = useState<Date>(new Date());
  const [reminders, setReminders] = useState<Set<string>>(new Set());

  const isTa = lang === "ta";
  const harvestDate = addDays(sowingDate, profile.durationDays);

  const toggleReminder = (key: string, label: string) => {
    setReminders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        toast.info(isTa ? "நினைவூட்டல் நீக்கப்பட்டது" : "Reminder removed");
      } else {
        next.add(key);
        toast.success(
          isTa ? `🔔 நினைவூட்டல் அமைக்கப்பட்டது: ${label}` : `🔔 Reminder set: ${label}`,
        );
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="glass-card rounded-2xl p-6 mt-2"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-display font-bold">
              {isTa ? "ஸ்மார்ட் பயிர் காலண்டர்" : "Smart Crop Calendar"} · {crop}
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            {isTa ? "பருவம்:" : "Season:"}{" "}
            <span className="font-medium text-foreground">
              {isTa ? profile.sowingSeasonTa : profile.sowingSeasonEn}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {isTa ? "விதைப்பு நாள்:" : "Sowing date:"}
            </span>
            <input
              type="date"
              value={sowingDate.toISOString().slice(0, 10)}
              onChange={(e) => setSowingDate(new Date(e.target.value))}
              className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
            />
          </label>
          <div className="rounded-lg bg-agri-gold/10 text-agri-gold px-3 py-1.5 font-medium flex items-center gap-1.5">
            <Wheat className="h-4 w-4" />
            {isTa ? "அறுவடை:" : "Harvest:"} {fmt(harvestDate, lang)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-agri-gold"
          />
        </div>
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{isTa ? "நாள் 0" : "Day 0"}</span>
          <span>{isTa ? `நாள் ${profile.durationDays}` : `Day ${profile.durationDays}`}</span>
        </div>
      </div>

      {/* Timeline */}
      <ol className="mt-6 relative border-l-2 border-dashed border-border ml-3 space-y-5">
        {profile.stages.map((stage, i) => {
          const Icon = stage.icon;
          const start = addDays(sowingDate, stage.startDay);
          const end = addDays(sowingDate, stage.endDay);
          const title = isTa ? stage.titleTa : stage.titleEn;
          const details = isTa ? stage.detailsTa : stage.detailsEn;
          const alertText = isTa ? stage.alertTa : stage.alertEn;
          const reminderKey = `${crop}-${stage.key}`;
          const hasReminder = reminders.has(reminderKey);
          const reminderable = stage.key === "fert" || stage.key === "harvest";

          return (
            <motion.li
              key={stage.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="ml-6 relative"
            >
              <span className={`absolute -left-[2.1rem] flex h-9 w-9 items-center justify-center rounded-full ring-4 ring-background ${stage.color}`}>
                <Icon className="h-4 w-4" />
              </span>

              <div className="rounded-xl border border-border bg-card/40 p-4 hover:bg-card/70 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {title}
                      <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmt(start, lang)} → {fmt(end, lang)}
                      <span className="ml-2 opacity-70">
                        ({isTa ? "நாள்" : "Day"} {stage.startDay}–{stage.endDay})
                      </span>
                    </p>
                  </div>
                  {reminderable && (
                    <Button
                      size="sm"
                      variant={hasReminder ? "default" : "outline"}
                      className="rounded-full h-8 text-xs"
                      onClick={() => toggleReminder(reminderKey, title)}
                    >
                      {hasReminder ? (
                        <BellRing className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <Bell className="h-3.5 w-3.5 mr-1" />
                      )}
                      {hasReminder
                        ? isTa ? "அமைக்கப்பட்டது" : "Reminder on"
                        : isTa ? "நினைவூட்டு" : "Remind me"}
                    </Button>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed">{details}</p>

                {alertText && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-secondary/10 border border-secondary/30 px-3 py-2 text-xs text-secondary-foreground">
                    <BellRing className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <span>{alertText}</span>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>

      <p className="mt-5 text-[11px] text-muted-foreground italic">
        {isTa
          ? "குறிப்பு: காலண்டர் தமிழ்நாடு வேளாண் சூழலுக்கு ஏற்ற பொதுவான வழிகாட்டி. உள்ளூர் வேளாண் அலுவலரை அணுகவும்."
          : "Note: Calendar is general guidance tuned for Tamil Nadu. Consult your local agri-officer for field-specific advice."}
      </p>
    </motion.div>
  );
}
