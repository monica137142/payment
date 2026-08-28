# QuietVPN P0 Web 产品

一个静态可运行、可交付的 To C VPN 购买与安装流程。

视觉方向采用 ChatGPT-inspired visual language：中性白灰界面、克制绿色强调、清晰 sans typography 与轻量边框层级。

## 运行

直接在浏览器中打开 `index.html`。

## 链接

- 在线预览：[https://monica137142.github.io/payment/](https://monica137142.github.io/payment/)
- 本地页面入口：[index.html](./index.html)

## 流程

首页 -> 套餐 -> 支付 -> 支付成功 -> 设备选择 -> 设备安装

演示优惠码为 `QUIET20`。银行卡和支付宝会支付成功；微信支付会进入失败状态，用于测试重新支付与更换支付方式。

## 文件

- `index.html`：应用外壳
- `styles.css`：设计 Token、布局、响应式与组件样式
- `app.js`：组件渲染、产品状态、支付、设备选择、安装步骤、FAQ 与移动导航交互

## 核心状态

- `selectedPlanId`
- `orderStatus`
- `paymentStatus`
- `paymentMethod`
- `couponStatus`
- `selectedPlatformId`
- `setupStatus`
- `currentStep`
