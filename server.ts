import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin for server-side operations (like webhooks)
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
      });
    } else {
      initializeApp();
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

// Global helper to get custom db based on config or default
function getFirestoreDb() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.firestoreDatabaseId) {
        console.log("Using custom Firestore Database ID:", config.firestoreDatabaseId);
        return getFirestore(config.firestoreDatabaseId);
      }
    }
  } catch (err) {
    console.error("Failed to read firestoreDatabaseId from config; resorting to default", err);
  }
  return getFirestore();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook MUST use raw body parser (supports both endpoints for maximum compatibility)
  app.post(
    ["/api/webhook", "/api/stripe/webhook"],
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("[Stripe Webhook ERROR] Webhook secret not configured. Please set STRIPE_WEBHOOK_SECRET.");
        return res.status(400).send("Webhook secret not configured.");
      }

      if (webhookSecret.startsWith("http://") || webhookSecret.startsWith("https://") || !webhookSecret.startsWith("whsec_")) {
        console.error("=========================================================================");
        console.error("[CRITICAL CONFIG WARNING] STRIPE_WEBHOOK_SECRET seems MISCONFIGURED!");
        console.error(`Current Value starts with: "${webhookSecret.substring(0, 10)}..."`);
        console.error("Stripe Webhook Secrets must begin with 'whsec_'.");
        console.error("It looks like you might have accidentally pasted your Webhook Endpoint URL");
        console.error("instead of the Webhook Signing Secret Key from your Stripe Dashboard.");
        console.error("=========================================================================");
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(400).send("Stripe secret key not configured.");
      }

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed.", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const tier = session.metadata?.tier || "elite";

        if (userId) {
          try {
            if (getApps().length > 0) {
              const db = getFirestoreDb();
              const userRef = db.collection("users").doc(userId);
              const userSnap = await userRef.get();
              
              let lastProcessedSessionId = "";
              if (userSnap.exists) {
                lastProcessedSessionId = userSnap.data()?.lastProcessedSessionId || "";
              }

              // Update Firestore safely
              await userRef.set({
                status: tier,
                updatedAt: FieldValue.serverTimestamp(),
                lastProcessedSessionId: session.id
              }, { merge: true });
              console.log(`Successfully updated user ${userId} to tier ${tier} via webhook`);

              const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
              if (ghlWebhookUrl && lastProcessedSessionId !== session.id) {
                try {
                  let customerEmail = session.customer_details?.email || "";
                  let customerName = session.customer_details?.name || "";
                  
                  if (userSnap.exists) {
                    const data = userSnap.data();
                    if (!customerEmail) customerEmail = data?.email || "";
                    if (!customerName) customerName = data?.name || "";
                  }

                  const nameParts = customerName ? customerName.trim().split(/\s+/) : [];
                  const firstName = nameParts[0] || "";
                  const lastName = nameParts.slice(1).join(" ") || "";
                  const stripeProductName = `AI Twin Studio - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`;

                  const payload = {
                    event: "payment_success",
                    product: `AI Twin Studio - ${tier.toUpperCase()}`,
                    productName: tier === 'starter' ? 'AI Twin Studio - Starter Plan' : tier === 'pro' ? 'AI Twin Studio - Pro Plan' : 'AI Twin Studio - Elite Plan',
                    stripeProductName: stripeProductName,
                    tier: tier,
                    plan: tier,
                    status: tier,
                    tag: tier,
                    tags: [tier],
                    email: customerEmail,
                    name: customerName,
                    firstName: firstName,
                    lastName: lastName,
                    uid: userId,
                    userId: userId,
                    stripeSessionId: session.id
                  };
                  console.log("Triggering GHL webhook with payload:", payload);
                  
                  const ghlRes = await fetch(ghlWebhookUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                  });
                  if (!ghlRes.ok) {
                    console.error("Failed to trigger GHL webhook:", await ghlRes.text());
                  } else {
                    console.log("Successfully triggered GHL inbound webhook");
                  }
                } catch (ghlErr) {
                  console.error("Error connecting to GHL webhook:", ghlErr);
                }
              } else if (lastProcessedSessionId === session.id) {
                console.log("GHL webhook already triggered for this session; skipping duplicate.");
              }
            } else {
              console.warn("Firebase Admin not initialized, cannot update user from webhook.");
            }
          } catch (error) {
            console.error("Error updating user in Firestore:", error);
            return res.status(500).json({ error: "Failed to update user in database" });
          }
        }
      }

      res.json({ received: true });
    }
  );

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    const isFirebase = getApps().length > 0;
    
    // Safely mask sensitive variables
    const maskSecret = (key: string | undefined, prefix: string) => {
      if (!key) return "MISSING";
      if (!key.startsWith(prefix)) {
        // Offer detailed guidance for misconfigured formats
        if (key.startsWith("http")) return "INVALID_FORMAT_PASTED_URL_INSTEAD_OF_SECRET";
        return `INVALID_PREFIX_EXPECTED_${prefix.toUpperCase()}`;
      }
      return `${prefix}...${key.slice(-4)}`;
    };

    const maskUrl = (url: string | undefined) => {
      if (!url) return "MISSING";
      try {
        const u = new URL(url);
        return `${u.protocol}//${u.host}/...`;
      } catch (e) {
        return "INVALID_URL";
      }
    };

    res.json({
      status: "ok",
      diagnostics: {
        firebaseAdminInitialized: isFirebase,
        stripeSecretKey: maskSecret(process.env.STRIPE_SECRET_KEY, "sk_"),
        stripeWebhookSecret: maskSecret(process.env.STRIPE_WEBHOOK_SECRET, "whsec_"),
        ghlWebhookUrl: maskUrl(process.env.GHL_WEBHOOK_URL),
        appUrl: process.env.APP_URL || "NOT_SET",
        nodeEnv: process.env.NODE_ENV || "development"
      }
    });
  });

  app.post("/api/user-registered", async (req, res) => {
    const { email, uid, status } = req.body;
    
    const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
    if (ghlWebhookUrl) {
      try {
        const nameParts = (email || "").split("@")[0].split(/[._\-]/);
        const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : "";
        const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : "";
        const fallbackName = firstName ? `${firstName} ${lastName}`.trim() : "";

        const payload = {
          event: "user_registered",
          product: "AI Twin Studio",
          email: email,
          uid: uid,
          userId: uid,
          status: status,
          firstName: firstName,
          lastName: lastName,
          name: fallbackName
        };
        console.log("Triggering GHL webhook for registration:", payload);
        
        const ghlRes = await fetch(ghlWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!ghlRes.ok) {
          console.error("Failed to trigger GHL webhook for registration:", await ghlRes.text());
        } else {
          console.log("Successfully triggered GHL registration webhook");
        }
      } catch (ghlErr) {
        console.error("Error connecting to GHL webhook:", ghlErr);
      }
    }
    res.json({ success: true });
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured on the server." });
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const originUrl = req.get('origin') || req.get('referer')?.replace(/\/$/, "");
      const appUrl = process.env.APP_URL || originUrl || `http://localhost:${PORT}`;

      const { userId, tier = "elite", fpromTid = "" } = req.body;

      // Fetch user's current status and email from Firestore to calculate pro-rated price and pre-fill Stripe
      let currentStatus = "unpaid";
      let customerEmail = "";
      if (userId && getApps().length > 0) {
        try {
          const db = getFirestoreDb();
          const userSnap = await db.collection("users").doc(userId).get();
          if (userSnap.exists) {
            currentStatus = userSnap.data()?.status || "unpaid";
            customerEmail = userSnap.data()?.email || "";
          }
        } catch (err) {
          console.error("Error reading user status for checkout:", err);
        }
      }

      // Base non-discounted pricing: Starter ($27), Pro ($97), Elite ($197)
      // TEMPORARY: Starter set to £1 (100 GB_PENCE), Pro set to £2 (200 GB_PENCE) for live testing
      let amount = 19700; // default Elite
      let productName = "AI Twin Studio - Elite";
      let productDesc = "Unlock Elite AI Twin Studio tools (all-access)";

      if (tier === "starter") {
        amount = 100; // £1
        productName = "AI Twin Studio - Starter Plan";
        productDesc = "Unlock basic AI Twin Studio tools";
      } else if (tier === "pro") {
        if (currentStatus === "starter") {
          amount = 100; // £2 - £1 = £1 upgrade
          productName = "AI Twin Studio - Upgrade to Pro";
          productDesc = "Pro-rated upgrade from Starter to Pro Plan";
        } else {
          amount = 200; // £2
          productName = "AI Twin Studio - Pro Plan";
          productDesc = "Unlock professional AI Twin Studio tools";
        }
      } else if (tier === "elite") {
        if (currentStatus === "starter") {
          amount = 19600; // £197 - £1
          productName = "AI Twin Studio - Upgrade to Elite";
          productDesc = "Pro-rated upgrade from Starter to Elite Plan";
        } else if (currentStatus === "pro") {
          amount = 19500; // £197 - £2
          productName = "AI Twin Studio - Upgrade to Elite";
          productDesc = "Pro-rated upgrade from Pro to Elite Plan";
        } else {
          amount = 19700;
          productName = "AI Twin Studio - Elite Plan";
          productDesc = "Unlock Elite AI Twin Studio tools (all-access)";
        }
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: customerEmail || undefined,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: productName,
                description: productDesc,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/?canceled=true`,
        client_reference_id: userId,
        metadata: {
          tier,
          userId,
          fp_tid: fpromTid,
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/verify-session", async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured on the server." });
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const { sessionId } = req.body;

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"]
      });

      if (session.payment_status === "paid") {
        const userId = session.client_reference_id;
        const tier = session.metadata?.tier || "elite";

        if (userId && getApps().length > 0) {
          const db = getFirestoreDb();
          const userRef = db.collection("users").doc(userId);
          const userSnap = await userRef.get();
          
          let lastProcessedSessionId = "";
          let userEmail = session.customer_details?.email || "";
          let userName = session.customer_details?.name || "";
          
          if (userSnap.exists) {
            const data = userSnap.data();
            lastProcessedSessionId = data?.lastProcessedSessionId || "";
            if (!userEmail) userEmail = data?.email || "";
            if (!userName) userName = data?.name || "";
          }

          // Update Firestore safely
          await userRef.set({
            status: tier,
            updatedAt: FieldValue.serverTimestamp(),
            lastProcessedSessionId: sessionId
          }, { merge: true });
          console.log(`Successfully verified and updated user ${userId} to tier ${tier} via status verification`);

          // Trigger backup GHL webhook if not already sent for this session ID
          if (lastProcessedSessionId !== sessionId) {
            const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;
            if (ghlWebhookUrl) {
              try {
                const nameParts = (userName || "").trim().split(/\s+/);
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";
                const stripeProductName = session.line_items?.data?.[0]?.description || "";

                const payload = {
                  event: "payment_success",
                  product: `AI Twin Studio - ${tier.toUpperCase()}`,
                  productName: tier === 'starter' ? 'AI Twin Studio - Starter Plan' : tier === 'pro' ? 'AI Twin Studio - Pro Plan' : 'AI Twin Studio - Elite Plan',
                  stripeProductName: stripeProductName || `AI Twin Studio - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
                  tier: tier,
                  plan: tier,
                  status: tier,
                  tag: tier,
                  tags: [tier],
                  email: userEmail,
                  name: userName,
                  firstName: firstName,
                  lastName: lastName,
                  uid: userId,
                  userId: userId,
                  stripeSessionId: sessionId
                };
                console.log("Triggering backup GHL webhook from session verification with payload:", payload);
                
                const ghlRes = await fetch(ghlWebhookUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(payload)
                });
                if (!ghlRes.ok) {
                  console.error("Failed to trigger GHL webhook from verify-session:", await ghlRes.text());
                } else {
                  console.log("Successfully triggered backup GHL inbound webhook from verify-session");
                }
              } catch (ghlErr) {
                console.error("Error connecting to GHL webhook from verify-session:", ghlErr);
              }
            }
          } else {
            console.log("GHL webhook already triggered for this session; skipping redundant backup trigger.");
          }
        }

        res.json({ success: true, userId: session.client_reference_id, tier });
      } else {
        res.json({ success: false });
      }
    } catch (error: any) {
      console.error("Stripe Retrieve error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
