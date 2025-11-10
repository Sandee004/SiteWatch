# NYSC Watch 🌐🚨

**NYSC Watch** is a lightweight web app designed to monitor websites that are frequently down or unreliable. It’s specifically tailored to help users track the **NYSC registration portal**. The app automatically alerts you or opens the site when it comes back online — no more refreshing every 5 minutes!

---

## 🎯 Why NYSC Watch Exists

Many users face two major problems:

1. **Cronjobs and automated scripts often fail**  
   Scheduled jobs to check site status may shut down unexpectedly or fail silently.

2. **NYSC registration website is unreliable**  
   The official portal is frequently down, making registration stressful and frustrating.

**Solution:**  
NYSC Watch continuously monitors selected websites and notifies you immediately when a site is back online. It can even **automatically open the site** in your browser so you don’t miss your registration window.

---

## 🚀 Features

- Monitor **multiple websites** simultaneously
- Supports **both registered users and guests**
- **Real-time status updates**: online, offline, or unknown
- **Alerts** when monitored sites come online (email notification - coming soon)
- Responsive **frontend dashboard** to add, view, and delete monitored sites
- **User profile management**: save your name and email for notifications
- **Guest history** stored for 24 hours
- Built with **React + Flask + SQLite** — easy to deploy locally or on a server

---

## 💻 Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Flask, Flask-SQLAlchemy
- **Database:** SQLite
- **Notifications:** Email (optional for registered users)

---
