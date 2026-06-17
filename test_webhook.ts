const ghlWebhookUrl = process.env.GHL_WEBHOOK_URL;

if (!ghlWebhookUrl || ghlWebhookUrl.includes('your_hook_id_here')) {
  console.error("Please add your actual GHL_WEBHOOK_URL to your platform secrets/environment variables first.");
  process.exit(1);
}

const payload = {
  event: "payment_success",
  product: "AI Twin Studio - ELITE",
  email: "test@example.com",
  name: "Test User",
  firstName: "Test",
  lastName: "User",
  uid: "test_user_123",
  userId: "test_user_123",
  stripeSessionId: "cs_test_123"
};

console.log("Sending test payload to GHL...");

fetch(ghlWebhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
.then(async (res) => {
  if (res.ok) {
    console.log("Success! Status:", res.status);
    console.log("Your payload should now be visible in GHL as a Mapping Reference.");
  } else {
    console.error("Failed!", res.status, await res.text());
  }
})
.catch(console.error);
