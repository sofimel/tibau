const eventTime = Date.parse("2027-01-01T00:00:00-03:00");
const units = ["days", "hours", "minutes", "seconds"].map(id => document.getElementById(id));

function updateTimer() {
  const remaining = Math.max(0, Math.ceil((eventTime - Date.now()) / 1000));
  const values = [Math.floor(remaining / 86400), Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60];
  units.forEach((element, index) => {
    element.textContent = String(values[index]).padStart(2, "0");
  });
  if (!remaining) document.getElementById("count-title").textContent = "Feliz 2027!";
}

updateTimer();
setInterval(updateTimer, 1000);

const drinks = [
  { name: "Skol Beats", lines: ["Skol", "Beats"], color: "#77caff" },
  { name: "Bananinha", lines: ["Bananinha"], color: "#ffe179" },
  { name: "Xeque Mate", lines: ["Xeque", "Mate"], color: "#ffab84" },
  { name: "Vodka", lines: ["Vodka"], color: "#c0baff" },
  { name: "Ypióca Guaraná", lines: ["Ypióca", "Guaraná"], color: "#f7a7d6" },
  { name: "Lima Limão", lines: ["Lima", "Limão"], color: "#a9e89b" },
  { name: "Champanhe", lines: ["Champanhe"], color: "#f7a7d6" },
  { name: "Bebida surpresa", lines: ["Bebida", "Surpresa"], color: "#ffe179" }
];
const sector = 360 / drinks.length;
const wheel = document.getElementById("wheel");
const svgNS = "http://www.w3.org/2000/svg";

function addShape(tag, attributes, label) {
  const shape = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([key, value]) => shape.setAttribute(key, value));
  if (label) shape.textContent = label;
  wheel.append(shape);
}

function point(degrees, radius) {
  const angle = degrees * Math.PI / 180;
  return [180 + radius * Math.sin(angle), 180 - radius * Math.cos(angle)];
}

drinks.forEach(({ lines, color }, index) => {
  const middle = index * sector;
  const start = point(middle - sector / 2, 173);
  const end = point(middle + sector / 2, 173);
  addShape("path", {
    d: "M180 180 L" + start.join(" ") + " A173 173 0 0 1 " + end.join(" ") + " Z",
    fill: color, stroke: "#101822", "stroke-width": 2
  });
  const [x, y] = point(middle, 120);
  lines.forEach((line, row) => {
    addShape("text", {
      x, y: y + (row - (lines.length - 1) / 2) * 21,
      fill: "#101822", "font-size": 19, "font-weight": 850,
      "text-anchor": "middle", "dominant-baseline": "middle"
    }, line);
  });
});
addShape("circle", { cx: 180, cy: 180, r: 174, fill: "none", stroke: "#eef6ff", "stroke-width": 4 });
addShape("circle", { cx: 180, cy: 180, r: 30, fill: "#101822", stroke: "#eef6ff", "stroke-width": 3 });
addShape("text", {
  x: 180, y: 181, fill: "#69c8ff", "font-size": 30,
  "text-anchor": "middle", "dominant-baseline": "middle"
}, "✳");

const key = "virada-tibau-2027";
const rsvp = document.getElementById("rsvp");
const draw = document.getElementById("draw");
const hint = document.getElementById("draw-hint");
const result = document.getElementById("result");
let entry = {};

try {
  entry = JSON.parse(localStorage.getItem(key)) || {};
} catch {
  // The form still works for the current visit.
}

function save() {
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Some browser modes disable local storage.
  }
}

function renderConfirmation() {
  rsvp.textContent = "Presença confirmada ✓";
  rsvp.disabled = true;
  draw.disabled = false;
  hint.textContent = "Uma rodada por navegador. Valendo!";
}

function showResult(drink) {
  draw.disabled = true;
  draw.textContent = "Bebida sorteada ✓";
  hint.hidden = true;
  result.hidden = false;
  result.textContent = "Sua missão é levar " + drink + "!";
}

function stopAngle(index) {
  return (360 - index * sector) % 360;
}

rsvp.addEventListener("click", () => {
  entry = { confirmed: true };
  save();
  renderConfirmation();
  draw.focus();
});

draw.addEventListener("click", () => {
  if (!entry.confirmed || entry.drink) return;
  const index = Math.floor(Math.random() * drinks.length);
  entry.drink = drinks[index].name;
  save();
  draw.disabled = true;
  draw.textContent = "Girando…";
  hint.hidden = true;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    wheel.style.transform = "rotate(" + stopAngle(index) + "deg)";
    showResult(entry.drink);
    return;
  }

  wheel.style.transform = "rotate(" + (360 * 5 + stopAngle(index)) + "deg)";
  wheel.addEventListener("transitionend", () => showResult(entry.drink), { once: true });
  wheel.addEventListener("transitioncancel", () => showResult(entry.drink), { once: true });
});

if (entry.confirmed || entry.name) {
  entry = { confirmed: true, drink: entry.drink };
  renderConfirmation();
  const savedDrink = typeof entry.drink === "string" ? entry.drink.replace(/^(⚡|🍌) /u, "") : "";
  const savedIndex = drinks.findIndex(drink => drink.name === savedDrink);
  if (savedIndex >= 0) {
    wheel.style.transition = "none";
    wheel.style.transform = "rotate(" + stopAngle(savedIndex) + "deg)";
    showResult(savedDrink);
  } else {
    delete entry.drink;
  }
  save();
}
