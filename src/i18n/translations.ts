export type Lang = "en" | "ta";

export const translations = {
  en: {
    // Brand & nav
    brand_a: "AgriConnect",
    brand_b: "AI",
    nav_dashboard: "Dashboard",
    nav_detect: "Disease Detection",
    nav_forecast: "Price Forecast",
    nav_recommend: "Crop Advice",
    lang_toggle: "தமிழ்",

    // Index / Hero
    hero_badge: "ML-Powered Smart Agriculture",
    hero_title: "AgriConnect AI",
    hero_subtitle:
      "Crop disease detection, market price forecasting, and personalized crop recommendations — all in one platform built for Tamil Nadu farmers.",
    hero_cta_detect: "Try Disease Detection",
    hero_cta_forecast: "View Forecasts",

    // Stats
    stat_accuracy: "Detection Accuracy",
    stat_accuracy_sub: "+12% vs baseline",
    stat_yield: "Yield Increase",
    stat_yield_sub: "Pilot results",
    stat_farmers: "Farmers Connected",
    stat_farmers_sub: "+180 this month",
    stat_crops: "Crops Monitored",
    stat_crops_sub: "Paddy, Sugarcane & more",

    // Features
    features_title: "Everything Farmers Need",
    features_subtitle:
      "An integrated platform combining AI disease detection, price prediction, and crop recommendations.",
    feature_disease_title: "Disease Detection",
    feature_disease_desc:
      "Upload a crop image and get instant AI-powered disease identification with treatment recommendations.",
    feature_forecast_title: "Price Forecast",
    feature_forecast_desc:
      "30-day market price predictions using LSTM models trained on Tamil Nadu mandi data.",
    feature_advice_title: "Crop Advice",
    feature_advice_desc:
      "Get AI-powered crop recommendations based on your soil, weather, and crop history.",
    feature_explore: "Explore →",

    // Why
    why_title: "Why AgriConnect AI?",
    why_desc:
      "Smallholder farmers in Tamil Nadu face 25–40% yield loss from undetected diseases, ±50% price fluctuations, and 22–35% income loss to middlemen. AgriConnect AI addresses all three with a unified, region-specific platform.",
    why_yield_label: "Yield Loss Prevented",
    why_yield_sub: "via early disease detection",
    why_price_label: "Price Stability",
    why_price_sub: "reduced via LSTM forecasting",
    why_choice_label: "Better Crop Choices",
    why_choice_sub: "via AI crop recommendations",

    // Footer
    footer_org: "AgriConnect AI — Sasurie College of Engineering, Department of CSE",
    footer_team: "Team: Haripriya V, Jeena D, Maheswari T, Revathi P | Supervisor: Dinesh M",

    // Disease Detection
    dd_title: "AI Crop Disease Detection",
    dd_desc:
      "Upload a photo of your crop leaf and our AI vision model will identify diseases with confidence scores and recommend treatments.",
    dd_drop: "Drop your crop image here",
    dd_browse: "or click to browse (JPG, PNG)",
    dd_analyzing: "Analyzing crop image with AI...",
    dd_analyzing_sub: "Running AI vision analysis to detect diseases and assess severity",
    dd_crop_identified: "Crop Identified",
    dd_healthy: "Plant is Healthy",
    dd_disease_detected: "Disease Detected",
    dd_confidence: "Confidence",
    dd_severity: "Severity",
    dd_symptoms: "Observed Symptoms",
    dd_treatment: "Recommended Treatment",
    dd_upload_another: "Upload Another Image",
    dd_empty: "Upload a crop leaf image to get AI-powered disease detection with confidence scores.",
    dd_err_failed: "Analysis failed. Please try again.",
    dd_err_not_plant:
      "The uploaded image doesn't appear to be a plant. Please upload a crop leaf image.",
    dd_err_generic: "Something went wrong. Please try again.",

    // Price Forecast
    pf_title: "Market Price Forecast",
    pf_desc:
      "30-day daily price forecast using a Holt-Winters seasonal model calibrated on Tamil Nadu mandi baselines, with AI-powered sell/hold guidance.",
    pf_crop: "Crop",
    pf_mandi: "Mandi",
    pf_actual: "History (90d)",
    pf_predicted: "Forecast (30d)",
    pf_confidence: "Confidence band",
    pf_current: "Current Price",
    pf_per_quintal: "per quintal",
    pf_30day: "Day-30 Forecast",
    pf_change: "Change",
    pf_upward: "Upward trend",
    pf_downward: "Downward trend",
    pf_best_window: "Best Sell Window",
    pf_best_window_sub: "Based on predicted peak",
    pf_loading: "Running forecast model...",
    pf_loading_sub: "Generating 30-day prediction and AI insight",
    pf_weekly_title: "Weekly Forecast Summary",
    pf_week: "Week",
    pf_avg: "Avg",
    pf_range: "Range",
    pf_insight_title: "AI Market Insight",
    pf_drivers: "Key drivers",
    pf_rec_sell_now: "Sell now",
    pf_rec_sell_soon: "Sell soon",
    pf_rec_hold: "Hold",
    pf_expected_gain: "Expected change vs today",
    pf_model_note: "Model: Holt-Winters seasonal forecast on TN mandi baselines. Insights by AI.",

    // Crop Recommend
    cr_title: "Crop Recommendation",
    cr_desc:
      "Enter your farm details and get AI-powered crop recommendations tailored to your soil, weather, and region in Tamil Nadu.",
    cr_soil: "Soil Type",
    cr_soil_ph: "Select soil type",
    cr_weather: "Weather Conditions",
    cr_weather_ph: "Select current weather",
    cr_history: "Previous Crops",
    cr_history_ph: "e.g., Paddy, Sugarcane, Groundnut",
    cr_history_help: "Comma-separated list of crops you've grown recently",
    cr_region: "Region",
    cr_region_ph: "Select region (optional)",
    cr_required: "Please fill in all required fields",
    cr_analyzing: "AI is analyzing your farm details...",
    cr_analyzing_sub:
      "Evaluating soil compatibility, weather patterns, and crop rotation benefits",
    cr_get: "Get Recommendations",
    cr_loading: "Analyzing...",
    cr_yield: "Yield",
    cr_plant: "Plant",
    cr_care_tips: "Care Tips",
    cr_try_again: "Try Different Inputs",
    cr_empty_title: "AI-Powered Recommendations",
    cr_empty_desc:
      "Fill in your farm details and our AI will analyze soil compatibility, weather patterns, and crop rotation to suggest the best crops for you.",
    cr_err_generic: "Something went wrong. Please try again.",
    cr_voice_hint: "Tap mic and say e.g. 'black soil, rainy, previous crop paddy'",
    cr_voice_filled: "Form filled from voice input",

    // 404
    nf_title: "Page Not Found",
    nf_desc: "The page you are looking for doesn't exist.",
    nf_home: "Return to Home",

    // Toasts (shared)
    toast_forecast_failed: "Forecast failed",
    toast_try_again: "Please try again.",
    pf_per_quintal_short: "/quintal",

    // Soil types
    soil_alluvial: "Alluvial",
    soil_red: "Red Soil",
    soil_black: "Black Cotton",
    soil_laterite: "Laterite",
    soil_sandy: "Sandy",
    soil_clay: "Clay",
    soil_loamy: "Loamy",
    soil_saline: "Saline",

    // Weather options
    weather_hot_dry: "Hot & Dry",
    weather_hot_humid: "Hot & Humid",
    weather_warm_mod: "Warm & Moderate",
    weather_cool_wet: "Cool & Wet",
    weather_monsoon: "Monsoon Season",
    weather_post_monsoon: "Post-Monsoon",

    // Severity
    sev_healthy: "Healthy",
    sev_mild: "Mild",
    sev_moderate: "Moderate",
    sev_severe: "Severe",

    // Model status
    ms_title: "Forecast Model",
    ms_loading: "Loading",
    ms_lstm_active: "LSTM active",
    ms_fallback: "Holt-Winters fallback (no LSTM uploaded)",
    ms_architecture: "Architecture",
    ms_hidden: "Hidden size",
    ms_sequence: "Sequence",
    ms_mape: "Validation MAPE",
    ms_train_samples: "Train samples",
    ms_crops: "Crops covered",
    ms_mandis: "Mandis covered",
    ms_trained: "Trained",
    ms_days: "days",
    ms_fallback_desc:
      "Forecasts currently come from a Holt-Winters seasonal model. Train and upload an LSTM via the Colab notebook to switch to learned predictions.",
    ms_upload_csv: "Upload training CSV",
    ms_open_colab: "Open Colab to train",
    ms_download_json: "Download model JSON",
    ms_refresh: "Refresh",
    ms_csv_only_title: "CSV only",
    ms_csv_only_desc: "Please upload a .csv file.",
    ms_too_large_title: "File too large",
    ms_too_large_desc: "Max 20 MB.",
    ms_uploaded_title: "CSV uploaded",
    ms_upload_failed: "Upload failed",
    ms_csv_format_hint:
      "CSV format: date, crop, mandi, price. After uploading, open the Colab notebook, point it at this dataset, train, and the model auto-registers. Cold-start picks it up within ~1 minute.",

    // Crops
    crop_paddy: "Paddy",
    crop_sugarcane: "Sugarcane",
    crop_tomato: "Tomato",
    crop_onion: "Onion",
    crop_cotton: "Cotton",
    crop_groundnut: "Groundnut",
    crop_maize: "Maize",
    crop_turmeric: "Turmeric",

    // Mandis / Regions
    mandi_coimbatore: "Coimbatore",
    mandi_madurai: "Madurai",
    mandi_chennai: "Chennai-Koyambedu",
    mandi_erode: "Erode",
    mandi_salem: "Salem",
    mandi_thanjavur: "Thanjavur",
    mandi_trichy: "Trichy",
    mandi_dindigul: "Dindigul",
    mandi_namakkal: "Namakkal",
    mandi_tiruvarur: "Tiruvarur",
    mandi_other: "Other",

    // Weather widget
    ww_your_location: "Your location",
    ww_loading: "Loading...",
    ww_fetching: "Fetching weather data...",
    ww_unavailable: "Weather data unavailable",
    ww_humidity: "Humidity",
    ww_wind: "Wind",

    // Calendar (SmartCropCalendar)
    sc_title: "Smart Crop Calendar",
    sc_season: "Season:",
    sc_sowing_date: "Sowing date:",
    sc_harvest: "Harvest:",
    sc_day: "Day",
    sc_reminder_set: "Reminder on",
    sc_remind_me: "Remind me",
    sc_reminder_removed: "Reminder removed",
    sc_perm_needed: "Notifications permission needed. Enable it in your browser.",
    sc_reminder_scheduled_title: "🔔 Reminder scheduled",
    sc_note: "Note: Calendar is general guidance tuned for Tamil Nadu. Consult your local agri-officer for field-specific advice.",
  },
  ta: {
    // Brand & nav
    brand_a: "அக்ரிகனெக்ட்",
    brand_b: "AI",
    nav_dashboard: "முகப்பு",
    nav_detect: "நோய் கண்டறிதல்",
    nav_forecast: "விலை கணிப்பு",
    nav_recommend: "பயிர் ஆலோசனை",
    lang_toggle: "English",

    // Hero
    hero_badge: "ML சக்தி வாய்ந்த ஸ்மார்ட் வேளாண்மை",
    hero_title: "அக்ரிகனெக்ட் AI",
    hero_subtitle:
      "பயிர் நோய் கண்டறிதல், சந்தை விலை கணிப்பு, மற்றும் தனிப்பயன் பயிர் பரிந்துரைகள் — தமிழ்நாடு விவசாயிகளுக்காக ஒரே தளத்தில்.",
    hero_cta_detect: "நோய் கண்டறிதல் முயற்சி",
    hero_cta_forecast: "கணிப்புகளைப் பார்",

    // Stats
    stat_accuracy: "கண்டறியும் துல்லியம்",
    stat_accuracy_sub: "+12% அடிப்படையை விட",
    stat_yield: "விளைச்சல் அதிகரிப்பு",
    stat_yield_sub: "சோதனை முடிவுகள்",
    stat_farmers: "இணைந்த விவசாயிகள்",
    stat_farmers_sub: "இம்மாதம் +180",
    stat_crops: "கண்காணிக்கப்படும் பயிர்கள்",
    stat_crops_sub: "நெல், கரும்பு மற்றும் பல",

    // Features
    features_title: "விவசாயிகளுக்குத் தேவையான அனைத்தும்",
    features_subtitle:
      "AI நோய் கண்டறிதல், விலை கணிப்பு, மற்றும் பயிர் பரிந்துரைகளை இணைக்கும் ஒருங்கிணைந்த தளம்.",
    feature_disease_title: "நோய் கண்டறிதல்",
    feature_disease_desc:
      "பயிர் படத்தை பதிவேற்றி, உடனடியாக AI நோய் கண்டறிதலையும் சிகிச்சை பரிந்துரைகளையும் பெறவும்.",
    feature_forecast_title: "விலை கணிப்பு",
    feature_forecast_desc:
      "தமிழ்நாடு மண்டி தரவில் பயிற்சி பெற்ற LSTM மாதிரிகள் கொண்டு 30 நாள் விலை கணிப்புகள்.",
    feature_advice_title: "பயிர் ஆலோசனை",
    feature_advice_desc:
      "உங்கள் மண், காலநிலை, பயிர் வரலாற்றின் அடிப்படையில் AI பயிர் பரிந்துரைகள்.",
    feature_explore: "மேலும் →",

    // Why
    why_title: "ஏன் அக்ரிகனெக்ட் AI?",
    why_desc:
      "தமிழ்நாட்டில் சிறு விவசாயிகள் கண்டறியப்படாத நோய்களால் 25–40% விளைச்சல் இழப்பு, ±50% விலை மாற்றங்கள், 22–35% வருமான இழப்பை எதிர்கொள்கின்றனர். AgriConnect AI இந்த மூன்றையும் ஒரே தளத்தில் தீர்க்கிறது.",
    why_yield_label: "தடுக்கப்பட்ட விளைச்சல் இழப்பு",
    why_yield_sub: "ஆரம்ப நோய் கண்டறிதல் மூலம்",
    why_price_label: "விலை நிலைத்தன்மை",
    why_price_sub: "LSTM கணிப்பு மூலம் குறைப்பு",
    why_choice_label: "சிறந்த பயிர் தேர்வு",
    why_choice_sub: "AI பயிர் பரிந்துரைகள் மூலம்",

    // Footer
    footer_org:
      "அக்ரிகனெக்ட் AI — சசூரி பொறியியல் கல்லூரி, கணினி அறிவியல் துறை",
    footer_team:
      "குழு: ஹரிபிரியா V, ஜீனா D, மகேஸ்வரி T, ரேவதி P | வழிகாட்டி: தினேஷ் M",

    // Disease Detection
    dd_title: "AI பயிர் நோய் கண்டறிதல்",
    dd_desc:
      "உங்கள் பயிர் இலையின் படத்தை பதிவேற்றுங்கள் — AI மாதிரி நோய்களையும் நம்பிக்கை மதிப்பெண்ணையும் கண்டறிந்து சிகிச்சை பரிந்துரைக்கும்.",
    dd_drop: "உங்கள் பயிர் படத்தை இங்கே இடுங்கள்",
    dd_browse: "அல்லது தேர்ந்தெடுக்க கிளிக் செய்யவும் (JPG, PNG)",
    dd_analyzing: "AI மூலம் பயிர் படத்தை பகுப்பாய்வு செய்கிறது...",
    dd_analyzing_sub:
      "நோய்கள் மற்றும் தீவிரத்தை மதிப்பிட AI பார்வை பகுப்பாய்வு இயங்குகிறது",
    dd_crop_identified: "அடையாளம் காணப்பட்ட பயிர்",
    dd_healthy: "பயிர் ஆரோக்கியமாக உள்ளது",
    dd_disease_detected: "நோய் கண்டறியப்பட்டது",
    dd_confidence: "நம்பிக்கை",
    dd_severity: "தீவிரம்",
    dd_symptoms: "காணப்படும் அறிகுறிகள்",
    dd_treatment: "பரிந்துரைக்கப்பட்ட சிகிச்சை",
    dd_upload_another: "மற்றொரு படத்தை பதிவேற்று",
    dd_empty:
      "AI நோய் கண்டறிதலுக்காக ஒரு பயிர் இலை படத்தை பதிவேற்றவும்.",
    dd_err_failed: "பகுப்பாய்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    dd_err_not_plant:
      "பதிவேற்றிய படம் தாவரமாகத் தெரியவில்லை. பயிர் இலை படத்தை பதிவேற்றவும்.",
    dd_err_generic: "ஏதோ தவறு. மீண்டும் முயற்சிக்கவும்.",

    // Price Forecast
    pf_title: "சந்தை விலை கணிப்பு",
    pf_desc:
      "தமிழ்நாடு மண்டி தரவின் அடிப்படையில் Holt-Winters பருவகால மாதிரி மூலம் 30 நாள் தினசரி விலை கணிப்பு, AI விற்பனை/காத்திருப்பு ஆலோசனையுடன்.",
    pf_crop: "பயிர்",
    pf_mandi: "மண்டி",
    pf_actual: "வரலாறு (90 நாள்)",
    pf_predicted: "கணிப்பு (30 நாள்)",
    pf_confidence: "நம்பிக்கை வரம்பு",
    pf_current: "தற்போதைய விலை",
    pf_per_quintal: "ஒரு குவிண்டலுக்கு",
    pf_30day: "30-ம் நாள் கணிப்பு",
    pf_change: "மாற்றம்",
    pf_upward: "ஏறுமுக போக்கு",
    pf_downward: "இறங்குமுக போக்கு",
    pf_best_window: "சிறந்த விற்பனை காலம்",
    pf_best_window_sub: "கணிக்கப்பட்ட உச்சத்தின் அடிப்படையில்",
    pf_loading: "கணிப்பு மாதிரி இயங்குகிறது...",
    pf_loading_sub: "30 நாள் கணிப்பு மற்றும் AI ஆலோசனை உருவாக்கப்படுகிறது",
    pf_weekly_title: "வாராந்திர கணிப்பு சுருக்கம்",
    pf_week: "வாரம்",
    pf_avg: "சராசரி",
    pf_range: "வரம்பு",
    pf_insight_title: "AI சந்தை ஆலோசனை",
    pf_drivers: "முக்கிய காரணிகள்",
    pf_rec_sell_now: "இப்போதே விற்க",
    pf_rec_sell_soon: "விரைவில் விற்க",
    pf_rec_hold: "காத்திருக்க",
    pf_expected_gain: "இன்றுடன் ஒப்பிடும் மாற்றம்",
    pf_model_note: "மாதிரி: TN மண்டி தரவில் Holt-Winters பருவகால கணிப்பு. ஆலோசனை AI மூலம்.",

    // Crop Recommend
    cr_title: "பயிர் பரிந்துரை",
    cr_desc:
      "உங்கள் பண்ணை விவரங்களை உள்ளிடுங்கள் — மண், காலநிலை, தமிழ்நாட்டின் உங்கள் மண்டலத்திற்கு ஏற்ற AI பயிர் பரிந்துரைகளைப் பெறுங்கள்.",
    cr_soil: "மண் வகை",
    cr_soil_ph: "மண் வகையை தேர்ந்தெடுக்கவும்",
    cr_weather: "காலநிலை",
    cr_weather_ph: "தற்போதைய காலநிலையை தேர்ந்தெடுக்கவும்",
    cr_history: "முந்தைய பயிர்கள்",
    cr_history_ph: "எ.கா., நெல், கரும்பு, நிலக்கடலை",
    cr_history_help: "சமீபத்தில் வளர்த்த பயிர்களின் பட்டியல் (கமாவால் பிரிக்கவும்)",
    cr_region: "மண்டலம்",
    cr_region_ph: "மண்டலத்தைத் தேர்ந்தெடுக்கவும் (விருப்பம்)",
    cr_required: "அனைத்து தேவையான புலங்களையும் நிரப்பவும்",
    cr_analyzing: "AI உங்கள் பண்ணை விவரங்களை பகுப்பாய்வு செய்கிறது...",
    cr_analyzing_sub:
      "மண் பொருத்தம், காலநிலை வடிவங்கள், பயிர் சுழற்சி நன்மைகளை மதிப்பிடுகிறது",
    cr_get: "பரிந்துரைகளைப் பெறு",
    cr_loading: "பகுப்பாய்வு செய்கிறது...",
    cr_yield: "விளைச்சல்",
    cr_plant: "நடவு",
    cr_care_tips: "பராமரிப்பு குறிப்புகள்",
    cr_try_again: "வேறு உள்ளீடுகளை முயற்சிக்கவும்",
    cr_empty_title: "AI இயக்கப்பட்ட பரிந்துரைகள்",
    cr_empty_desc:
      "உங்கள் பண்ணை விவரங்களை நிரப்பவும் — AI மண் பொருத்தம், காலநிலை, பயிர் சுழற்சியை பகுப்பாய்வு செய்து சிறந்த பயிர்களை பரிந்துரைக்கும்.",
    cr_err_generic: "ஏதோ தவறு. மீண்டும் முயற்சிக்கவும்.",
    cr_voice_hint: "மைக்கைத் தட்டி சொல்லுங்கள்: 'கருப்பு மண், மழை, முந்தைய பயிர் நெல்'",
    cr_voice_filled: "குரல் மூலம் படிவம் நிரப்பப்பட்டது",

    // 404
    nf_title: "பக்கம் கிடைக்கவில்லை",
    nf_desc: "நீங்கள் தேடும் பக்கம் இல்லை.",
    nf_home: "முகப்புக்கு திரும்பு",

    // Toasts
    toast_forecast_failed: "கணிப்பு தோல்வியடைந்தது",
    toast_try_again: "மீண்டும் முயற்சிக்கவும்.",
    pf_per_quintal_short: "/குவிண்டல்",

    // Soil types
    soil_alluvial: "வண்டல் மண்",
    soil_red: "செம்மண்",
    soil_black: "கருப்பு பஞ்சை மண்",
    soil_laterite: "செங்கல் மண்",
    soil_sandy: "மணல் மண்",
    soil_clay: "களி மண்",
    soil_loamy: "வண்டல் சேறு",
    soil_saline: "உப்பு மண்",

    // Weather
    weather_hot_dry: "வெப்பம் & வறட்சி",
    weather_hot_humid: "வெப்பம் & ஈரப்பதம்",
    weather_warm_mod: "மிதமான வெப்பம்",
    weather_cool_wet: "குளிர் & ஈரம்",
    weather_monsoon: "பருவமழை காலம்",
    weather_post_monsoon: "மழைக்கு பின்",

    // Severity
    sev_healthy: "ஆரோக்கியம்",
    sev_mild: "சிறிது",
    sev_moderate: "மிதமானது",
    sev_severe: "கடுமையானது",

    // Model status
    ms_title: "கணிப்பு மாதிரி",
    ms_loading: "ஏற்றுகிறது",
    ms_lstm_active: "LSTM செயலில்",
    ms_fallback: "Holt-Winters மாற்று (LSTM பதிவேற்றப்படவில்லை)",
    ms_architecture: "கட்டமைப்பு",
    ms_hidden: "மறை அளவு",
    ms_sequence: "வரிசை",
    ms_mape: "சரிபார்ப்பு MAPE",
    ms_train_samples: "பயிற்சி மாதிரிகள்",
    ms_crops: "பயிர்கள்",
    ms_mandis: "மண்டிகள்",
    ms_trained: "பயிற்சி தேதி",
    ms_days: "நாட்கள்",
    ms_fallback_desc:
      "கணிப்புகள் தற்போது Holt-Winters பருவகால மாதிரியில் இருந்து வருகிறது. கற்ற கணிப்புகளுக்கு Colab மூலம் LSTM-ஐ பயிற்சி செய்து பதிவேற்றவும்.",
    ms_upload_csv: "பயிற்சி CSV பதிவேற்று",
    ms_open_colab: "பயிற்சிக்கு Colab திற",
    ms_download_json: "மாதிரி JSON பதிவிறக்கு",
    ms_refresh: "புதுப்பி",
    ms_csv_only_title: "CSV மட்டும்",
    ms_csv_only_desc: ".csv கோப்பை பதிவேற்றவும்.",
    ms_too_large_title: "கோப்பு மிகப் பெரியது",
    ms_too_large_desc: "அதிகபட்சம் 20 MB.",
    ms_uploaded_title: "CSV பதிவேற்றப்பட்டது",
    ms_upload_failed: "பதிவேற்றம் தோல்வியடைந்தது",
    ms_csv_format_hint:
      "CSV வடிவம்: date, crop, mandi, price. பதிவேற்றிய பின் Colab திறந்து இந்த தரவில் பயிற்சி செய்க — மாதிரி தானாக பதிவாகும். ~1 நிமிடத்தில் பயன்பாட்டிற்கு வரும்.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
