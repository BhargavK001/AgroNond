# EC2 Deployment Setup Guide

This guide explains how to set up the automated "Push to Deploy" for your server.

## ⚠️ CRITICAL SECURITY WARNING
**You posted your Private Key in the chat. This is highly risky.**
- Ideally, you should generate a new key pair on AWS and update your instance.
- For now, ensure you **never** share that key with anyone else.
- **DO NOT commit the `.pem` file to your GitHub repository.**

## 1. Add Secrets to GitHub (Action Required)
Go to your GitHub Repository:
1. Click **Settings** (top right tab)
2. Click **Secrets and variables** (left sidebar) -> **Actions**
3. Click **New repository secret** (green button)

Add these 3 secrets exactly as shown:

### Secret 1: `EC2_HOST`
*   **Name**: `EC2_HOST`
*   **Value**: `50.17.25.237`

### Secret 2: `EC2_USERNAME`
*   **Name**: `EC2_USERNAME`
*   **Value**: `ubuntu`

### Secret 3: `EC2_SSH_KEY`
*   **Name**: `EC2_SSH_KEY`
*   **Value**: (Copy and paste the **entire** content of your `agronond.pem` key, starting from `-----BEGIN RSA PRIVATE KEY-----` to `-----END RSA PRIVATE KEY-----`)

## 2. Server Configuration
*   **Folder Location**: Your code is in `~/AgroNond` (`/home/ubuntu/AgroNond`). The workflow is already configured to use this path.
*   **Process Name**: You are running `agronond-backend`, which is managed by `pm2`. The workflow will run `pm2 restart all`, which will restart this process.

## 3. How it Works (Automated)
Once you add the secrets above:
1.  **Push Code**: When you (or anyone) pushes code to the `main` branch...
2.  **GitHub Action Triggers**: The "Deploy Server to EC2" workflow starts.
3.  **Connects**: It logs into `50.17.25.237` as `ubuntu` using the hidden `EC2_SSH_KEY`.
4.  **Updates**: It runs:
    ```bash
    cd ~/AgroNond
    git pull origin main
    cd apps/server
    npm install
    pm2 restart all
    ```
5.  **Done**: Your server logs will show the update, and the app will be live with new changes.
