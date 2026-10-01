# Hosting on Oracle Cloud Always Free

## 1. Create the server (Oracle website)

1. Sign up at https://signup.cloud.oracle.com. Pick a home region close to your customers, such as Singapore. The region can't be changed later.
2. Go to **Compute → Instances → Create instance**.
   - Image: **Canonical Ubuntu 24.04**.
   - Shape: **Ampere A1 (VM.Standard.A1.Flex)** with 1–2 OCPU and 6–12 GB memory. If you see "out of capacity", use **VM.Standard.E2.1.Micro** instead. Both are marked "Always Free eligible".
   - Networking: keep "Assign a public IPv4 address" on.
   - SSH keys: click **Save private key** and keep the file safe.
3. Open the instance's **Subnet → Security List → Add Ingress Rules** and add two rules with source `0.0.0.0/0`, TCP, destination ports **80** and **443**.
4. Copy the instance's **Public IP address**.

## 2. Install the site (from your computer)

```bash
ssh -i path/to/private.key ubuntu@YOUR_PUBLIC_IP
curl -fsSL -o setup.sh https://raw.githubusercontent.com/DIGITX-LLC/Cloth_Web_APP/main/deploy/setup.sh  # only works if the repo is public
bash setup.sh
```

The repo is private, so the `curl` line won't work. Copy the script over instead:
`scp -i path/to/private.key deploy/setup.sh ubuntu@YOUR_PUBLIC_IP:` and then run `bash setup.sh` on the server.

During setup the script prints a key. Add it on GitHub under **repo Settings → Deploy keys → Add deploy key**, leave "Allow write access" off, then press Enter.

When setup finishes it prints your link, for example `https://140-238-1-2.sslip.io`.

## 3. Create your admin account

```bash
cd ~/app && node deploy/create-admin.cjs
```

Then log in, finish **Admin → Settings**, add products, and open checkout once you've reviewed everything (see DEPLOYMENT.md).

## Later

- **Deploy new code:** push to GitHub, then on the server run `bash ~/app/deploy/update.sh`.
- **Emails** (buyer verification, password reset, order updates): add `RESEND_API_KEY` and `EMAIL_FROM` to `~/app/.env`, then run `sudo systemctl restart store`.
- **Your own domain:** point its DNS A record at the IP, run `DOMAIN=shop.example.com bash setup.sh` again, and update `SITE_URL` in `.env`.
- **Logs:** `journalctl -u store -f`.
- **Backups:** these run daily into `~/app/.backups/`. Copy them off the server regularly.
