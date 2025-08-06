function toggleSignInOptions() {
    const options = document.querySelector(".sign-in-options");
    options.style.display = options.style.display === "none" ? "block" : "none";
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("repairForm");
    const shopForm = document.getElementById("shopForm");
    const summaryDiv = document.getElementById("review-summary");
    const shopDiv = document.getElementById("shop-selection");
    const shopOptions = document.getElementById("shopOptions");
    const gadgetSelect = document.getElementById("gadgetTypeSelect");
    const customGadgetGroup = document.getElementById("customGadgetGroup");
    const customGadgetInput = document.getElementById("customGadgetType");
  
    let formDataToSave = {};
  
    gadgetSelect.addEventListener("change", () => {
      customGadgetGroup.style.display = gadgetSelect.value === "Other" ? "block" : "none";
      customGadgetInput.required = gadgetSelect.value === "Other";
    });
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const gadgetType = fd.get("gadget_type") === "Other" ? fd.get("custom_gadget_type") : fd.get("gadget_type");
  
      formDataToSave = {
        gadgetType,
        model: fd.get("model"),
        problemDescription: fd.get("problem_description"),
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        phone: fd.get("phone"),
        pincode: fd.get("pincode"),
        address: fd.get("address"),
      };
  
      const matchingShops = await getShopsByPincode(formDataToSave.pincode);
  
      if (matchingShops.length === 0) {
        alert("No shops available for your pincode.");
        return;
      }
  
      shopOptions.innerHTML = matchingShops.map((shop, i) => `
        <div class="shop-option">
          <label>
            <input type="radio" name="selected_shop" value="${shop.shop_id}" ${i === 0 ? "checked" : ""} />
            ${shop.shop_name} - ${shop.city}
          </label>
          <span>${shop.shop_type}</span>
        </div>
      `).join("");
  
      form.style.display = "none";
      shopDiv.style.display = "block";
    });
  
    shopForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectedShop = document.querySelector('input[name="selected_shop"]:checked').value;
      localStorage.setItem("repairFormData", JSON.stringify({ ...formDataToSave, selectedShop }));
  
      summaryDiv.innerHTML = `
        <h2>Repair Slot Summary</h2>
        <p><strong>Gadget Type:</strong> ${formDataToSave.gadgetType}</p>
        <p><strong>Model:</strong> ${formDataToSave.model}</p>
        <p><strong>Problem:</strong> ${formDataToSave.problemDescription}</p>
        <p><strong>Name:</strong> ${formDataToSave.name}</p>
        <p><strong>Email:</strong> ${formDataToSave.email}</p>
        <p><strong>Phone:</strong> ${formDataToSave.phone}</p>
        <p><strong>PIN Code:</strong> ${formDataToSave.pincode}</p>
        <p><strong>Address:</strong> ${formDataToSave.address}</p>
        <p><strong>Selected Shop:</strong> ${selectedShop}</p>
      `;
  
      shopDiv.style.display = "none";
      summaryDiv.style.display = "block";
    });
  
    async function getShopsByPincode(pincode) {
      try {
        const res = await fetch("http://127.0.0.1:5000/get-shops", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pincode })
        });
        const data = await res.json();
        return data.shops || [];
      } catch (err) {
        console.error("Failed to fetch shops:", err);
        return [];
      }
    }
  });
  