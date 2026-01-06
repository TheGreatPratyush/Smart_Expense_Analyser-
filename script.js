const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudget");
const budgetInfo = document.getElementById("budgetInfo");

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

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = Number(localStorage.getItem("budget")) || 0;

/* Quotes */
const quotes = [
  "A budget is telling your money where to go.",
  "Small savings today create big security tomorrow.",
  "Beware of little expenses; they sink ships.",
  "Spend less than you earn — always.",
  "Financial discipline is freedom."
];

quoteText.textContent = quotes[Math.floor(Math.random() * quotes.length)];


dateDisplay.addEventListener("click", () => dateInput.showPicker());
dateInput.addEventListener("change", () => {
  const d = new Date(dateInput.value);
  dateDisplay.textContent = d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
});

saveBudgetBtn.addEventListener("click", () => {
  if (budgetInput.value <= 0) return;
  budget = Number(budgetInput.value);
  localStorage.setItem("budget", budget);
  updateUI();
});


expenseForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!dateInput.value) return;

  expenses.push({
    amount: Number(amount.value),
    category: category.value,
    note: note.value,
    date: dateInput.value
  });

  localStorage.setItem("expenses", JSON.stringify(expenses));
  expenseForm.reset();
  dateDisplay.textContent = "📅 Select date";
  updateUI();
});


function updateUI() {
  expenseList.innerHTML = "";
  barGraph.innerHTML = "";
  pieWrapper.innerHTML = "";

  let total = 0;
  let categoryTotals = {};

  expenses.forEach(exp => {
    total += exp.amount;
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="exp-left">
        <strong>${exp.category}</strong>
        <small>${exp.note || "No note"}</small>
      </div>
      <div class="exp-right">
        <div>₹${exp.amount}</div>
        <small>${exp.date}</small>
      </div>
    `;
    expenseList.appendChild(li);
  });


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
        "⚠ You are close to exceeding your budget";
    } else {
      budgetStatusCard.classList.remove("exceeded");
      statusMessage.textContent = "✅ Budget is under control";
    }
  }


  if (total === 0) return;

  const maxVal = Math.max(...Object.values(categoryTotals));
  for (let cat in categoryTotals) {
    const row = document.createElement("div");
    row.innerHTML = `
      <div>${cat} – ₹${categoryTotals[cat]}</div>
      <div class="bar-track">
        <div class="bar-fill" style="--w:${(categoryTotals[cat]/maxVal)*100}%"></div>
      </div>
    `;
    barGraph.appendChild(row);

    const pie = document.createElement("div");
    pie.className = "pie";
    pie.style.setProperty("--deg", `${(categoryTotals[cat]/total)*360}deg`);
    pie.textContent = cat;
    pieWrapper.appendChild(pie);
  }
}

updateUI();
