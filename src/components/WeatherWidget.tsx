import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, Droplets, Wind, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Weather {
  temp: number;
  humidity: number;
  windSpeed: number;
  code: number;
  isRaining: boolean;
  city: string;
}

const weatherCodeText = (code: number, lang: string) => {
  // WMO weather codes (Open-Meteo)
  const en: Record<number, string> = {
    0: "Clear sky",
    1: "Mostly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
  };
  const ta: Record<number, string> = {
    0: "தெளிவான வானம்",
    1: "பெரும்பாலும் தெளிவு",
    2: "ஓரளவு மேகம்",
    3: "முழுவதும் மேகம்",
    45: "மூடுபனி",
    48: "மூடுபனி",
    51: "லேசான தூறல்",
    53: "தூறல்",
    55: "கடும் தூறல்",
    61: "லேசான மழை",
    63: "மழை",
    65: "கனமழை",
    71: "லேசான பனி",
    80: "மழை பொழிவு",
    81: "மழை பொழிவு",
    82: "கனமழை பொழிவு",
    95: "இடியுடன் கூடிய மழை",
  };
  return (lang === "ta" ? ta : en)[code] ?? (lang === "ta" ? "தெரியவில்லை" : "Unknown");
};

export function WeatherWidget() {
  const { lang, t } = useLanguage();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, city: string) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
        );
        const data = await res.json();
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m),
          code: c.weather_code,
          isRaining: c.weather_code >= 51 && c.weather_code <= 82,
          city,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const fallbackCity = lang === "ta" ? "கோயம்புத்தூர்" : "Coimbatore";
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, t("ww_your_location")),
        () => fetchWeather(11.0168, 76.9558, fallbackCity),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(11.0168, 76.9558, fallbackCity);
    }
  }, [lang]);

  const Icon = !weather ? Cloud : weather.isRaining ? CloudRain : weather.code <= 1 ? Sun : Cloud;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 overflow-hidden relative"
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{weather?.city ?? t("ww_loading")}</span>
          </div>
          <Icon className="h-8 w-8 text-primary" />
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("ww_fetching")}</span>
          </div>
        ) : error || !weather ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {t("ww_unavailable")}
          </p>
        ) : (
          <>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-display font-bold">{weather.temp}°</span>
              <span className="text-lg text-muted-foreground">C</span>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">
              {weatherCodeText(weather.code, lang)}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-accent/40 px-3 py-2">
                <Droplets className="h-4 w-4 text-agri-sky" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("ww_humidity")}</p>
                  <p className="text-sm font-semibold">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-accent/40 px-3 py-2">
                <Wind className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("ww_wind")}</p>
                  <p className="text-sm font-semibold">{weather.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
