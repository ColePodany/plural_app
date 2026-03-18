export async function sendPush(
  token: string,
  title: string,
  body: string
) {
  try {
    if (!token) {
      console.log("❌ No token provided");
      return;
    }

    if (!token.startsWith("ExponentPushToken")) {
      console.log("❌ Invalid token format:", token);
      return;
    }

    console.log("🚀 Sending push to:", token);

    const message = {
      to: token,
      sound: "default",
      title,
      body,
    };

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([message]), // 🔥 ARRAY (important)
    });

    const data = await res.json();

    if (data?.data?.[0]?.status === "ok") {
      console.log("✅ Push sent successfully");
    } else {
      console.log("⚠️ Push response issue:", data);
    }
  } catch (err) {
    console.log("❌ PUSH ERROR:", err);
  }
}