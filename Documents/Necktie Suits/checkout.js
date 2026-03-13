const checkoutButtons = document.querySelectorAll("[data-checkout-button]");

checkoutButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const { product } = button.dataset;
    const selector = document.querySelector("[data-option-select]");
    const option = selector?.value;
    const originalLabel = button.textContent;
    const errorTarget = document.querySelector("[data-checkout-error]");

    button.disabled = true;
    button.textContent = "Preparing Checkout...";

    if (errorTarget) {
      errorTarget.textContent = "";
    }

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productSlug: product, option })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout could not be started.");
      }

      window.location.href = data.url;
    } catch (error) {
      if (errorTarget) {
        errorTarget.textContent = error.message;
      }

      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
});
