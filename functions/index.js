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


exports.sendOrderInvoiceEmail = functions.database.ref("/orders/{orderId}")
  .onCreate((snapshot, context) => {
    const order = snapshot.val();
    const { userEmail, userName, rentDate, returnDate, rentalDays, totalCost, items } = order;

    // Compose email content
    let emailContent = `
      <p>Dear ${userName},</p>
      <p>Thank you for your rental order!</p>
      <p><strong>Order Details:</strong></p>
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
        <tbody>
    `;

    items.forEach(item => {
      emailContent += `
        <tr>
          <td>${item.gameName}</td>
          <td>$${item.pricePerDay.toFixed(2)}</td>
          <td>$${item.totalCost.toFixed(2)}</td>
        </tr>
      `;
    });

    emailContent += `
        </tbody>
      </table>
      <p><strong>Overall Total Cost:</strong> $${totalCost.toFixed(2)}</p>
      <p>We hope you enjoy your gaming experience!</p>
      <p>Best regards,<br>Your Company Name</p>
    `;

    const msg = {
      to: userEmail,
      from: "no-reply@gricquest.com", // Use your verified sender
      subject: "Your Rental Order Invoice",
      html: emailContent,
    };

    // Send the email
    return sgMail.send(msg)
      .then(() => {
        console.log("Order invoice email sent to:", userEmail);
        return null;
      })
      .catch(error => {
        console.error("Error sending invoice email:", error);
        return null;
      });
  });
