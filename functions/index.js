require("dotenv").config({ path: "./.env.prod" });
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const MAILERSEND_API_TOKEN = process.env.MAILERSEND_API_TOKEN;
const MAILERSEND_API_URL = "https://api.mailersend.com/v1/email";
const VERIFIED_SENDER = "no-reply@gricquest.com"; // Must be verified in MailerSend

// Helper to send email via MailerSend
async function sendEmail(toEmail, subject, htmlContent, toName = "Customer") {
  const payload = {
    from: { email: VERIFIED_SENDER, name: "GricQuest" },
    to: [{ email: toEmail, name: toName }],
    subject,
    html: htmlContent,
  };

  try {
    const response = await axios.post(MAILERSEND_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${MAILERSEND_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log("MailerSend response:", response.data);
  } catch (error) {
    console.error("MailerSend error:", error.response?.data || error.message);
  }
}

// 📦 Rental Confirmation Email
exports.sendOrderConfirmationEmail = functions.database.ref("/rentals/{rentalId}")
  .onCreate(async (snapshot, context) => {
    const rental = snapshot.val();
    const { userEmail, userName = "Customer", gameId, rentDate, returnDate } = rental;

    const gameSnapshot = await admin.database().ref(`/games/${gameId}`).once("value");
    const gameName = gameSnapshot.val().name;

    const html = `
      <p>Dear ${userName},</p>
      <p>Thank you for renting this game from GricQuest!</p>
      <ul>
        <li><strong>Game:</strong> ${gameName}</li>
        <li><strong>Rent Date:</strong> ${rentDate}</li>
        <li><strong>Return Date:</strong> ${returnDate}</li>
      </ul>
      <p>We hope you enjoy your gaming experience!</p>
      <p>Best regards,<br>GricQuest</p>
    `;

    await sendEmail(userEmail, "Your Game Rental Confirmation", html, userName);
    return null;
  });

// 🔄 Rental Return Confirmation Email
exports.sendReturnConfirmationEmail = functions.database.ref("/rentals/{rentalId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.val();
    const afterData = change.after.val();

    if (beforeData.status !== "returned" && afterData.status === "returned") {
      const { userEmail, userName = "Customer", gameId, returnDate } = afterData;

      const gameSnapshot = await admin.database().ref(`/games/${gameId}`).once("value");
      const gameName = gameSnapshot.val().name;

      const html = `
        <p>Dear ${userName},</p>
        <p>Thank you for returning your rented game!</p>
        <ul>
          <li><strong>Game:</strong> ${gameName}</li>
          <li><strong>Return Date:</strong> ${returnDate}</li>
        </ul>
        <p>We hope you enjoyed your gaming experience. We look forward to serving you again!</p>
        <p>Best regards,<br>GricQuest</p>
      `;

      await sendEmail(userEmail, "Your Game Rental Return Confirmation", html, userName);
    }

    return null;
  });

// 🧾 Order Invoice Email
exports.sendOrderInvoiceEmail = functions.database.ref("/orders/{orderId}")
  .onCreate(async (snapshot, context) => {
    const order = snapshot.val();
    const { userEmail, userName, rentDate, returnDate, rentalDays, totalCost, items } = order;

    let itemRows = items.map(item => `
      <tr>
        <td>${item.gameName}</td>
        <td>$${item.pricePerDay.toFixed(2)}</td>
        <td>$${item.totalCost.toFixed(2)}</td>
      </tr>
    `).join("");

    const html = `
      <p>Dear ${userName},</p>
      <p>Thank you for your rental order!</p>
      <ul>
        <li><strong>Rent Date:</strong> ${rentDate}</li>
        <li><strong>Return Date:</strong> ${returnDate}</li>
        <li><strong>Rental Days:</strong> ${rentalDays}</li>
      </ul>
      <p><strong>Items Rented:</strong></p>
      <table>
        <thead>
          <tr>
            <th>Game</th>
            <th>Price per Day</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p><strong>Overall Total Cost:</strong> $${totalCost.toFixed(2)}</p>
      <p>We hope you enjoy your gaming experience!</p>
      <p>Best regards,<br>GricQuest</p>
    `;

    await sendEmail(userEmail, "Your Rental Order Invoice", html, userName);
    return null;
  });

// 📬 Contact Form Submission Email
exports.sendContactEmail = functions.database.ref("/contactMessages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const { name, email, message } = snapshot.val();

    const html = `
      <p>You have received a new message from the "Contact Us" form:</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail("gricquest@gmail.com", "New Contact Us Form Submission", html, "GricQuest Admin");
    return null;
  });
