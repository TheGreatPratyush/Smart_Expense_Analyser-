/* ================= SAFE STORAGE ================= */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn("Storage blocked (iOS Private Mode?)");
  }
}

function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

/* ================= DOM ================= */
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const amount = document.getElementById("amount");
const category = document.getElementById("category");
const note = document.getElementById("note");

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudget");

const statusSpent = document.getElementById("statusSpent");
const statusBudget = document.getElementById("statusBudget");
const statusMessage = document.getElementById("statusMessage");
const budgetProgress = document.getElementById("budgetProgress");
const budgetStatusCard = document.getElementById("budgetStatusCard");

const barGraph = document.getElementById("barGraph");
const pieWrapper = document.getElementById("pieWrapper");

const dateInput = document.getElementById("date");
const dateDisplay = document.getElementById("dateDisplay");

const quoteText = document.getElementById("quoteText");

/* ================= DATA ================= */
let expenses = safeGet("expenses", []);
let budget = safeGet("budget", 0);

/* ================= QUOTES ================= */
const quotes = [
  "A budget is telling your money where to go.",
  "Small savings today create big security tomorrow.",
  "Beware of little expenses; they sink ships.",
  "Spend less than you earn — always.",
  "Financial discipline is freedom."
];

if (quoteText) {
  quoteText.textContent =
    quotes[Math.floor(Math.random() * quotes.length)];
}

/* ================= DATE PICKER (iOS SAFE) ================= */
/*
  IMPORTANT:
  - input[type=date] MUST NOT be hidden
  - iOS Safari only allows focus() from user gesture
*/
dateDisplay.addEventListener("click", () => {
  dateInput.focus();
});

dateInput.addEventListener("change", () => {
  if (!dateInput.value) return;

  const d = new Date(dateInput.value);
  dateDisplay.textContent = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
});

/* ================= BUDGET ================= */
saveBudgetBtn.addEventListener("click", () => {
  if (!budgetInput.value || budgetInput.value <= 0) return;

  budget = Number(budgetInput.value);
  safeSet("budget", JSON.stringify(budget));
  updateUI();
});

/* ================= ADD EXPENSE ================= */
expenseForm.addEventListener("submit", e => {
  e.preventDefault();

  if (!amount.value || amount.value <= 0) {
    alert("Enter a valid amount");
    return;
  }

  if (!dateInput.value) {
    alert("Select a date");
    return;
  }

  expenses.push({
    amount: Number(amount.value),
    category: category.value,
    note: note.value.trim(),
    date: dateInput.value
  });

  safeSet("expenses", JSON.stringify(expenses));

  expenseForm.reset();
  dateDisplay.textContent = "📅 Select date";

  updateUI();
});

/* ================= UI RENDER ================= */
function updateUI() {
  expenseList.innerHTML = "";
  barGraph.innerHTML = "";
  pieWrapper.innerHTML = "";

  let total = 0;
  const categoryTotals = {};

  expenses.forEach(exp => {
    total += exp.amount;
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${exp.category}</strong>
        <div style="font-size:12px;opacity:.7">
          ${exp.note || "No note"}
        </div>
      </div>
      <div style="text-align:right">
        ₹${exp.amount}
        <div style="font-size:12px;opacity:.7">
          ${exp.date}
        </div>
      </div>
    `;
    expenseList.appendChild(li);
  });

  /* ----- Budget UI ----- */
  statusSpent.textContent = total;
  statusBudget.textContent = budget;

  if (budget > 0) {
    const percent = Math.min((total / budget) * 100, 100);
    budgetProgress.style.width = percent + "%";

    if (total > budget) {
      budgetStatusCard.classList.add("exceeded");
      statusMessage.textContent =
        `⚠ Budget exceeded by ₹${total - budget}`;
    } else if (total > budget * 0.8) {
      budgetStatusCard.classList.remove("exceeded");
      statusMessage.textContent =
        "⚠ You are close to your budget limit";
    } else {
      budgetStatusCard.classList.remove("exceeded");
      statusMessage.textContent =
        "✅ Budget is under control";
    }
  }

  /* ----- Analytics ----- */
  if (expenses.length === 0) {
    barGraph.innerHTML = "<p>No data yet</p>";
    return;
  }

  const maxVal = Math.max(...Object.values(categoryTotals));

  for (const cat in categoryTotals) {
    const row = document.createElement("div");
    row.innerHTML = `
      <div>${cat} – ₹${categoryTotals[cat]}</div>
      <div class="bar-track">
        <div class="bar-fill"
             style="width:${(categoryTotals[cat] / maxVal) * 100}%">
        </div>
      </div>
    `;
    barGraph.appendChild(row);

    const pie = document.createElement("div");
    pie.className = "pie";
    pie.style.setProperty(
      "--deg",
      `${(categoryTotals[cat] / total) * 360}deg`
    );
    pie.textContent = cat;
    pieWrapper.appendChild(pie);
  }
}

/* ================= INIT ================= */
updateUI();
