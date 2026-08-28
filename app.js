const icons = {
  arrowRight:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  x:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  menu:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  lock:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2M6.5 10h11A1.5 1.5 0 0 1 19 11.5v7A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-7A1.5 1.5 0 0 1 6.5 10Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  copy:
    '<svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 8.5A2.5 2.5 0 0 1 10.5 6h6A2.5 2.5 0 0 1 19 8.5v6A2.5 2.5 0 0 1 16.5 17h-6A2.5 2.5 0 0 1 8 14.5v-6Z" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 17v.5A2.5 2.5 0 0 1 13 20H7.5A2.5 2.5 0 0 1 5 17.5V12a2.5 2.5 0 0 1 2.5-2.5H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

const plans = [
  {
    id: "month",
    name: "1 个月",
    duration: "按月使用",
    price: 49,
    originalPrice: 49,
    monthly: 49,
    discount: "无需长期承诺",
    devices: "支持 5 台设备",
    traffic: "不限流量",
    platforms: "iOS, Android, macOS, Windows",
  },
  {
    id: "six",
    name: "6 个月",
    duration: "半年使用",
    price: 239,
    originalPrice: 294,
    monthly: 39.8,
    discount: "节省 ¥55",
    devices: "支持 5 台设备",
    traffic: "不限流量",
    platforms: "iOS, Android, macOS, Windows",
  },
  {
    id: "year",
    name: "12 个月",
    duration: "全年使用",
    price: 399,
    originalPrice: 588,
    monthly: 33.3,
    discount: "节省 ¥189",
    devices: "支持 8 台设备",
    traffic: "不限流量",
    platforms: "iOS, Android, macOS, Windows",
    recommended: true,
  },
];

const platforms = [
  { id: "ios", name: "iPhone / iPad", symbol: "iOS", note: "使用移动端应用，一步添加配置。" },
  { id: "android", name: "Android", symbol: "A", note: "安装应用，添加订阅，然后连接。" },
  { id: "windows", name: "Windows", symbol: "W", note: "适合工作与日常浏览的桌面设置。" },
  { id: "macos", name: "macOS", symbol: "mac", note: "安静驻留在菜单栏，适合日常使用。" },
];

const setupSteps = [
  { id: "download", label: "下载" },
  { id: "install", label: "安装" },
  { id: "config", label: "添加配置" },
  { id: "connect", label: "连接" },
  { id: "complete", label: "完成" },
];

const appState = {
  route: "landing",
  selectedPlanId: "year",
  orderStatus: "created",
  paymentStatus: "idle",
  paymentMethod: "card",
  email: "",
  legalAccepted: false,
  couponInput: "",
  couponStatus: "idle",
  couponDiscount: 0,
  selectedPlatformId: "macos",
  setupStatus: "not_started",
  currentStep: 0,
  mobileMenuOpen: false,
  openFaqId: "refunds",
  copied: false,
  lastError: "",
};

const app = document.querySelector("#app");

function selectedPlan() {
  return plans.find((plan) => plan.id === appState.selectedPlanId) || plans[2];
}

function selectedPlatform() {
  return platforms.find((platform) => platform.id === appState.selectedPlatformId) || platforms[3];
}

function money(value) {
  return `¥${Number(value).toFixed(value % 1 ? 1 : 0)}`;
}

function subtotal() {
  return selectedPlan().price;
}

function finalPrice() {
  return Math.max(0, subtotal() - appState.couponDiscount);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setState(nextState, options = {}) {
  const activeField = options.preserveFocus ? document.activeElement?.dataset?.field : null;
  const selectionStart = options.preserveFocus ? document.activeElement?.selectionStart : null;
  const selectionEnd = options.preserveFocus ? document.activeElement?.selectionEnd : null;
  Object.assign(appState, nextState);
  render();
  if (activeField) {
    const nextField = document.querySelector(`[data-field="${activeField}"]`);
    nextField?.focus();
    if (typeof selectionStart === "number" && typeof selectionEnd === "number") {
      try {
        nextField.setSelectionRange(selectionStart, selectionEnd);
      } catch {
        // Some input types, including email in certain browsers, do not expose text selection.
      }
    }
  }
}

function navigate(route) {
  setState({ route, mobileMenuOpen: false });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Brand() {
  return `
    <a class="brand" href="#" data-route="landing" aria-label="QuietVPN 首页">
      <span class="brand-mark" aria-hidden="true">${icons.lock}</span>
      <span>QuietVPN</span>
    </a>
  `;
}

function Button(label, variant = "primary", attrs = "", icon = "") {
  return `<button class="btn btn-${variant}" ${attrs}>${label}${icon}</button>`;
}

function Header() {
  return `
    <header class="site-header">
      <div class="container header-inner">
        ${Brand()}
        <nav class="main-nav ${appState.mobileMenuOpen ? "open" : ""}" aria-label="主导航">
          <a href="#features" data-anchor="features">功能</a>
          <a href="#pricing" data-anchor="pricing">套餐</a>
          <a href="#" data-route="setup-entry">下载</a>
          <a href="#help" data-anchor="help">帮助</a>
        </nav>
        <div class="header-actions">
          <button class="btn btn-ghost login-link" type="button">登录</button>
          ${Button("立即开始", "primary", 'data-route="pricing"')}
          <button class="btn btn-secondary mobile-menu-toggle" type="button" data-action="toggle-menu" aria-label="打开菜单">${icons.menu}</button>
        </div>
      </div>
    </header>
  `;
}

function Footer() {
  return `
    <footer class="footer">
      <div class="container footer-inner">
        <span>QuietVPN</span>
        <span>简单、安静的私人连接。</span>
      </div>
    </footer>
  `;
}

function Landing() {
  return `
    <main>
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <p class="eyebrow">简单、安静的私人连接。</p>
            <h1>适合日常使用的快速 VPN。</h1>
            <p class="hero-copy">
              选择套餐，连接第一台设备，让日常浏览保持被保护的状态，同时不需要复杂设置。
            </p>
            <div class="support-row" aria-label="支持平台">
              <span>支持</span>
              <span class="platform-chip">iOS</span>
              <span class="platform-chip">Android</span>
              <span class="platform-chip">macOS</span>
              <span class="platform-chip">Windows</span>
            </div>
          </div>
          ${HeroPricing()}
        </div>
      </section>
      ${FeaturesSection()}
      ${PreHelpCTA()}
      ${FAQSection()}
    </main>
  `;
}

function FeaturesSection() {
  const features = [
    ["01", "连接不需要复杂步骤", "一个账号即可完成购买、支付，并进入第一台设备的安装流程。"],
    ["02", "为日常使用而设计", "适合浏览、视频与工作，不需要先理解一堆技术设置。"],
    ["03", "一个账号覆盖常用设备", "从手机或电脑开始都可以，安装步骤保持清晰一致。"],
    ["04", "按需要选择连接地区", "常用线路可以快速切换，让不同场景都有合适的连接选择。"],
  ];
  return `
    <section class="section" id="features">
      <div class="container">
        <div class="section-header">
          <p class="section-kicker">功能</p>
          <h2 class="section-title">围绕用户真正需要 VPN 的时刻设计。</h2>
        </div>
        <div class="feature-list">
          ${features
            .map(
              ([number, title, body]) => `
                <article class="feature-item">
                  <span class="feature-number">${number}</span>
                  <div>
                    <h3>${title}</h3>
                    <p>${body}</p>
                  </div>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function PlanCard(plan) {
  const selected = plan.id === appState.selectedPlanId;
  return `
    <article class="plan-card ${plan.recommended ? "recommended" : ""} ${selected ? "selected" : ""}">
      ${plan.recommended ? '<span class="plan-badge">推荐套餐</span>' : ""}
      <h3>${plan.name}</h3>
      <p class="plan-duration">${plan.duration}</p>
      <div class="price">
        <strong>${money(plan.price)}</strong>
        <span>/ ${plan.name}</span>
      </div>
      <div class="monthly">月均 ${money(plan.monthly)} · ${plan.discount}</div>
      <ul class="plan-details">
        <li>${icons.check}<span>${plan.devices}</span></li>
        <li>${icons.check}<span>${plan.traffic}</span></li>
        <li>${icons.check}<span>${plan.platforms}</span></li>
      </ul>
      ${Button(selected ? "当前选择" : "选择套餐", selected ? "secondary" : "primary", `data-select-plan="${plan.id}"`, icons.arrowRight)}
    </article>
  `;
}

function HeroPricing() {
  return `
    <div class="hero-pricing" id="pricing">
        <div class="section-header">
          <p class="section-kicker">套餐</p>
          <h2 class="section-title">选择适合接下来使用节奏的订阅周期。</h2>
          <p class="section-copy">所有套餐均包含不限流量、常用桌面与移动平台，并在支付后进入引导式安装。</p>
        </div>
        <div class="pricing-grid">
          ${plans.map(PlanCard).join("")}
        </div>
    </div>
  `;
}

function PreHelpCTA() {
  return `
    <section class="section cta-section" aria-label="开始购买">
      <div class="container cta-inner">
        <div>
          <p class="section-kicker">准备开始</p>
          <h2 class="section-title">选择好套餐后，可以直接继续支付。</h2>
          <p class="section-copy">支付完成后会立即进入设备选择与安装流程。</p>
        </div>
        <div class="section-actions">
          ${Button("立即开始", "primary", 'data-route="checkout"', icons.arrowRight)}
          ${Button("查看套餐", "secondary", 'data-anchor="pricing"')}
        </div>
      </div>
    </section>
  `;
}

function FAQSection() {
  const items = [
    ["refunds", "支付后还能更改吗？", "可以。当前订单会保留，你也可以稍后回到安装流程。退款规则可在接入真实支付渠道后按业务政策配置。"],
    ["devices", "可以使用几台设备？", "每个套餐都会展示包含的设备数量。支付完成后，你可以先从一台设备开始安装。"],
    ["setup", "需要技术基础吗？", "不需要。安装流程按任务拆分为下载、安装、添加配置、连接和完成。"],
  ];
  return `
    <section class="section" id="help">
      <div class="container">
        <div class="section-header">
          <p class="section-kicker">帮助</p>
          <h2 class="section-title">支付前需要知道的几件事。</h2>
        </div>
        <div class="faq-list">
          ${items
            .map(([id, question, answer]) => {
              const open = appState.openFaqId === id;
              return `
                <article class="faq-item">
                  <button class="faq-button" type="button" data-faq="${id}" aria-expanded="${open}">
                    <span>${question}</span>
                    <span aria-hidden="true">${open ? "-" : "+"}</span>
                  </button>
                  ${open ? `<div class="faq-panel">${answer}</div>` : ""}
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function Checkout() {
  return `
    <main class="app-view">
      <div class="container">
        <div class="view-header">
          <p class="eyebrow">支付</p>
          <h1>再完成几项信息即可购买。</h1>
          <p>已自动带入你选择的套餐。填写邮箱，选择支付方式，然后继续。</p>
        </div>
        <div class="checkout-grid">
          ${CheckoutForm()}
          ${OrderSummary()}
        </div>
      </div>
      ${MobilePayBar()}
    </main>
  `;
}

function FormField({ id, label, value, type = "text", placeholder = "", message = "", error = "" }) {
  return `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" type="${type}" value="${escapeHtml(value)}" placeholder="${placeholder}" aria-invalid="${Boolean(error)}" data-field="${id}" />
      <div class="field-message ${error ? "error" : ""}">${error || message}</div>
    </div>
  `;
}

function PaymentMethod() {
  const methods = [
    ["card", "银行卡", "Visa / Mastercard"],
    ["alipay", "支付宝", "扫码或应用内支付"],
    ["wechat", "微信支付", "扫码支付"],
  ];
  return `
    <div class="payment-methods" role="radiogroup" aria-label="支付方式">
      ${methods
        .map(
          ([id, name, note]) => `
            <button class="method-button ${appState.paymentMethod === id ? "selected" : ""}" type="button" data-payment-method="${id}" role="radio" aria-checked="${appState.paymentMethod === id}">
              ${name}<span>${note}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function checkoutError() {
  if (appState.lastError) return appState.lastError;
  return "";
}

function CheckoutForm() {
  return `
    <section class="form-panel" aria-label="支付表单">
      <div class="form-section">
        <h2>邮箱</h2>
        ${FormField({
          id: "email",
          label: "邮箱地址",
          value: appState.email,
          type: "email",
          placeholder: "you@example.com",
          message: "收据和安装链接会发送到这个邮箱。",
          error: appState.lastError && !appState.email.includes("@") ? "请输入有效的邮箱地址。" : "",
        })}
      </div>
      <div class="form-section">
        <h2>支付方式</h2>
        ${PaymentMethod()}
      </div>
      <div class="form-section">
        <h2>优惠码</h2>
        <div class="coupon-row">
          ${FormField({
            id: "coupon",
            label: "优惠码，可选",
            value: appState.couponInput,
            placeholder: "试试 QUIET20",
            message: "演示支付可使用 QUIET20。",
            error: appState.couponStatus === "error" ? "这个优惠码不可用。" : "",
          })}
          ${Button("应用", "secondary", 'data-action="apply-coupon"')}
        </div>
        ${appState.couponStatus === "applied" ? StatusMessage("success", `优惠码已应用，本单减免 ${money(appState.couponDiscount)}。`) : ""}
      </div>
      <label class="checkbox-row">
        <input type="checkbox" data-action="toggle-legal" ${appState.legalAccepted ? "checked" : ""} />
        <span>我同意订阅条款，并了解支付完成后将进入安装流程。</span>
      </label>
      ${checkoutError() ? StatusMessage("error", checkoutError()) : ""}
    </section>
  `;
}

function OrderSummary() {
  const plan = selectedPlan();
  const originalDiscount = plan.originalPrice - plan.price;
  return `
    <aside class="summary-panel" aria-label="订单摘要">
      <h2>订单摘要</h2>
      <div class="summary-row"><span>套餐</span><strong>${plan.name}</strong></div>
      <div class="summary-row"><span>周期</span><strong>${plan.duration}</strong></div>
      <div class="summary-row"><span>原价</span><strong>${money(plan.originalPrice)}</strong></div>
      <div class="summary-row"><span>套餐优惠</span><strong>${originalDiscount ? `-${money(originalDiscount)}` : money(0)}</strong></div>
      <div class="summary-row"><span>优惠码减免</span><strong>-${money(appState.couponDiscount)}</strong></div>
      <div class="summary-total"><span>实付金额</span><strong>${money(finalPrice())}</strong></div>
      <div class="summary-actions">
        ${Button("更换套餐", "secondary", 'data-route="pricing"')}
        ${Button(paymentButtonLabel(), "primary", `data-action="pay" ${appState.paymentStatus === "processing" ? "disabled" : ""}`, appState.paymentStatus === "idle" || appState.paymentStatus === "failed" ? icons.arrowRight : "")}
      </div>
      ${appState.paymentStatus === "processing" ? StatusMessage("info", "正在处理支付，请保持页面打开。") : ""}
    </aside>
  `;
}

function paymentButtonLabel() {
  if (appState.paymentStatus === "processing") return "处理中...";
  if (appState.paymentStatus === "success") return "正在跳转...";
  return `支付 ${money(finalPrice())}`;
}

function MobilePayBar() {
  return `
    <div class="mobile-pay-bar">
      <strong>${selectedPlan().name} · ${money(finalPrice())}</strong>
      ${Button(paymentButtonLabel(), "primary", `data-action="pay" ${appState.paymentStatus === "processing" ? "disabled" : ""}`)}
    </div>
  `;
}

function StatusMessage(type, message) {
  return `
    <div class="status-message ${type}" role="${type === "error" ? "alert" : "status"}">
      ${type === "error" ? icons.x : icons.check}
      <span>${message}</span>
    </div>
  `;
}

function PaymentSuccess() {
  const plan = selectedPlan();
  return `
    <main class="app-view">
      <div class="container">
        <section class="status-panel">
          <div class="status-icon success">${icons.check}</div>
          <p class="eyebrow">支付成功</p>
          <h1>购买已完成。</h1>
          <p>现在设置第一台设备，订阅就可以马上投入使用。</p>
          <div class="order-facts">
            <div class="fact"><span>套餐</span><strong>${plan.name}</strong></div>
            <div class="fact"><span>到期日期</span><strong>${expirationDate(plan.id)}</strong></div>
            <div class="fact"><span>订单编号</span><strong>QV-${new Date().getFullYear()}-1048</strong></div>
          </div>
          <h2>设置第一台设备</h2>
          <div class="platform-grid">
            ${platforms.map((platform) => PlatformCard(platform, true)).join("")}
          </div>
          <div class="section-actions">
            ${Button("选择设备并开始安装", "primary", 'data-route="setup-entry"', icons.arrowRight)}
            ${Button("稍后安装", "secondary", 'data-route="landing"')}
          </div>
        </section>
      </div>
    </main>
  `;
}

function expirationDate(planId) {
  const date = new Date();
  const months = planId === "year" ? 12 : planId === "six" ? 6 : 1;
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

function PaymentFailed() {
  return `
    <main class="app-view">
      <div class="container">
        <section class="status-panel">
          <div class="status-icon error">${icons.x}</div>
          <p class="eyebrow">支付失败</p>
          <h1>这次支付没有完成。</h1>
          <p>订单仍然保留。你可以重试，或切换支付方式，不需要重新选择套餐。</p>
          <div class="checkout-grid">
            <div>
              ${StatusMessage("error", "支付渠道未通过本次请求，本次不会扣款。")}
              <div class="section-actions">
                ${Button("重新支付", "primary", 'data-action="retry-payment"', icons.arrowRight)}
                ${Button("更换支付方式", "secondary", 'data-route="checkout"')}
              </div>
            </div>
            ${OrderSummary()}
          </div>
        </section>
      </div>
    </main>
  `;
}

function PlatformCard(platform, compact = false) {
  const selected = appState.selectedPlatformId === platform.id;
  return `
    <button class="platform-card ${selected ? "selected" : ""}" type="button" data-platform="${platform.id}" ${compact ? 'data-route="setup"' : ""}>
      <span class="platform-symbol">${platform.symbol}</span>
      <span>
        <h3>${platform.name}</h3>
        <p>${platform.note}</p>
      </span>
    </button>
  `;
}

function SetupEntry() {
  return `
    <main class="app-view">
      <div class="container">
        <div class="view-header">
          <p class="eyebrow">设备选择</p>
          <h1>你想在哪台设备上使用 VPN？</h1>
          <p>选择平台后，继续进入按任务拆分的安装流程。</p>
        </div>
        <div class="platform-grid">
          ${platforms.map((platform) => PlatformCard(platform)).join("")}
        </div>
        <div class="section-actions">
          ${Button("开始安装", "primary", 'data-route="setup"', icons.arrowRight)}
          ${Button("返回套餐", "secondary", 'data-route="pricing"')}
        </div>
      </div>
    </main>
  `;
}

function DeviceSetup() {
  const platform = selectedPlatform();
  const step = setupSteps[appState.currentStep];
  return `
    <main class="app-view">
      <div class="container">
        <div class="view-header">
          <p class="eyebrow">设备安装</p>
          <h1>${platform.name} 安装。</h1>
          <p>按顺序完成每个任务。你的订阅已经绑定到这个安装链接。</p>
        </div>
        <div class="setup-layout">
          <nav class="setup-steps" aria-label="安装步骤">
            ${setupSteps
              .map(
                (item, index) => `
                  <button class="step-button ${index === appState.currentStep ? "active" : ""} ${index < appState.currentStep ? "completed" : ""}" type="button" data-step="${index}">
                    <span class="step-number">${index < appState.currentStep ? icons.check : index + 1}</span>
                    <span>${item.label}</span>
                  </button>
                `,
              )
              .join("")}
          </nav>
          <section class="setup-panel">
            <div class="setup-progress">
              <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${((appState.currentStep + 1) / setupSteps.length) * 100}%"></div></div>
              <p>第 ${appState.currentStep + 1} 步，共 ${setupSteps.length} 步：${step.label}</p>
            </div>
            ${SetupStepContent(platform)}
          </section>
        </div>
      </div>
    </main>
  `;
}

function SetupStepContent(platform) {
  const subscriptionUrl = `quietvpn://setup/${platform.id}/sub_qv_8F3K-2026`;
  const stepIndex = appState.currentStep;
  const bodies = [
    {
      title: "下载 VPN 应用",
      body: `先下载 ${platform.name} 应用，然后再添加你的订阅配置。`,
      box: Button(`下载 ${platform.name} 版本`, "primary", "", icons.arrowRight),
    },
    {
      title: "安装应用",
      body: "打开安装包，并按屏幕提示完成安装。继续下一步前，请先启动 QuietVPN。",
      box: `<strong>安装检查</strong><p>打开安装包，确认系统提示，然后启动 QuietVPN。</p>`,
    },
    {
      title: "添加配置",
      body: "使用这个订阅链接，将已购买的套餐添加到应用。",
      box: `
        <div class="copy-row">
          <div class="code-box">${subscriptionUrl}</div>
          ${Button(appState.copied ? "已复制" : "复制", "secondary", 'data-action="copy-subscription"', icons.copy)}
        </div>
        ${Button("在应用中打开", "primary", 'data-action="open-app"', icons.arrowRight)}
      `,
    },
    {
      title: "连接",
      body: "先选择一个较近的地区。连接后，也可以在应用内随时切换。",
      box: `<div class="location-list"><div class="location-item active"><span>新加坡</span><strong>推荐</strong></div><div class="location-item"><span>东京</span><strong>快速</strong></div><div class="location-item"><span>洛杉矶</span><strong>可用</strong></div></div>${Button("连接", "primary", "", icons.arrowRight)}`,
    },
    {
      title: "已连接",
      body: "第一台设备已经准备好。你还可以继续在其他支持设备上使用这个账号。",
      box: `${StatusMessage("success", "这台设备已完成安装。")}${Button("返回账户", "primary", 'data-route="landing"', icons.arrowRight)}`,
    },
  ];
  const current = bodies[stepIndex];
  return `
    <p class="eyebrow">第 ${stepIndex + 1} 步</p>
    <h2>${current.title}</h2>
    <p>${current.body}</p>
    <div class="setup-action-box">${current.box}</div>
    <div class="setup-nav">
      ${Button("上一步", "secondary", `data-action="prev-step" ${stepIndex === 0 ? "disabled" : ""}`)}
      ${Button(stepIndex === setupSteps.length - 1 ? "完成安装" : "下一步", "primary", 'data-action="next-step"', icons.arrowRight)}
    </div>
  `;
}

function renderRoute() {
  if (appState.route === "checkout") return Checkout();
  if (appState.route === "payment-success") return PaymentSuccess();
  if (appState.route === "payment-failed") return PaymentFailed();
  if (appState.route === "setup-entry") return SetupEntry();
  if (appState.route === "setup") return DeviceSetup();
  return Landing();
}

function render() {
  document.body.classList.toggle("menu-open", appState.mobileMenuOpen);
  app.innerHTML = `<div class="page-shell">${Header()}${renderRoute()}${Footer()}</div>`;
}

function validateCheckout() {
  if (!appState.email.includes("@") || !appState.email.includes(".")) {
    setState({ lastError: "支付前请输入有效的邮箱地址。" });
    return false;
  }
  if (!appState.legalAccepted) {
    setState({ lastError: "请先同意订阅条款。" });
    return false;
  }
  return true;
}

function simulatePayment() {
  if (!validateCheckout()) return;
  setState({ paymentStatus: "processing", orderStatus: "pending", lastError: "" });
  window.setTimeout(() => {
    const shouldFail = appState.paymentMethod === "wechat";
    if (shouldFail) {
      setState({ paymentStatus: "failed", orderStatus: "created", route: "payment-failed" });
    } else {
      setState({ paymentStatus: "success", orderStatus: "paid", route: "payment-success" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 900);
}

document.addEventListener("click", (event) => {
  const platformTarget = event.target.closest("[data-platform]");
  if (platformTarget) {
    const nextRoute = platformTarget.dataset.route;
    setState({
      selectedPlatformId: platformTarget.dataset.platform,
      setupStatus: "in_progress",
      currentStep: 0,
      copied: false,
      ...(nextRoute ? { route: nextRoute } : {}),
    });
    if (nextRoute) window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const routeTarget = event.target.closest("[data-route]");
  if (routeTarget) {
    event.preventDefault();
    const route = routeTarget.dataset.route;
    if (route === "pricing") {
      navigate("landing");
      window.setTimeout(() => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" }), 30);
      return;
    }
    navigate(route);
    return;
  }

  const anchorTarget = event.target.closest("[data-anchor]");
  if (anchorTarget) {
    event.preventDefault();
    if (appState.route !== "landing") {
      navigate("landing");
      window.setTimeout(() => document.querySelector(`#${anchorTarget.dataset.anchor}`)?.scrollIntoView({ behavior: "smooth" }), 30);
    } else {
      document.querySelector(`#${anchorTarget.dataset.anchor}`)?.scrollIntoView({ behavior: "smooth" });
    }
    setState({ mobileMenuOpen: false });
    return;
  }

  const planTarget = event.target.closest("[data-select-plan]");
  if (planTarget) {
    setState({ selectedPlanId: planTarget.dataset.selectPlan, paymentStatus: "idle", orderStatus: "created", lastError: "", route: "checkout" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const paymentTarget = event.target.closest("[data-payment-method]");
  if (paymentTarget) {
    setState({ paymentMethod: paymentTarget.dataset.paymentMethod, paymentStatus: "idle", lastError: "" });
    return;
  }

  const faqTarget = event.target.closest("[data-faq]");
  if (faqTarget) {
    const nextFaq = appState.openFaqId === faqTarget.dataset.faq ? "" : faqTarget.dataset.faq;
    setState({ openFaqId: nextFaq });
    return;
  }

  const stepTarget = event.target.closest("[data-step]");
  if (stepTarget) {
    setState({ currentStep: Number(stepTarget.dataset.step) });
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;

  if (action === "toggle-menu") {
    setState({ mobileMenuOpen: !appState.mobileMenuOpen });
  }
  if (action === "toggle-legal") {
    setState({ legalAccepted: !appState.legalAccepted, lastError: "" });
  }
  if (action === "apply-coupon") {
    const code = appState.couponInput.trim().toUpperCase();
    if (code === "QUIET20") {
      setState({ couponStatus: "applied", couponDiscount: 20 });
    } else {
      setState({ couponStatus: "error", couponDiscount: 0 });
    }
  }
  if (action === "pay") {
    simulatePayment();
  }
  if (action === "retry-payment") {
    setState({ paymentStatus: "idle", paymentMethod: "card", route: "checkout" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (action === "copy-subscription") {
    const text = `quietvpn://setup/${appState.selectedPlatformId}/sub_qv_8F3K-2026`;
    navigator.clipboard?.writeText(text);
    setState({ copied: true });
  }
  if (action === "next-step") {
    if (appState.currentStep >= setupSteps.length - 1) {
      setState({ setupStatus: "completed" });
      return;
    }
    setState({ currentStep: appState.currentStep + 1, copied: false });
  }
  if (action === "prev-step") {
    setState({ currentStep: Math.max(0, appState.currentStep - 1), copied: false });
  }
});

document.addEventListener("input", (event) => {
  const field = event.target.closest("[data-field]");
  if (!field) return;
  if (field.dataset.field === "email") {
    setState({ email: field.value, lastError: "" }, { preserveFocus: true });
  }
  if (field.dataset.field === "coupon") {
    setState({ couponInput: field.value, couponStatus: "idle", couponDiscount: 0 }, { preserveFocus: true });
  }
});

render();
