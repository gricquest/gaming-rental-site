const functions = require("firebase-functions/v1"); // Import v1 to access database functions
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

// Retrieve SendGrid API Key from environment variables
const SENDGRID_API_KEY = functions.config().sendgrid.key;

sgMail.setApiKey(SENDGRID_API_KEY);

exports.sendOrderConfirmationEmail = functions.database.ref("/rentals/{rentalId}")
  .onCreate((snapshot, context) => {
    const rental = snapshot.val();

    // Extract rental information
    const userEmail = rental.userEmail;
    const userName = rental.userName || "Customer";
    const gameId = rental.gameId;
    const rentDate = rental.rentDate;
    const returnDate = rental.returnDate;

    // Fetch game details
    return admin
      .database()
      .ref(`/games/${gameId}`)
      .once("value")
      .then((gameSnapshot) => {
        const game = gameSnapshot.val();
        const gameName = game.name;

        // Compose email content
        const msg = {
          to: userEmail,
          from: "no-reply@gricquest.com", // Replace with your verified sender
          subject: "Your Game Rental Confirmation",
          html: `
            <p>Dear ${userName},</p>
            <p>Thank you for renting this game from GricQuest!</p>
            <p><strong>Rental Details:</strong></p>
            <ul>
              <li><strong>Game:</strong> ${gameName}</li>
              <li><strong>Rent Date:</strong> ${rentDate}</li>
              <li><strong>Return Date:</strong> ${returnDate}</li>
            </ul>
            <p>We hope you enjoy your gaming experience!</p>
            <p>Best regards,<br>Gric Quest</p>
          `,
        };

        // Send the email
        return sgMail.send(msg);
      })
      .then(() => {
        console.log("Order confirmation email sent to:", userEmail);
        return null;
      })
      .catch((error) => {
        console.error("Error sending email:", error);
        return null;
      });
  });


  // New function to send email on rental return
exports.sendReturnConfirmationEmail = functions.database.ref("/rentals/{rentalId}")
.onUpdate((change, context) => {
  const beforeData = change.before.val();
  const afterData = change.after.val();

  // Check if status changed from 'active' to 'returned'
  if (beforeData.status !== 'returned' && afterData.status === 'returned') {
    const rental = afterData;

    // Extract rental information
    const userEmail = rental.userEmail;
    const userName = rental.userName || "Customer";
    const gameId = rental.gameId;
    const returnDate = rental.returnDate;

    // Fetch game details
    return admin
      .database()
      .ref(`/games/${gameId}`)
      .once("value")
      .then((gameSnapshot) => {
        const game = gameSnapshot.val();
        const gameName = game.name;

        // Compose email content
        const msg = {
          to: userEmail,
          from: "no-reply@gricquest.com", // Replace with your verified sender
          subject: "Your Game Rental Return Confirmation",
          html: `
            <p>Dear ${userName},</p>
            <p>Thank you for returning your rented game!</p>
            <p><strong>Return Details:</strong></p>
            <ul>
              <li><strong>Game:</strong> ${gameName}</li>
              <li><strong>Return Date:</strong> ${returnDate}</li>
            </ul>
            <p>We hope you enjoyed your gaming experience. We look forward to serving you again!</p>
            <p>Best regards,<br>GricQuest</p>
          `,
        };

        // Send the email
        return sgMail.send(msg);
      })
      .then(() => {
        console.log("Return confirmation email sent to:", userEmail);
        return null;
      })
      .catch((error) => {
        console.error("Error sending return email:", error);
        return null;
      });
  } else {
    // Status did not change to 'returned'; do nothing.
    return null;
  }
});