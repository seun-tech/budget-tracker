const API_URL = "https://script.google.com/macros/s/AKfycbzVIiQAjDcvvUqEXSqTK00yAn12IUkL0NvdRA3dMOsi1pzZwHCrL0lfad_d5Z3R3p1Yng/exec";const API_URL = "https://script.google.com/macros/s/AKfycbzVIiQAjDcvvUqEXSqTK00yAn12IUkL0NvdRA3dMOsi1pzZwHCrL0lfad_d5Z3R3p1Yng/exec";

/* ===== API HELPER ===== */
async function api(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload })
  });
  return res.json();
}

document.addEventListener("DOMContentLoaded", () => {

  /* ===== ELEMENT DEFINITIONS ===== */
  // Auth containers
  const authContainer = document.getElementById("authContainer");
  const loginBox = document.getElementById("loginBox");
  const signupBox = document.getElementById("signupBox");
  const forgotBox = document.getElementById("forgotBox");

  // Inputs
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const signupUsername = document.getElementById("signupUsername");
  const signupEmail = document.getElementById("signupEmail");
  const signupPassword = document.getElementById("signupPassword");
  const forgotEmail = document.getElementById("forgotEmail");

  // Buttons & links
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const signupBtn = document.getElementById("signupBtn");
  const forgotBtn = document.getElementById("forgotBtn");
  const showSignup = document.getElementById("showSignup");
  const showForgot = document.getElementById("showForgot");
  const backToLogin1 = document.getElementById("backToLogin1");
  const backToLogin2 = document.getElementById("backToLogin2");

  // Sidebar
  const sidebar = document.getElementById("sidebar");
  const navIcon = document.getElementById("navIcon");
  const closeSidebar = document.getElementById("closeSidebar");
  const sidebarUsername = document.getElementById("sidebarUsername");

  // App content
  const appContent = document.getElementById("appContent");
  const welcomeCard = document.getElementById("welcomeCard");
  const themeSelect = document.getElementById("themeSelect");

  // Modal
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalType = document.getElementById("modalType");
  const editIndex = document.getElementById("editIndex");
  const modalDate = document.getElementById("modalDate");
  const modalName = document.getElementById("modalName");
  const modalAmount = document.getElementById("modalAmount");
  const modalPayment = document.getElementById("modalPayment");
  const modalSubmit = document.getElementById("modalSubmit");
  const modalCancel = document.getElementById("modalCancel");

  // Income / Expense page elements
  const addIncomeBtn = document.getElementById("addIncomeBtn");
  const addExpenseBtn = document.getElementById("addExpenseBtn");
  const incomeCategoriesEl = document.getElementById("incomeCategories");
  const expenseCategoriesEl = document.getElementById("expenseCategories");
  const addIncomeCategoryBtn = document.getElementById("addIncomeCategoryBtn");
  const addExpenseCategoryBtn = document.getElementById("addExpenseCategoryBtn");
  const newIncomeCategory = document.getElementById("newIncomeCategory");
  const newExpenseCategory = document.getElementById("newExpenseCategory");
  const newExpenseThreshold = document.getElementById("newExpenseThreshold");

  const rememberMe = document.getElementById("rememberMe");

  // Dashboard elements
  const totalIncome = document.getElementById("totalIncome");
  const totalExpense = document.getElementById("totalExpense");
  const balance = document.getElementById("balance");

  /* ===== INITIAL DATA ===== */
  let data = { income: [], expense: [] };
  let categories = { incomeCategories: [], expenseCategories: [], thresholds: {} };

  /* ===== REMEMBER ME ===== */
  if (localStorage.getItem("rememberEmail")) {
    loginEmail.value = localStorage.getItem("rememberEmail");
    loginPassword.value = localStorage.getItem("rememberPassword");
    rememberMe.checked = true;
  }

  /* ===== AUTH NAVIGATION ===== */
  function show(box) {
    loginBox.classList.add("hidden");
    signupBox.classList.add("hidden");
    forgotBox.classList.add("hidden");
    box.classList.remove("hidden");
  }

  showSignup.onclick = () => show(signupBox);
  showForgot.onclick = () => show(forgotBox);
  backToLogin1.onclick = () => show(loginBox);
  backToLogin2.onclick = () => show(loginBox);

  /* ===== SIGNUP ===== */
  signupBtn.onclick = async () => {
    const username = signupUsername.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();
    if (!username || !email || !password) return alert("Fill all fields");

    const res = await api("signup", { username, email, password });
    alert(res.message);
    if (res.success) show(loginBox);
  };

  /* ===== LOGIN ===== */
  loginBtn.onclick = async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    if (!email || !password) return alert("Enter email & password");

    const res = await api("login", { email, password });
    if (res.loggedIn) {
      authContainer.style.display = "none";
      appContent.style.display = "block";
      sidebarUsername.innerText = res.username || email;

      if (rememberMe.checked) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberPassword", password);
      } else {
        localStorage.clear();
      }

      welcomeCard.style.display = "block";
      setTimeout(() => welcomeCard.style.display = "none", 3000);
      fetchData();
    } else alert(res.message || "Login failed");
  };

  forgotBtn.onclick = async () => {
    const email = forgotEmail.value.trim();
    if (!email) return alert("Enter email");

    const res = await api("forgotPassword", { email });
    alert(res.message);
  };

  logoutBtn.onclick = () => {
    appContent.style.display = "none";
    authContainer.style.display = "flex";
    loginPassword.value = "";
  };

  /* ===== SIDEBAR ===== */
  navIcon.onclick = () => {
    sidebar.classList.add("open");
    document.querySelector(".content").classList.add("open");
  };
  closeSidebar.onclick = () => {
    sidebar.classList.remove("open");
    document.querySelector(".content").classList.remove("open");
  };
  document.querySelectorAll(".sidebar ul li").forEach(li => {
    li.onclick = () => {
      document.querySelectorAll(".sidebar ul li").forEach(x => x.classList.remove("active"));
      li.classList.add("active");
      showPage(li.dataset.page);
      sidebar.classList.remove("open");
      document.querySelector(".content").classList.remove("open");
    };
  });

  function showPage(page) {
    document.querySelectorAll("#pageContent > div.card").forEach(d => d.classList.add("hidden"));
    document.getElementById(page).classList.remove("hidden");
    updateDashboard();
  }

  /* ===== THEME ===== */
  themeSelect.onchange = e => {
    document.body.className = e.target.value === "dark" ? "dark" : "";
  };

  /* ===== MODAL ===== */
  modalCancel.onclick = () => modal.style.display = "none";
  addIncomeBtn.onclick = () => openModal("income");
  addExpenseBtn.onclick = () => openModal("expense");

  function openModal(type, index = -1) {
    modal.style.display = "block";
    modalType.value = type;
    editIndex.value = index;
    modalTitle.innerText = (index === -1 ? "Add " : "Edit ") + type;

    modalName.innerHTML = "";
    (type === "income" ? categories.incomeCategories : categories.expenseCategories)
      .forEach(c => modalName.innerHTML += `<option>${c}</option>`);

    if (index >= 0) {
      const e = data[type][index];
      modalDate.value = e.date;
      modalName.value = e.name;
      modalAmount.value = e.amount;
      modalPayment.value = e.payment;
    } else {
      modalDate.value = "";
      modalAmount.value = "";
      modalPayment.value = "Cash";
    }
  }

  modalSubmit.onclick = async () => {
    const type = modalType.value;
    const index = Number(editIndex.value);
    const entry = {
      date: modalDate.value,
      name: modalName.value,
      amount: Number(modalAmount.value),
      payment: modalPayment.value
    };

    await api("submitEntry", { type, index, entry });
    index >= 0 ? data[type][index] = entry : data[type].push(entry);
    renderTables();
    updateDashboard();
    modal.style.display = "none";
  };

  window.deleteEntry = async (type, i) => {
    if (!confirm("Delete?")) return;
    await api("deleteEntry", { type, index: i });
    data[type].splice(i, 1);
    renderTables();
    updateDashboard();
  };

  /* ===== DATA ===== */
  async function fetchData() {
    data = await api("getData");
    categories = await api("getCategories");
    renderTables();
    renderCategories();
    updateDashboard();
  }

  function renderTables() {
    ["income", "expense"].forEach(type => {
      const tbody = document.querySelector(`#${type}Table tbody`);
      tbody.innerHTML = "";
      data[type].forEach((r, i) => {
        tbody.innerHTML += `
          <tr>
            <td>${r.date}</td>
            <td>${r.name}</td>
            <td>${r.amount}</td>
            <td>${r.payment}</td>
            <td>
              <button onclick="editEntry('${type}',${i})">Edit</button>
              <button onclick="deleteEntry('${type}',${i})">Delete</button>
            </td>
          </tr>`;
      });
    });
  }

  function renderCategories() {
    incomeCategoriesEl.innerHTML = "";
    expenseCategoriesEl.innerHTML = "";

    categories.incomeCategories.forEach(c => incomeCategoriesEl.innerHTML += `<li>${c}</li>`);
    categories.expenseCategories.forEach(c =>
      expenseCategoriesEl.innerHTML += `<li>${c} (Threshold: ${categories.thresholds[c] || 0})</li>`
    );
  }

  addIncomeCategoryBtn.onclick = async () => {
    const v = newIncomeCategory.value.trim();
    if (!v) return;
    await api("addIncomeCategory", { cat: v });
    categories.incomeCategories.push(v);
    renderCategories();
    newIncomeCategory.value = "";
  };

  addExpenseCategoryBtn.onclick = async () => {
    const v = newExpenseCategory.value.trim();
    const t = Number(newExpenseThreshold.value) || 0;
    if (!v) return;
    await api("addExpenseCategory", { cat: v, thresh: t });
    categories.expenseCategories.push(v);
    categories.thresholds[v] = t;
    renderCategories();
    newExpenseCategory.value = "";
    newExpenseThreshold.value = "";
  };

  function updateDashboard() {
    const totalInc = data.income.reduce((a, b) => a + b.amount, 0);
    const totalExp = data.expense.reduce((a, b) => a + b.amount, 0);
    totalIncome.innerText = totalInc;
    totalExpense.innerText = totalExp;
    balance.innerText = totalInc - totalExp;
  }

  // Show dashboard by default
  showPage("dashboard");
});


