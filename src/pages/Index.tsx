import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, BarChart3, TrendingUp, Sprout, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import heroImage from "@/assets/hero-farm.jpg";

const stats = [
  { icon: ShieldCheck, label: "Detection Accuracy", value: "94%", change: "+12% vs baseline", positive: true },
  { icon: TrendingUp, label: "Yield Increase", value: "+23%", change: "Pilot results", positive: true },
  { icon: Users, label: "Farmers Connected", value: "2,450", change: "+180 this month", positive: true },
  { icon: Sprout, label: "Crops Monitored", value: "12", change: "Paddy, Sugarcane & more", positive: true },
];

const features = [
  {
    icon: Camera,
    title: "Disease Detection",
    desc: "Upload a crop image and get instant AI-powered disease identification with treatment recommendations.",
    path: "/detect",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BarChart3,
    title: "Price Forecast",
    desc: "30-day market price predictions using LSTM models trained on Tamil Nadu mandi data.",
    path: "/forecast",
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    icon: Sprout,
    title: "Crop Advice",
    desc: "Get AI-powered crop recommendations based on your soil, weather, and crop history.",
    path: "/recommend",
    color: "bg-agri-sky/10 text-agri-sky",
  },
];

export default function Index() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Lush paddy fields" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>
        <div className="relative container py-28 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm border border-primary/30">
              <Sprout className="h-4 w-4" />
              ML-Powered Smart Agriculture
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
              AgriConnect AI
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-lg leading-relaxed">
              Crop disease detection, market price forecasting, and personalized crop recommendations — all in one platform built for Tamil Nadu farmers.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full text-base px-8">
                <Link to="/detect">Try Disease Detection</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/forecast">View Forecasts</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container -mt-12 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Everything Farmers Need
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            An integrated platform combining AI disease detection, price prediction, and crop recommendations.
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Link
                to={f.path}
                className="group block glass-card rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-display font-bold">{f.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{f.desc}</p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  Explore →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem statement */}
      <section className="bg-accent/50 py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold">Why AgriConnect AI?</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Smallholder farmers in Tamil Nadu face 25–40% yield loss from undetected diseases, ±50% price fluctuations, and 22–35% income loss to middlemen. AgriConnect AI addresses all three with a unified, region-specific platform.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { label: "Yield Loss Prevented", value: "25-40%", sub: "via early disease detection" },
              { label: "Price Stability", value: "±50%", sub: "reduced via LSTM forecasting" },
              { label: "Better Crop Choices", value: "20-30%", sub: "via AI crop recommendations" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <p className="text-4xl font-display font-bold text-primary">{item.value}</p>
                <p className="mt-2 font-semibold">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>AgriConnect AI — Sasurie College of Engineering, Department of CSE</p>
          <p className="mt-1">Team: Haripriya V, Jeena D, Maheswari T, Revathi P | Supervisor: Dinesh M</p>
        </div>
      </footer>
    </div>
  );
}
