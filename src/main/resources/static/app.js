let accounts = [];
const $ = (id) => document.getElementById(id);

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

async function loadHealth() {
  try {
    const data = await api("/api/health");
    const up = data.status === "UP";
    $("topStatus").textContent = up ? "UP" : "DOWN";
    $("appHealth").textContent = up ? "UP" : "DOWN";
    $("apiHealth").textContent = up ? "UP" : "DOWN";
    $("k8sHealth").textContent = up ? "UP" : "DOWN";
    $("systemPill").classList.toggle("down", !up);
  } catch {
    $("topStatus").textContent = "DOWN";
    $("appHealth").textContent = "DOWN";
    $("apiHealth").textContent = "DOWN";
    $("k8sHealth").textContent = "Unavailable";
    $("systemPill").classList.add("down");
  }
}

async function loadAccounts() {
  try {
    accounts = await api("/api/accounts");
    const total = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);

    $("totalBalance").textContent = money(total);
    $("summaryBalance").textContent = money(total);
    $("accountCount").textContent = accounts.length;
    $("accountSummary").textContent = `Across ${accounts.length} Account(s)`;

    $("accountsList").innerHTML = accounts.map((account) => `
      <article class="account-card">
        <div class="account-top">
          <div>
            <div class="account-code">${escapeHtml(account.id)}</div>
            <div class="account-type">${escapeHtml(account.customerName)}</div>
          </div>
          <span class="active-badge">Active</span>
        </div>
        <div class="account-balance-label">Balance</div>
        <div class="account-balance">${money(account.balance)}</div>
      </article>
    `).join("");

    const options = accounts.map((a) =>
      `<option value="${escapeAttr(a.id)}">${escapeHtml(a.id)} — ${money(a.balance)}</option>`
    ).join("");

    $("fromAccount").innerHTML = options;
    $("toAccount").innerHTML = accounts.map((a) =>
      `<option value="${escapeAttr(a.id)}">${escapeHtml(a.id)} — ${money(a.balance)}</option>`
    ).join("");

    if (accounts.length > 1) $("toAccount").value = accounts[1].id;
  } catch {
    $("accountsList").innerHTML = `<div class="empty">Unable to load accounts. Start the Spring Boot API first.</div>`;
  }
}

async function loadTransactions() {
  try {
    const transactions = await api("/api/transactions");
    $("transactionCount").textContent = transactions.length;

    if (!transactions.length) {
      $("transactionsList").innerHTML = `<div class="empty">No transactions yet.</div>`;
      return;
    }

    $("transactionsList").innerHTML = transactions.slice().reverse().map((tx) => {
      const success = tx.status === "SUCCESS";
      const outgoing = tx.fromAccount === "ACC1001";
      return `
        <div class="tx">
          <div class="tx-icon ${outgoing ? "" : "down"}">${outgoing ? "↗" : "↙"}</div>
          <div class="tx-main">
            <strong>${escapeHtml(tx.fromAccount)} → ${escapeHtml(tx.toAccount)}</strong>
            <span>Transfer · ${formatTime(tx.timestamp)}</span>
          </div>
          <div class="tx-right">
            <div class="tx-amount ${outgoing ? "" : "out"}">${outgoing ? "" : "-"}${money(tx.amount)}</div>
            <span class="tx-status ${success ? "" : "failed"}">${escapeHtml(tx.status)}</span>
          </div>
        </div>
      `;
    }).join("");
  } catch {
    $("transactionsList").innerHTML = `<div class="empty">Unable to load transactions.</div>`;
  }
}

$("transferForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const from = $("fromAccount").value;
  const to = $("toAccount").value;
  const amount = Number($("amount").value);
  const message = $("transferMessage");

  message.className = "message";
  message.textContent = "Processing transfer...";

  if (!from || !to || from === to) {
    message.className = "message error";
    message.textContent = "Choose two different accounts.";
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    message.className = "message error";
    message.textContent = "Enter a valid amount.";
    return;
  }

  try {
    const result = await api("/api/transactions", {
      method: "POST",
      body: JSON.stringify({ fromAccount: from, toAccount: to, amount })
    });

    if (result.status === "SUCCESS") {
      message.className = "message success";
      message.textContent = `Transfer successful — ${money(amount)} sent.`;
      $("amount").value = "";
      await Promise.all([loadAccounts(), loadTransactions()]);
    } else {
      message.className = "message error";
      message.textContent = result.status.replaceAll("_", " ");
    }
  } catch {
    message.className = "message error";
    message.textContent = "Unable to process the transaction.";
  }
});

document.querySelector(".menu-btn").addEventListener("click", () => {
  document.querySelector(".sidebar").classList.toggle("collapsed");
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));
}
function escapeAttr(value) {
  return escapeHtml(value);
}

loadHealth();
loadAccounts();
loadTransactions();
