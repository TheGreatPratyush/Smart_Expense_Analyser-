const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const amount = document.getElementById("amount");
const category = document.getElementById("category");
const note = document.getElementById("note");
const dateInput = document.getElementById("date");

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudget");

const statusSpent = document.getElementById("statusSpent");
const statusBudget = document.getElementById("statusBudget");
const statusMessage = document.getElementById("statusMessage");
const budgetProgress = document.getElementById("budgetProgress");

const barGraph = document.getElementById("barGraph");
const pieWrapper = document.getElementById("pieWrapper");
const quoteText = document.getElementById("quoteText");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let budget = Number(localStorage.getItem("budget")) || 0;
let editIndex = null;

/* Quotes */
const quotes = [
  "A budget is telling your money where to go.",
  "Small savings today create big security tomorrow.",
  "Beware of little expenses; they sink ships.",
  "Spend less than you earn — always.",
  "Financial discipline is freedom."
];
quoteText.textContent = quotes[Math.floor(Math.random() * quotes.length)];

saveBudgetBtn.addEventListener("click", () => {
  if (budgetInput.value <= 0) return;
  budget = Number(budgetInput.value);
  localStorage.setItem("budget", budget);
  updateUI();
});

expenseForm.addEventListener("submit", e => {
  e.preventDefault();

  const expenseData = {
    amount: Number(amount.value),
    category: category.value,
    note: note.value,
    date: dateInput.value
  };

  if (editIndex !== null) {
    expenses[editIndex] = expenseData;
    editIndex = null;
  } else {
    expenses.push(expenseData);
  }

  localStorage.setItem("expenses", JSON.stringify(expenses));
  expenseForm.reset();
  updateUI();
});

function deleteExpense(i) {
  expenses.splice(i, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateUI();
}

function editExpense(i) {
  const e = expenses[i];
  amount.value = e.amount;
  category.value = e.category;
  note.value = e.note;
  dateInput.value = e.date;
  editIndex = i;
}

function updateUI() {
  expenseList.innerHTML = "";
  barGraph.innerHTML = "";
  pieWrapper.innerHTML = "";

  let total = 0;
  let catTotals = {};

  expenses.forEach((e, i) => {
    total += e.amount;
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;

    expenseList.innerHTML += `
      <li>
        <div>
          <strong>${e.category}</strong><br>
          <small>${e.note || "No note"}</small>
        </div>
        <div style="text-align:right">
          ₹${e.amount}<br>
          <small>${e.date}</small>
          <div class="exp-actions">
            <button onclick="editExpense(${i})">Edit</button>
            <button onclick="deleteExpense(${i})">Delete</button>
          </div>
        </div>
      </li>
    `;
  });

  statusSpent.textContent = total;
  statusBudget.textContent = budget;

  /* ===== Budget Progress ===== */
  budgetProgress.className = "progress-fill";
  if (budget > 0) {
    const percent = Math.min((total / budget) * 100, 100);
    budgetProgress.style.width = percent + "%";

    if (percent < 70) {
      statusMessage.textContent = "✅ Budget under control";
    } else if (percent < 100) {
      statusMessage.textContent = "⚠ Approaching budget limit";
      budgetProgress.classList.add("warning");
    } else {
      statusMessage.textContent = "🚨 Budget exceeded!";
      budgetProgress.classList.add("danger");
    }
  }

  /* ===== CATEGORY ANALYTICS ===== */
  const maxVal = Math.max(...Object.values(catTotals), 1);

  for (let cat in catTotals) {
    const row = document.createElement("div");
    row.innerHTML = `
      <div>${cat} – ₹${catTotals[cat]}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(catTotals[cat]/maxVal)*100}%"></div>
      </div>
    `;
    barGraph.appendChild(row);

    const pie = document.createElement("div");
    pie.className = "pie";
    pie.style.setProperty("--deg", `${(catTotals[cat]/total)*360}deg`);
    pie.textContent = cat;
    pieWrapper.appendChild(pie);
  }
}

updateUI();
