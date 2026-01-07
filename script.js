const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const amount = document.getElementById("amount");
const category = document.getElementById("category");
const note = document.getElementById("note");
const dateInput = document.getElementById("date");
const dateDisplay = document.getElementById("dateDisplay");

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudget");

const statusSpent = document.getElementById("statusSpent");
const statusBudget = document.getElementById("statusBudget");
const statusMessage = document.getElementById("statusMessage");
const budgetProgress = document.getElementById("budgetProgress");
const budgetStatusCard = document.getElementById("budgetStatusCard");

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

/* Date display update */
dateInput.addEventListener("change", () => {
  const d = new Date(dateInput.value);
  dateDisplay.textContent = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
});

/* Budget */
saveBudgetBtn.addEventListener("click", () => {
  if (budgetInput.value <= 0) return;
  budget = Number(budgetInput.value);
  localStorage.setItem("budget", budget);
  updateUI();
});

/* Add / Edit Expense */
expenseForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!dateInput.value) return;

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
  dateDisplay.textContent = "📅 Select date";
  updateUI();
});

/* Delete */
function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateUI();
}

/* Edit */
function editExpense(index) {
  const exp = expenses[index];
  amount.value = exp.amount;
  category.value = exp.category;
  note.value = exp.note;
  dateInput.value = exp.date;
  dateDisplay.textContent = exp.date;
  editIndex = index;
}

function updateUI() {
  expenseList.innerHTML = "";
  barGraph.innerHTML = "";
  pieWrapper.innerHTML = "";

  let total = 0;
  let categoryTotals = {};

  expenses.forEach((exp, index) => {
    total += exp.amount;
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${exp.category}</strong>
        <small>${exp.note || "No note"}</small>
      </div>
      <div style="text-align:right">
        ₹${exp.amount}
        <small>${exp.date}</small>
        <div class="exp-actions">
          <button onclick="editExpense(${index})">Edit</button>
          <button onclick="deleteExpense(${index})">Delete</button>
        </div>
      </div>
    `;
    expenseList.appendChild(li);
  });

  statusSpent.textContent = total;
  statusBudget.textContent = budget;

  if (budget > 0) {
    const percent = Math.min((total / budget) * 100, 100);
    budgetProgress.style.width = percent + "%";
    statusMessage.textContent =
      total > budget ? "⚠ Budget exceeded" : "✅ Budget under control";
  }

  if (total === 0) return;

  const maxVal = Math.max(...Object.values(categoryTotals));
  for (let cat in categoryTotals) {
    const row = document.createElement("div");
    row.innerHTML = `
      <div>${cat} – ₹${categoryTotals[cat]}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(categoryTotals[cat]/maxVal)*100}%"></div>
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
