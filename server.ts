import express from "express";
import path from "path";
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook MUST use raw body parser
  app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        return res.status(400).send("Webhook secret not configured.");
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

        if (userId) {
          try {
            if (getApps().length > 0) {
              const db = getFirestore();
              await db.collection("users").doc(userId).update({
                status: "paid",
                updatedAt: FieldValue.serverTimestamp(),
              });
              console.log(`Successfully updated user ${userId} to paid via webhook`);
            } else {
              console.warn("Firebase Admin not initialized, cannot update user from webhook.");
            }
          } catch (error) {
            console.error("Error updating user in Firestore:", error);
            // It's a good idea to return 500 here so Stripe will retry if the DB update fails.
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
    res.json({ status: "ok" });
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured on the server." });
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

      const { userId } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AI Twin Studio",
                description: "Unlock all AI Twin Studio tools",
              },
              unit_amount: 29700, // $297.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/?canceled=true`,
        client_reference_id: userId,
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

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        res.json({ success: true, userId: session.client_reference_id });
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
