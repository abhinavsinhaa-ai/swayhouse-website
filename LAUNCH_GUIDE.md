# SwayHouse Launch Guide

This guide provides step-by-step instructions for launching the SwayHouse website using the files on your local computer.

## Step 1: Locate Your Local Files
All the final website files are physically saved on your computer in this folder:
`D:\swayhouse.in`

---

## Step 2: Configure the Contact Form (Formspree)
Since this is a static site, it uses **Formspree** to collect contact form responses and email them to you.
1. Sign up/log in to [Formspree](https://formspree.io) using your email: **`hello@swayhouse.in`**.
2. Create a new form (or import/claim your form using the ID `xgobnoeg`).
3. The form is already preconfigured to submit to: `https://formspree.io/f/xgobnoeg`.
4. If you want to use a different Formspree form:
   - Open your local `D:\swayhouse.in\index.html` and update line **985**:
     ```html
     <form id="contactForm" class="flex flex-col gap-6" action="https://formspree.io/f/YOUR_NEW_FORM_ID" method="POST">
     ```
   - Also open `D:\swayhouse.in\components\ContactForm.jsx` and update line **22** to your new form URL.

### Forwarding to Your Second Email (Free Method)
To make sure submissions are sent to both `hello@swayhouse.in` and `contact.swayhouse@gmail.com`:
- Log in to your primary email provider dashboard for `hello@swayhouse.in`.
- Set up an **automatic forwarding filter**:
  * **If email is received from**: `noreply@formspree.io`
  * **Then forward a copy to**: `contact.swayhouse@gmail.com`
- This ensures both email addresses get instant notification copies of all submissions.

---

## Step 3: Upload the Files (Free & No Code setup)

### Option A: Netlify Drag-and-Drop (Easiest)
Netlify allows you to launch by dragging your folder into the browser.
1. Create a new folder on your Desktop named `swayhouse-live`.
2. Copy **only** the following files and folders from `D:\swayhouse.in` into this new folder:
   - `index.html` (Main page)
   - `main.js` (JavaScript logic)
   - `styles.css` (Stylesheets)
   - `creators.js` (Creator database file)
   - `assets/` (Folder containing logo, profile pictures, gallery pictures)
   - `creators/` (Folder containing `aditi.html`)
   - `js/` (Folder containing background/chroma key logic)
3. Open your browser and go to: [app.netlify.com/drop](https://app.netlify.com/drop)
4. Drag and drop the entire `swayhouse-live` folder from your desktop into the upload field.
5. In 10–15 seconds, Netlify will publish your site and give you a temporary URL (e.g., `https://creative-cupcake-12345.netlify.app`).
6. Sign up for a free Netlify account on that screen to make sure your site stays online permanently.

### Option B: Vercel GitHub Deployment (Standard Developer Method)
If you want automatic redeployments whenever the codebase changes:
1. Pushes your clean files (`index.html`, `creators/`, `assets/`, etc.) to a private repository on [GitHub](https://github.com).
2. Create an account on [Vercel](https://vercel.com).
3. Connect your GitHub account and click **Import** next to your new repository.
4. Vercel will automatically build, host, and publish your site.

---

## Step 4: Configure Your GoDaddy Domain (`swayhouse.in`)

Now, connect your domain to your live site:

1. **In Netlify/Vercel Dashboard**:
   - Go to your site dashboard $\rightarrow$ **Domain management** $\rightarrow$ **Add custom domain**.
   - Enter `swayhouse.in` and click **Add**.
   - Keep the page open to view the DNS records they ask you to add.

2. **In GoDaddy Dashboard**:
   - Log into [GoDaddy](https://godaddy.com).
   - Go to **My Products** $\rightarrow$ **Domains** $\rightarrow$ click **DNS** (or Manage DNS) next to `swayhouse.in`.
   - In the **DNS Records** table, add or edit the following two records:

     | Type | Name | Value | TTL |
     | :--- | :--- | :--- | :--- |
     | **A** | `@` | *IP provided by Netlify or Vercel* | 1 Hour |
     | **CNAME** | `www` | *Subdomain provided by Netlify or Vercel* | 1 Hour |

   - **Important**: Delete any other pre-existing `A` records pointing to GoDaddy's default parking/holding pages.
   - Save the records.

3. **Verify Settings**:
   - Go back to your hosting dashboard (Netlify/Vercel) and click **Verify DNS**.
   - The provider will automatically issue a free SSL Certificate (giving your site `https://`).
   - Allow 5–15 minutes for GoDaddy to update. Your website will now be live on **`https://swayhouse.in`**!
