import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, BarChart3, TrendingUp, Sprout, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import heroImage from "@/assets/hero-farm.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Index() {
  const { t } = useLanguage();

  const stats = [
    { icon: ShieldCheck, label: t("stat_accuracy"), value: "94%", change: t("stat_accuracy_sub"), positive: true },
    { icon: TrendingUp, label: t("stat_yield"), value: "+23%", change: t("stat_yield_sub"), positive: true },
    { icon: Users, label: t("stat_farmers"), value: "2,450", change: t("stat_farmers_sub"), positive: true },
    { icon: Sprout, label: t("stat_crops"), value: "12", change: t("stat_crops_sub"), positive: true },
  ];

  const features = [
    {
      icon: Camera,
      title: t("feature_disease_title"),
      desc: t("feature_disease_desc"),
      path: "/detect",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: BarChart3,
      title: t("feature_forecast_title"),
      desc: t("feature_forecast_desc"),
      path: "/forecast",
      color: "bg-secondary/20 text-secondary-foreground",
    },
    {
      icon: Sprout,
      title: t("feature_advice_title"),
      desc: t("feature_advice_desc"),
      path: "/recommend",
      color: "bg-agri-sky/10 text-agri-sky",
    },
  ];

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
              {t("hero_badge")}
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight">
              {t("hero_title")}
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 max-w-lg leading-relaxed">
              {t("hero_subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-full text-base px-8">
                <Link to="/detect">{t("hero_cta_detect")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/forecast">{t("hero_cta_forecast")}</Link>
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
            {t("features_title")}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            {t("features_subtitle")}
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
                  {t("feature_explore")}
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
            <h2 className="text-3xl md:text-4xl font-display font-bold">{t("why_title")}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("why_desc")}
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              { label: t("why_yield_label"), value: "25-40%", sub: t("why_yield_sub") },
              { label: t("why_price_label"), value: "±50%", sub: t("why_price_sub") },
              { label: t("why_choice_label"), value: "20-30%", sub: t("why_choice_sub") },
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
          <p>{t("footer_org")}</p>
          <p className="mt-1">{t("footer_team")}</p>
        </div>
      </footer>
    </div>
  );
}
