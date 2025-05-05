# 🚀 Windows Setup: Docker Desktop + Ubuntu WSL

This guide helps you set up **Docker Desktop** and **Ubuntu on WSL**, and configure Docker to use Ubuntu as the default WSL distribution instead of Docker's own WSL backend.

## 🛠 Prerequisites

* Windows 10 or 11 with **WSL 2** enabled.
* Admin privileges.

---

## ✅ Step 1: Install Docker Desktop

1. Download Docker Desktop from the official site:
   👉 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

2. Run the installer and follow the setup instructions.

3. During installation, make sure to:

   * Enable the **WSL 2 backend** option.

4. After installation, launch Docker Desktop and ensure it’s running.

---

## ✅ Step 2: Install Ubuntu (via WSL)

1. Open **Microsoft Store**.
2. Search for **Ubuntu** (e.g., "Ubuntu 22.04 LTS").
3. Click **Install**.
4. Once installed, launch Ubuntu from the Start menu.
5. Let it finish the installation, then create a new UNIX username and password.

---

## ✅ Step 3: Set Ubuntu as Default WSL Distro

1. Open **PowerShell** or **Command Prompt** and run:

   ```bash
   wsl --list --verbose
   ```

   You’ll see a list like:

   ```
   NAME                   STATE           VERSION
   * docker-desktop-data  Running         2
     docker-desktop       Running         2
     Ubuntu               Stopped         2
   ```

2. Set Ubuntu as the default WSL distribution:

   ```bash
   wsl --set-default Ubuntu
   ```

   ✅ This ensures that when Docker interacts with WSL, it can use your Ubuntu environment by default.

---

## ✅ (Optional) Configure Docker to Use Ubuntu WSL Integration

1. Open **Docker Desktop**.
2. Go to **Settings > Resources > WSL Integration**.
3. Enable integration for **Ubuntu** and disable it for `docker-desktop` or others if you want full control via your Ubuntu WSL.

---

## ✅ Verify Setup

* Run the following in Ubuntu terminal:

  ```bash
  docker --version
  ```

  If Docker is set up correctly and WSL is integrated, you should see the Docker CLI responding.

* You can now use Docker inside Ubuntu WSL like:

  ```bash
  docker run hello-world
  ```

---

## 🎉 You're Done!

You now have:

* Docker Desktop installed
* Ubuntu running under WSL2
* Docker integrated with your Ubuntu environment

---

Let me know if you'd like a diagram or visual setup guide!
