# 📘 The AI Creator's Field Guide: Web Architecture & File Basics

> **Who is this for?** Non-coders, AI directors, and creators who manage AI coding assistants (like Gemini / Antigravity) to build websites without writing code manually.

---

## 📑 Table of Contents
1. [The House Analogy: HTML, CSS & JavaScript](#1-the-house-analogy)
2. [Data vs. Code: Why Customization is Fast](#2-data-vs-code)
3. [The Modular Folder Structure Explained](#3-the-modular-folder-structure-explained)
4. [How AI Coding Assistants Process Files](#4-how-ai-coding-assistants-process-files)
5. [The AI Director's Prompting Cheatsheet](#5-the-ai-directors-prompting-cheatsheet)

---

## 1. The House Analogy: HTML, CSS & JavaScript

Every website on the internet—from Amazon to your e-commerce starter kit—is made of **3 core building blocks**:

| Block | File Type | House Analogy | What It Does on Your Store |
| :--- | :--- | :--- | :--- |
| **HTML** | `.html` | **The Bricks & Walls** | Defines the layout structure (Header, Buttons, Product Images, Cart Drawer). |
| **CSS** | `.css` | **Paint & Interior Design** | Defines colors, fonts, margins, card borders, and mobile responsive grid. |
| **JavaScript** | `.js` | **Electricity & Plumbing** | Makes things interactive (Opening the Cart, Adding Items, Filter Chips, WhatsApp Order). |

---

## 2. Data vs. Code: Why Customization is Fast

The biggest secret to building websites fast is separating **DATA** from **CODE**.

* 📊 **DATA (Changes for Every Client):**
  * Store Name, Phone Number, WhatsApp Number, Address, GST Number.
  * Product Titles, Prices, Discounts, Categories, and Image Links.
  * *Stored in:* `js/config.js` and `data/products.json`.

* ⚙️ **CODE (Stays the Same for All Stores):**
  * How the Product Card calculates discount percentage.
  * How the Cart Drawer slides in from the right.
  * How the Mobile Bottom Bar switches active icons.
  * *Stored in:* `js/components/*.js`.

> **Key Rule:** When onboarding a new client, you only edit **DATA** (`config.js` & `products.json`). You never touch the underlying CODE.

---

## 3. The Modular Folder Structure Explained

Why do we split code into different folders instead of putting everything in one file?

```
ecommerce-starter-kit/
│
├── 📄 index.html                <-- Skeleton (Loads styles & components)
│
├── 📂 css/                      <-- All Visual Styling Files
│   ├── design-tokens.css        <-- Brand Colors, Fonts & Spacing Variables
│   ├── responsive-grid.css      <-- Mobile (1-col) to Desktop (4-col) Layout
│   └── components.css           <-- Styles for Header, Cards, Cart & Modals
│
├── 📂 js/                       <-- All Interactive Logic Files
│   ├── config.js                <-- Client Store Identity (Name, Phone, Colors)
│   ├── data-loader.js           <-- Reads products.json
│   │
│   ├── 📂 components/            <-- Individual Feature Boxes (30-50 lines each)
│   │   ├── Header.js            <-- Search Bar & Navigation Header
│   │   ├── ProductCard.js       <-- Product Card Component
│   │   ├── ProductModal.js      <-- Detail Popup View
│   │   ├── CartDrawer.js        <-- Cart Panel
│   │   ├── CheckoutModal.js     <-- Checkout Form
│   │   └── ProfileModal.js      <-- User Account & Order History
│   │
│   └── main.js                  <-- App Startup Initializer (<120 lines)
│
└── 📂 data/
    └── products.json            <-- Product Catalog Database
```

---

## 4. How AI Coding Assistants Process Files

Understanding how the AI works helps you save tokens, money, and time:

1. **Large Files (e.g. 15,000-line `app.js`):**
   * AI must read all 15,000 lines to make 1 small edit.
   * Uses 10,000+ tokens per edit.
   * Slow generation time.
   * High risk of breaking unrelated features.

2. **Modular Small Files (e.g. 30-line `CartDrawer.js`):**
   * AI opens *only* `CartDrawer.js`.
   * Uses < 50 tokens per edit.
   * Instant edit in 2 seconds.
   * Zero risk of breaking Header or Product Cards.

---

## 5. The AI Director's Prompting Cheatsheet

As an AI Director, use these exact prompt patterns:

### 🎯 Prompt 1: Onboarding a New Client
> *"AI, open `js/config.js` in my new project folder. Set storeName to 'Sharma Electronics', whatsappNumber to '919876543210', and primaryColor to '#0284c7'."*

### 🎯 Prompt 2: Updating Product Data
> *"AI, open `data/products.json` and `js/products-data.js`. Replace the demo items with the new catalog items from my client."*

### 🎯 Prompt 3: Targeted Feature Change
> *"AI, open `js/components/ProductCard.js`. Add a 'Free Delivery' badge next to the discount tag on every card."*
