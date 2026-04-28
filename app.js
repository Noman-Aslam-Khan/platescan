const FOOD_DB = [
  {
    meal: "Pizza Slice",
    keywords: ["pizza"],
    nutritionPer100g: { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3, sodium: 640 }
  },
  {
    meal: "Burger",
    keywords: ["burger", "cheeseburger", "hamburger"],
    nutritionPer100g: { calories: 295, protein: 14, carbs: 30, fat: 13, fiber: 1.9, sodium: 470 }
  },
  {
    meal: "Salad Bowl",
    keywords: ["salad", "caesar"],
    nutritionPer100g: { calories: 120, protein: 5, carbs: 10, fat: 7, fiber: 3.5, sodium: 180 }
  },
  {
    meal: "Pasta",
    keywords: ["spaghetti", "pasta", "carbonara", "macaroni"],
    nutritionPer100g: { calories: 157, protein: 5.8, carbs: 30.9, fat: 1.3, fiber: 1.8, sodium: 6 }
  },
  {
    meal: "Sushi",
    keywords: ["sushi"],
    nutritionPer100g: { calories: 143, protein: 6, carbs: 24, fat: 2.1, fiber: 0.8, sodium: 320 }
  },
  {
    meal: "Steak",
    keywords: ["steak", "beef"],
    nutritionPer100g: { calories: 271, protein: 25.2, carbs: 0, fat: 18.5, fiber: 0, sodium: 58 }
  },
  {
    meal: "Grilled Chicken",
    keywords: ["chicken", "drumstick", "wing"],
    nutritionPer100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 }
  },
  {
    meal: "French Fries",
    keywords: ["french fries", "fries"],
    nutritionPer100g: { calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, sodium: 210 }
  },
  {
    meal: "Rice Bowl",
    keywords: ["rice"],
    nutritionPer100g: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sodium: 1 }
  },
  {
    meal: "Sandwich",
    keywords: ["sandwich", "sub"],
    nutritionPer100g: { calories: 250, protein: 12, carbs: 26, fat: 10, fiber: 2.1, sodium: 520 }
  }
];

const FALLBACK_PROFILE = {
  meal: "Mixed Meal",
  nutritionPer100g: { calories: 210, protein: 11, carbs: 18, fat: 10, fiber: 2.6, sodium: 320 }
};

const STORAGE_KEY = "platescan-history-v1";
const GOALS_KEY = "platescan-goals-v1";
const VISION_SETTINGS_KEY = "platescan-vision-settings-v1";
const TRENDS_SETTINGS_KEY = "platescan-trends-settings-v1";
const DEFAULT_GOALS = { calories: 2200, protein: 130, carbs: 260, fat: 70 };

const cameraEl = document.getElementById("camera");
const snapshotEl = document.getElementById("snapshot");
const captureCanvas = document.getElementById("captureCanvas");
const cameraStatus = document.getElementById("cameraStatus");
const modelStatus = document.getElementById("modelStatus");
const scanMessage = document.getElementById("scanMessage");

const captureBtn = document.getElementById("captureBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const retakeBtn = document.getElementById("retakeBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const useCloudVision = document.getElementById("useCloudVision");
const visionApiKey = document.getElementById("visionApiKey");
const saveVisionKeyBtn = document.getElementById("saveVisionKeyBtn");
const visionModeInfo = document.getElementById("visionModeInfo");

const resultEmpty = document.getElementById("resultEmpty");
const resultCard = document.getElementById("resultCard");
const mealName = document.getElementById("mealName");
const mealMeta = document.getElementById("mealMeta");
const predictionHints = document.getElementById("predictionHints");

const caloriesValue = document.getElementById("caloriesValue");
const proteinValue = document.getElementById("proteinValue");
const carbsValue = document.getElementById("carbsValue");
const fatValue = document.getElementById("fatValue");
const fiberValue = document.getElementById("fiberValue");
const sodiumValue = document.getElementById("sodiumValue");

const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const todayLabel = document.getElementById("todayLabel");
const weekLabel = document.getElementById("weekLabel");
const weeklyChart = document.getElementById("weeklyChart");
const weeklyEmpty = document.getElementById("weeklyEmpty");
const trendMetric = document.getElementById("trendMetric");

const goalCaloriesInput = document.getElementById("goalCalories");
const goalProteinInput = document.getElementById("goalProtein");
const goalCarbsInput = document.getElementById("goalCarbs");
const goalFatInput = document.getElementById("goalFat");
const saveGoalsBtn = document.getElementById("saveGoalsBtn");

const totalCalories = document.getElementById("totalCalories");
const totalProtein = document.getElementById("totalProtein");
const totalCarbs = document.getElementById("totalCarbs");
const totalFat = document.getElementById("totalFat");

const goalCaloriesLabel = document.getElementById("goalCaloriesLabel");
const goalProteinLabel = document.getElementById("goalProteinLabel");
const goalCarbsLabel = document.getElementById("goalCarbsLabel");
const goalFatLabel = document.getElementById("goalFatLabel");

const progressCalories = document.getElementById("progressCalories");
const progressProtein = document.getElementById("progressProtein");
const progressCarbs = document.getElementById("progressCarbs");
const progressFat = document.getElementById("progressFat");

let cameraStream = null;
let model = null;
let lastSnapshot = "";
let history = loadHistory();
let goals = loadGoals();
let visionSettings = loadVisionSettings();
let trendsSettings = loadTrendsSettings();

boot();

async function boot() {
  initializeControls();
  wireEvents();
  renderHistory();
  renderDashboard();
  renderWeeklyTrends();
  loadModel();
}

function wireEvents() {
  bindEvent(captureBtn, "click", onCaptureButtonClick, "captureBtn");
  bindEvent(analyzeBtn, "click", analyzeMeal, "analyzeBtn");
  bindEvent(retakeBtn, "click", retakePhoto, "retakeBtn");
  bindEvent(clearHistoryBtn, "click", clearHistory, "clearHistoryBtn");
  bindEvent(saveVisionKeyBtn, "click", saveVisionSettings, "saveVisionKeyBtn");
  bindEvent(useCloudVision, "change", saveVisionSettings, "useCloudVision");
  bindEvent(saveGoalsBtn, "click", saveGoals, "saveGoalsBtn");
  bindEvent(trendMetric, "change", saveTrendsSettings, "trendMetric");
}

function bindEvent(element, eventName, handler, elementName) {
  if (!element) {
    console.warn(`Missing element: ${elementName}`);
    return;
  }

  element.addEventListener(eventName, handler);
}

function initializeControls() {
  useCloudVision.checked = Boolean(visionSettings.useCloud);
  visionApiKey.value = visionSettings.apiKey || "";

  goalCaloriesInput.value = String(goals.calories);
  goalProteinInput.value = String(goals.protein);
  goalCarbsInput.value = String(goals.carbs);
  goalFatInput.value = String(goals.fat);

  todayLabel.textContent = `Today ${new Date().toLocaleDateString()}`;
  trendMetric.value = trendsSettings.metric;
  weekLabel.textContent = getTrendLabel(trendsSettings.metric);
  updateVisionModeLabel();

  captureBtn.textContent = "Capture";
  captureBtn.disabled = false;
  retakeBtn.disabled = true;
  analyzeBtn.disabled = true;
}

async function onCaptureButtonClick() {
  if (!cameraStream) {
    captureBtn.disabled = true;
    captureBtn.textContent = "Starting...";
    await startCamera();
    return;
  }

  captureFrame();
}

function updateVisionModeLabel() {
  if (visionSettings.useCloud && visionSettings.apiKey) {
    visionModeInfo.textContent = "Cloud Vision mode is active.";
    return;
  }

  if (visionSettings.useCloud && !visionSettings.apiKey) {
    visionModeInfo.textContent = "Cloud Vision selected. Add API key to enable it.";
    return;
  }

  visionModeInfo.textContent = "Local AI mode is active.";
}

async function loadModel() {
  try {
    modelStatus.textContent = "Loading model...";
    scanMessage.textContent = "Downloading on-device vision model...";
    model = await mobilenet.load();
    modelStatus.textContent = "Model ready";
    modelStatus.classList.remove("warm");
    if (lastSnapshot) {
      analyzeBtn.disabled = false;
    }
    scanMessage.textContent = cameraStream ? "Tap Capture to take a photo." : "Tap Capture to start camera.";
  } catch (error) {
    console.error(error);
    modelStatus.textContent = "Model failed";
    scanMessage.textContent = "Could not load vision model. Camera still works, but analyze will stay disabled.";
  }
}

async function startCamera() {
  if (!window.isSecureContext) {
    scanMessage.textContent = "Camera needs HTTPS (or localhost). Open the deployed HTTPS URL.";
    cameraStatus.textContent = "Insecure context";
    cameraStatus.classList.add("warm");
    captureBtn.textContent = "Capture";
    captureBtn.disabled = false;
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    scanMessage.textContent = "Camera API is not supported in this browser.";
    captureBtn.textContent = "Capture";
    captureBtn.disabled = false;
    return;
  }

  try {
    if (cameraStream) {
      stopCameraStream();
    }

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
    } catch {
      // Fallback for browsers/devices that reject detailed constraints.
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    cameraEl.srcObject = cameraStream;
    await cameraEl.play();

    cameraStatus.textContent = "Camera live";
    cameraStatus.classList.remove("warm");

    cameraEl.style.display = "block";
    snapshotEl.style.display = "none";

    captureBtn.disabled = false;
    captureBtn.textContent = "Capture";
    analyzeBtn.disabled = true;
    retakeBtn.disabled = true;

    scanMessage.textContent = "Position meal in frame and tap Capture.";
  } catch (error) {
    console.error(error);
    const reason = error && error.name ? ` (${error.name})` : "";
    scanMessage.textContent = `Unable to access camera. Allow permission and retry${reason}.`;
    cameraStatus.textContent = "Camera blocked";
    cameraStatus.classList.add("warm");
    captureBtn.textContent = "Capture";
    captureBtn.disabled = false;
  }
}

function captureFrame() {
  if (!cameraStream) {
    return;
  }

  const side = Math.min(cameraEl.videoWidth, cameraEl.videoHeight);
  const sx = (cameraEl.videoWidth - side) / 2;
  const sy = (cameraEl.videoHeight - side) / 2;

  const ctx = captureCanvas.getContext("2d");
  captureCanvas.width = 640;
  captureCanvas.height = 640;
  ctx.drawImage(cameraEl, sx, sy, side, side, 0, 0, 640, 640);

  lastSnapshot = captureCanvas.toDataURL("image/jpeg", 0.88);

  snapshotEl.src = lastSnapshot;
  snapshotEl.style.display = "block";
  cameraEl.style.display = "none";

  captureBtn.disabled = true;
  analyzeBtn.disabled = !model;
  retakeBtn.disabled = false;

  scanMessage.textContent = "Photo captured. Tap Analyze Meal.";
}

function retakePhoto() {
  if (!cameraStream) {
    return;
  }

  snapshotEl.style.display = "none";
  cameraEl.style.display = "block";
  captureBtn.disabled = false;
  analyzeBtn.disabled = true;
  retakeBtn.disabled = true;
  scanMessage.textContent = "Retake ready. Capture again when framed.";
}

async function analyzeMeal() {
  if (!lastSnapshot) {
    scanMessage.textContent = "Capture a photo first.";
    return;
  }

  try {
    analyzeBtn.disabled = true;
    let predictions = [];
    let detectionSource = "local";

    if (visionSettings.useCloud && visionSettings.apiKey) {
      scanMessage.textContent = "Analyzing with Google Cloud Vision...";
      predictions = await detectWithCloudVision(lastSnapshot, visionSettings.apiKey);
      detectionSource = "cloud";
    }

    if (!predictions.length) {
      if (!model) {
        throw new Error("Vision model unavailable and cloud detection did not return results.");
      }

      scanMessage.textContent = "Analyzing with local AI model...";
      predictions = await model.classify(snapshotEl, 5);
      detectionSource = "local";
    }

    const result = buildNutritionEstimate(predictions, detectionSource);
    showResult(result, predictions);
    saveScan(result, predictions);

    scanMessage.textContent = `Analysis complete via ${detectionSource} detection and saved to history.`;
  } catch (error) {
    console.error(error);
    scanMessage.textContent = "Analysis failed. Retake and try again. If using cloud, verify key settings.";
  } finally {
    analyzeBtn.disabled = false;
  }
}

function buildNutritionEstimate(predictions, detectionSource) {
  const matched = findBestFoodMatch(predictions);
  const confidence = matched.confidence;

  const servingGrams = Math.round(220 + confidence * 180);
  const nutrition = scaleNutrition(matched.profile.nutritionPer100g, servingGrams / 100);

  return {
    meal: matched.profile.meal,
    confidence,
    servingGrams,
    calories: Math.round(nutrition.calories),
    protein: round1(nutrition.protein),
    carbs: round1(nutrition.carbs),
    fat: round1(nutrition.fat),
    fiber: round1(nutrition.fiber),
    sodium: Math.round(nutrition.sodium),
    detectionSource,
    snapshot: lastSnapshot,
    timestamp: new Date().toISOString()
  };
}

async function detectWithCloudVision(dataUrl, apiKey) {
  const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`;
  const content = dataUrl.split(",")[1];

  const payload = {
    requests: [
      {
        image: { content },
        features: [
          { type: "LABEL_DETECTION", maxResults: 10 },
          { type: "OBJECT_LOCALIZATION", maxResults: 10 }
        ]
      }
    ]
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Cloud Vision request failed with status ${response.status}`);
  }

  const data = await response.json();
  const item = data?.responses?.[0] || {};
  const labelPredictions = (item.labelAnnotations || []).map((x) => ({
    className: x.description,
    probability: x.score || 0
  }));

  const objectPredictions = (item.localizedObjectAnnotations || []).map((x) => ({
    className: x.name,
    probability: x.score || 0
  }));

  return [...objectPredictions, ...labelPredictions]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 8);
}

function findBestFoodMatch(predictions) {
  for (const pred of predictions) {
    const label = pred.className.toLowerCase();

    for (const item of FOOD_DB) {
      if (item.keywords.some((keyword) => label.includes(keyword))) {
        return { profile: item, confidence: pred.probability };
      }
    }
  }

  return {
    profile: FALLBACK_PROFILE,
    confidence: predictions?.[0]?.probability || 0.35
  };
}

function scaleNutrition(base, factor) {
  return {
    calories: base.calories * factor,
    protein: base.protein * factor,
    carbs: base.carbs * factor,
    fat: base.fat * factor,
    fiber: base.fiber * factor,
    sodium: base.sodium * factor
  };
}

function showResult(result, predictions) {
  resultEmpty.classList.add("hidden");
  resultCard.classList.remove("hidden");

  mealName.textContent = result.meal;
  mealMeta.textContent = `${result.servingGrams} g estimated serving | ${(result.confidence * 100).toFixed(1)}% match confidence | ${result.detectionSource} detection`;

  caloriesValue.textContent = `${result.calories} kcal`;
  proteinValue.textContent = `${result.protein} g`;
  carbsValue.textContent = `${result.carbs} g`;
  fatValue.textContent = `${result.fat} g`;
  fiberValue.textContent = `${result.fiber} g`;
  sodiumValue.textContent = `${result.sodium} mg`;

  const topHints = predictions
    .slice(0, 3)
    .map((p) => `${p.className} (${(p.probability * 100).toFixed(1)}%)`)
    .join(" | ");

  predictionHints.textContent = `Vision hints: ${topHints}`;
}

function saveScan(result, predictions) {
  const entry = {
    id: makeId(),
    meal: result.meal,
    calories: result.calories,
    protein: result.protein,
    carbs: result.carbs,
    fat: result.fat,
    fiber: result.fiber,
    sodium: result.sodium,
    servingGrams: result.servingGrams,
    confidence: result.confidence,
    detectionSource: result.detectionSource,
    snapshot: result.snapshot,
    timestamp: result.timestamp,
    topPrediction: predictions?.[0]?.className || "unknown"
  };

  history = [entry, ...history].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
  renderDashboard();
  renderWeeklyTrends();
}

function clearHistory() {
  history = [];
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
  renderDashboard();
  renderWeeklyTrends();
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    historyEmpty.classList.remove("hidden");
    return;
  }

  historyEmpty.classList.add("hidden");

  for (const entry of history) {
    const card = document.createElement("article");
    card.className = "history-card";

    const dateLabel = new Date(entry.timestamp).toLocaleString();

    card.innerHTML = `
      <img src="${entry.snapshot}" alt="${entry.meal}" />
      <div class="history-card-body">
        <h4>${entry.meal}</h4>
        <p>${entry.calories} kcal | ${entry.servingGrams} g</p>
        <p>Protein ${entry.protein} g | Carbs ${entry.carbs} g | Fat ${entry.fat} g</p>
        <p>Mode: ${entry.detectionSource || "local"}</p>
        <p>${dateLabel}</p>
      </div>
    `;

    historyList.appendChild(card);
  }
}

function renderDashboard() {
  const todayEntries = history.filter((entry) => isToday(entry.timestamp));

  const totals = todayEntries.reduce(
    (acc, entry) => {
      acc.calories += Number(entry.calories) || 0;
      acc.protein += Number(entry.protein) || 0;
      acc.carbs += Number(entry.carbs) || 0;
      acc.fat += Number(entry.fat) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  totalCalories.textContent = String(Math.round(totals.calories));
  totalProtein.textContent = String(round1(totals.protein));
  totalCarbs.textContent = String(round1(totals.carbs));
  totalFat.textContent = String(round1(totals.fat));

  goalCaloriesLabel.textContent = String(goals.calories);
  goalProteinLabel.textContent = String(goals.protein);
  goalCarbsLabel.textContent = String(goals.carbs);
  goalFatLabel.textContent = String(goals.fat);

  setProgress(progressCalories, totals.calories, goals.calories);
  setProgress(progressProtein, totals.protein, goals.protein);
  setProgress(progressCarbs, totals.carbs, goals.carbs);
  setProgress(progressFat, totals.fat, goals.fat);
}

function renderWeeklyTrends() {
  const trendDays = buildLast7Days();
  const metric = trendsSettings.metric;
  const defs = getTrendMetricDefs(metric);
  const grouped = new Map();

  for (const day of trendDays) {
    grouped.set(day.key, { calories: 0, protein: 0, carbs: 0, fat: 0, scans: 0 });
  }

  for (const entry of history) {
    const key = toDateKey(new Date(entry.timestamp));
    if (!grouped.has(key)) {
      continue;
    }

    const row = grouped.get(key);
    row.calories += Number(entry.calories) || 0;
    row.protein += Number(entry.protein) || 0;
    row.carbs += Number(entry.carbs) || 0;
    row.fat += Number(entry.fat) || 0;
    row.scans += 1;
  }

  const baseline = defs.goalKey ? Number(goals[defs.goalKey]) || 0 : 0;
  const maxValue = Math.max(
    baseline,
    ...Array.from(grouped.values()).map((x) => Number(x[metric]) || 0),
    1
  );

  weekLabel.textContent = getTrendLabel(metric);
  weeklyChart.innerHTML = "";

  const totalScansInWeek = Array.from(grouped.values()).reduce((acc, x) => acc + x.scans, 0);
  if (totalScansInWeek === 0) {
    weeklyEmpty.classList.remove("hidden");
  } else {
    weeklyEmpty.classList.add("hidden");
  }

  for (const day of trendDays) {
    const data = grouped.get(day.key);
    const metricValue = Number(data[metric]) || 0;
    const displayValue = defs.round(metricValue);
    const ratio = Math.min(1, metricValue / maxValue);
    const height = Math.max(3, Math.round(ratio * 100));

    const node = document.createElement("article");
    node.className = "day-bar";
    node.innerHTML = `
      <div class="day-bar-track">
        <div class="day-bar-fill" style="height: ${height}%" title="${displayValue} ${defs.unitLabel}"></div>
      </div>
      <div class="day-bar-meta">
        <p class="day-bar-name">${day.label}</p>
        <p class="day-bar-value"><strong>${displayValue}</strong> ${defs.unitLabel} | ${data.scans} scans</p>
      </div>
    `;

    weeklyChart.appendChild(node);
  }
}

function saveTrendsSettings() {
  trendsSettings = {
    metric: getValidTrendMetric(trendMetric.value)
  };

  localStorage.setItem(TRENDS_SETTINGS_KEY, JSON.stringify(trendsSettings));
  renderWeeklyTrends();
}

function loadTrendsSettings() {
  try {
    const raw = localStorage.getItem(TRENDS_SETTINGS_KEY);
    if (!raw) {
      return { metric: "calories" };
    }

    const parsed = JSON.parse(raw);
    return { metric: getValidTrendMetric(parsed.metric) };
  } catch {
    return { metric: "calories" };
  }
}

function getValidTrendMetric(metric) {
  const allowed = ["calories", "protein", "carbs", "fat", "scans"];
  return allowed.includes(metric) ? metric : "calories";
}

function getTrendLabel(metric) {
  return `Last 7 days (${getTrendMetricDefs(metric).name})`;
}

function getTrendMetricDefs(metric) {
  const map = {
    calories: { name: "Calories", unitLabel: "kcal", goalKey: "calories", round: (v) => Math.round(v) },
    protein: { name: "Protein", unitLabel: "g", goalKey: "protein", round: (v) => round1(v) },
    carbs: { name: "Carbs", unitLabel: "g", goalKey: "carbs", round: (v) => round1(v) },
    fat: { name: "Fat", unitLabel: "g", goalKey: "fat", round: (v) => round1(v) },
    scans: { name: "Scan count", unitLabel: "scans", goalKey: "", round: (v) => Math.round(v) }
  };

  return map[getValidTrendMetric(metric)];
}

function setProgress(node, total, goal) {
  const safeGoal = Math.max(1, Number(goal) || 1);
  const ratio = Math.min(1, Number(total) / safeGoal);
  node.style.width = `${(ratio * 100).toFixed(1)}%`;
}

function saveGoals() {
  goals = {
    calories: safePositiveNumber(goalCaloriesInput.value, DEFAULT_GOALS.calories),
    protein: safePositiveNumber(goalProteinInput.value, DEFAULT_GOALS.protein),
    carbs: safePositiveNumber(goalCarbsInput.value, DEFAULT_GOALS.carbs),
    fat: safePositiveNumber(goalFatInput.value, DEFAULT_GOALS.fat)
  };

  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  renderDashboard();
  scanMessage.textContent = "Daily goals saved.";
}

function loadGoals() {
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (!raw) {
      return { ...DEFAULT_GOALS };
    }

    const parsed = JSON.parse(raw);
    return {
      calories: safePositiveNumber(parsed.calories, DEFAULT_GOALS.calories),
      protein: safePositiveNumber(parsed.protein, DEFAULT_GOALS.protein),
      carbs: safePositiveNumber(parsed.carbs, DEFAULT_GOALS.carbs),
      fat: safePositiveNumber(parsed.fat, DEFAULT_GOALS.fat)
    };
  } catch {
    return { ...DEFAULT_GOALS };
  }
}

function saveVisionSettings() {
  visionSettings = {
    useCloud: Boolean(useCloudVision.checked),
    apiKey: visionApiKey.value.trim()
  };

  localStorage.setItem(VISION_SETTINGS_KEY, JSON.stringify(visionSettings));
  updateVisionModeLabel();
  scanMessage.textContent = "Vision settings saved.";
}

function loadVisionSettings() {
  try {
    const raw = localStorage.getItem(VISION_SETTINGS_KEY);
    if (!raw) {
      return { useCloud: false, apiKey: "" };
    }

    const parsed = JSON.parse(raw);
    return {
      useCloud: Boolean(parsed.useCloud),
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : ""
    };
  } catch {
    return { useCloud: false, apiKey: "" };
  }
}

function isToday(timestamp) {
  const value = new Date(timestamp);
  const now = new Date();
  return (
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth() &&
    value.getDate() === now.getDate()
  );
}

function buildLast7Days() {
  const now = new Date();
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(now.getDate() - i);

    days.push({
      key: toDateKey(day),
      label: day.toLocaleDateString(undefined, { weekday: "short" })
    });
  }

  return days;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function safePositiveNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : fallback;
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function stopCameraStream() {
  if (!cameraStream) {
    return;
  }

  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

window.addEventListener("beforeunload", stopCameraStream);
