const API_URL = "https://script.google.com/macros/s/AKfycbxuR9Foo3zfqF3_4i9_TMYG78Md8tivHLuOBWU0pPqWN9m7PJykcm7wxKIY34HHvdrdsQ/exec";

/* ===== API HELPER ===== */
async function api(action, payload = {}) {
  const res = await fetch(https://script.google.com/macros/s/AKfycbxuR9Foo3zfqF3_4i9_TMYG78Md8tivHLuOBWU0pPqWN9m7PJykcm7wxKIY34HHvdrdsQ/exec, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload })
  });
  return res.json();
}

document.addEventListener("DOMContentLoaded", () => {

  let data = { income: [], expense: [] };
  let categories = { incomeCategories: [], expenseCategories: [], thresholds: {} };
  let topExpensesChart, paymentMethodChart, monthlyComboChart;

  const authContainer = document.getElementById("authContainer");
  const appContent = document.getElementById("appContent");
  const sidebar = document.getElementById("sidebar");
  const navIcon = document.getElementById("navIcon");
  const closeSidebar = document.getElementById("closeSidebar");
  const rememberMe = document.getElementById("rememberMe");

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const sidebarUsername = document.getElementById("sidebarUsername");
  const welcomeCard = document.getElementById("welcomeCard");

  /* ===== REMEMBER ME ===== */
  if (localStorage.getItem("rememberEmail")) {
    loginEmail.value = localStorage.getItem("rememberEmail");
    loginPassword.value = localStorage.getItem("rememberPassword");
    rememberMe.checked = true;
  }

  /* ===== AUTH ===== */
  document.getElementById("signupBtn").onclick = async () => {
    const username = signupUsername.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();
    if (!username || !email || !password) return alert("Fill all fields");

    const res = await api("signup", { username, email, password });
    alert(res.message);
    if (res.success) show(loginBox);
  };

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

  /* ===== NAVIGATION ===== */
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
  const modal = document.getElementById("modal");

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
    incomeCategories.innerHTML = "";
    expenseCategories.innerHTML = "";

    categories.incomeCategories.forEach(c => incomeCategories.innerHTML += `<li>${c}</li>`);
    categories.expenseCategories.forEach(c =>
      expenseCategories.innerHTML += `<li>${c} (Threshold: ${categories.thresholds[c] || 0})</li>`
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

  showPage("dashboard");
});


