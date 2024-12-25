// This is your test publishable API key.
const stripe = Stripe("pk_test_51NnseUFlHVwskreyJXLX8Kdfanq7TUuV9ta9s5dRRsQG0rwcRLbecB6Y4FJ68WegbBK8L58ncCXRGNdmHdbO7LKN00oF6uAIZA");

// The items the customer wants to buy
const items = [{ id: "xl-tshirt", amount: 1000 }];

let elements;

initialize();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {
  const response = await fetch("/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const { clientSecret } = await response.json();

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElementOptions = {
    layout: "accordion",
  };

  const paymentElement = elements.create('payment', paymentElementOptions);
  paymentElement.mount('#payment-element');

  // Check if the address element container exists before mounting
  const addressElementContainer = document.querySelector('#address-element');
  if (addressElementContainer) {
    // Create and mount the full address element
    const addressElementOptions = {
      mode: 'shipping', // or 'billing' depending on your needs
      fields: {
        postalCode: 'auto', // Automatically include postal code
        country: 'auto', // Automatically include country
        line1: 'auto', // Automatically include address line 1
        line2: 'auto', // Automatically include address line 2
        city: 'auto', // Automatically include city
        state: 'auto', // Automatically include state
      },
    };
    const addressElement = elements.create('address', addressElementOptions);
    addressElement.mount(addressElementContainer);
  } else {
    console.error("Address element container not found.");
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: "https://4242-martymcnutt-addresselem-ysp1gsqwvn9.ws-us117.gitpod.io//complete.html",
    },
  });

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}