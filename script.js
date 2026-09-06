// script.js - unified, safe, Firebase-aware site script

// --- Safe Firebase init (only if SDK and config are present) ---
(function initFirebase() {
    try {
        if (window.firebase && window.firebaseConfig) {
            if (!firebase.apps || !firebase.apps.length) {
                firebase.initializeApp(window.firebaseConfig);
            }
            window.__FIREBASE = { db: firebase.firestore(), firebase };
        } else {
            window.__FIREBASE = null;
        }
    } catch (err) {
        console.warn("Firebase init error:", err);
        window.__FIREBASE = null;
    }
})();

// Single DOMContentLoaded handler for everything
function __init() {
    // -------------------------
    // Mobile Navigation (unified)
    // -------------------------
    (function mobileNav() {
        const mobileMenuBtn = document.getElementById("mobileMenuBtn");
        const navRightContainer = document.querySelector(".nav-right-container");

        if (!mobileMenuBtn || !navRightContainer) return;

        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navRightContainer.classList.toggle("active");
            const expanded = navRightContainer.classList.contains("active");
            mobileMenuBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
        });

        document.addEventListener("click", (e) => {
            if (
                navRightContainer.classList.contains("active") &&
                !navRightContainer.contains(e.target) &&
                !mobileMenuBtn.contains(e.target)
            ) {
                navRightContainer.classList.remove("active");
                mobileMenuBtn.setAttribute("aria-expanded", "false");
            }
        });
    })();

    // -------------------------
    // Donation Page Logic
    // -------------------------
    (function donationLogic() {
        const amountBtns = document.querySelectorAll(".amount-btn");
        const customAmountInput = document.getElementById("customAmount");
        const btnAmountText = document.getElementById("btnAmountText");
        const paymentOptions = document.querySelectorAll(".payment-option");
        const donationForm = document.getElementById("donationForm");
        const thankYouModal = document.getElementById("thankYouModal");
        const closeModalBtn = document.getElementById("closeModalBtn");

        if (!donationForm) return;

        amountBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                amountBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                const val = btn.getAttribute("data-amount");
                if (customAmountInput) customAmountInput.value = val;
                if (btnAmountText) btnAmountText.textContent = val;
            });
        });

        if (customAmountInput) {
            customAmountInput.addEventListener("input", (e) => {
                amountBtns.forEach((b) => b.classList.remove("active"));
                const val = e.target.value || 0;
                if (btnAmountText) btnAmountText.textContent = val;
            });
        }

        paymentOptions.forEach((option) => {
            option.addEventListener("click", () => {
                paymentOptions.forEach((o) => o.classList.remove("active"));
                option.classList.add("active");
                const radio = option.querySelector("input[type='radio']");
                if (radio) radio.checked = true;
            });
        });

        donationForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (thankYouModal) thankYouModal.classList.add("active");
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener("click", () => {
                thankYouModal.classList.remove("active");
                donationForm.reset();
                if (btnAmountText) btnAmountText.textContent = "5";
                if (amountBtns.length) amountBtns[0].click();
            });
        }
    })();

    // -------------------------
    // Gallery Lightbox Logic
    // -------------------------
    (function galleryLightbox() {
        const galleryImages = Array.from(document.querySelectorAll(".gallery-img"));
        const lightboxModal = document.getElementById("lightboxModal");
        const lightboxImg = document.getElementById("lightboxImg");
        const lightboxClose = document.getElementById("lightboxClose");
        const lightboxPrev = document.getElementById("lightboxPrev");
        const lightboxNext = document.getElementById("lightboxNext");

        if (!(lightboxModal && lightboxImg && galleryImages.length > 0)) return;

        let currentIndex = 0;

        const showImage = (index) => {
            if (index < 0) currentIndex = galleryImages.length - 1;
            else if (index >= galleryImages.length) currentIndex = 0;
            else currentIndex = index;
            const target = galleryImages[currentIndex];
            lightboxImg.src = target.src;
            lightboxImg.alt = target.alt || "Enlarged photo";
        };

        galleryImages.forEach((img, idx) => {
            img.addEventListener("click", (e) => {
                e.stopPropagation();
                showImage(idx);
                lightboxModal.classList.add("active");
                document.body.style.overflow = "hidden";
            });
        });

        const closeLightbox = () => {
            lightboxModal.classList.remove("active");
            document.body.style.overflow = "";
        };

        if (lightboxClose)
            lightboxClose.addEventListener("click", (e) => {
                e.stopPropagation();
                closeLightbox();
            });
        if (lightboxPrev)
            lightboxPrev.addEventListener("click", (e) => {
                e.stopPropagation();
                showImage(currentIndex - 1);
            });
        if (lightboxNext)
            lightboxNext.addEventListener("click", (e) => {
                e.stopPropagation();
                showImage(currentIndex + 1);
            });

        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
        document.addEventListener("keydown", (e) => {
            if (!lightboxModal.classList.contains("active")) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") showImage(currentIndex - 1);
            if (e.key === "ArrowRight") showImage(currentIndex + 1);
        });
    })();

    // -------------------------
    // Order Page (drinks) Logic
    // -------------------------
    (function orderPage() {
        const menuList = document.getElementById("menuList");
        const orderForm = document.getElementById("orderForm");
        if (!menuList || !orderForm) return;

        const cartItemsContainer = document.getElementById("cartItems");
        const subtotalEl = document.getElementById("subtotal");
        const deliveryEl = document.getElementById("delivery");
        const totalEl = document.getElementById("total");
        const orderSuccessModal = document.getElementById("orderSuccessModal");
        const closeSuccess = document.getElementById("closeSuccess");
        const clearCartBtn = document.getElementById("clearCartBtn");

        let cart = [];

        const formatUSD = (n) => "USD " + Number(n || 0).toFixed(2);

        function calculateTotals() {
            const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
            const delivery = subtotal >= 10 ? 0 : subtotal === 0 ? 0 : 0.5;
            const total = subtotal + delivery;
            if (subtotalEl) subtotalEl.textContent = formatUSD(subtotal);
            if (deliveryEl) deliveryEl.textContent = formatUSD(delivery);
            if (totalEl) totalEl.textContent = formatUSD(total);
            return { subtotal, delivery, total };
        }

        function renderCart() {
            if (!cartItemsContainer) return;
            cartItemsContainer.innerHTML = "";
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p class="muted">No items yet. Use the menu to add items.</p>';
            } else {
                cart.forEach((it, idx) => {
                    const div = document.createElement("div");
                    div.className = "cart-item";
                    div.innerHTML = `
            <div>
              <div><strong>${it.name}</strong></div>
              <div class="muted">USD ${it.price.toFixed(2)} × ${it.qty}</div>
            </div>
            <div style="text-align:right;">
              <div><strong>USD ${(it.price * it.qty).toFixed(2)}</strong></div>
              <div style="margin-top:6px;">
                <button class="btn btn-secondary-outline decrease" data-idx="${idx}">-</button>
                <button class="btn btn-secondary-outline increase" data-idx="${idx}">+</button>
                <button class="remove-btn" data-idx="${idx}" title="Remove">✕</button>
              </div>
            </div>
          `;
                    cartItemsContainer.appendChild(div);
                });
            }
            calculateTotals();
        }

        function addToCart(id, name, price, qty) {
            qty = Math.max(1, parseInt(qty || 1, 10));
            const existing = cart.find((c) => c.id === id);
            if (existing) existing.qty += qty;
            else cart.push({ id, name, price, qty });
            renderCart();
        }

        // attach add buttons
        menuList.querySelectorAll(".menu-card").forEach((card) => {
            const addBtn = card.querySelector(".add-item-btn");
            if (!addBtn) return;
            addBtn.addEventListener("click", () => {
                const id = card.dataset.id;
                const name = card.dataset.name;
                const price = parseFloat(card.dataset.price);
                const qtyInput = card.querySelector(".item-qty");
                const qty = qtyInput ? parseInt(qtyInput.value || 1, 10) : 1;
                addToCart(id, name, price, qty);
            });
        });

        // cart controls
        if (cartItemsContainer) {
            cartItemsContainer.addEventListener("click", (e) => {
                const btn = e.target.closest("button");
                if (!btn) return;
                const idx = Number(btn.getAttribute("data-idx"));
                if (btn.classList.contains("decrease")) {
                    cart[idx].qty = Math.max(1, cart[idx].qty - 1);
                    renderCart();
                } else if (btn.classList.contains("increase")) {
                    cart[idx].qty = cart[idx].qty + 1;
                    renderCart();
                } else if (btn.classList.contains("remove-btn")) {
                    cart.splice(idx, 1);
                    renderCart();
                }
            });
        }

        if (clearCartBtn)
            clearCartBtn.addEventListener("click", () => {
                cart = [];
                renderCart();
            });

        // save order to Firestore (with fallback)
        async function saveOrderToFirestore(order) {
            const fb = window.__FIREBASE;
            if (fb && fb.db && window.firebase) {
                try {
                    // use serverTimestamp for createdAt
                    const orderData = Object.assign({}, order, {
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    const docRef = await fb.db.collection("orders").add(orderData);
                    return { savedTo: "firestore", id: docRef.id };
                } catch (err) {
                    console.warn("Firestore save failed, falling back to localStorage", err);
                }
            }
            // fallback to localStorage
            try {
                const existing = JSON.parse(localStorage.getItem("orders") || "[]");
                existing.push(order);
                localStorage.setItem("orders", JSON.stringify(existing));
                return { savedTo: "local" };
            } catch (err) {
                console.error("Saving order failed:", err);
                return { savedTo: "none" };
            }
        }

        // submit order
        orderForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                alert("Please add at least one item to your cart.");
                return;
            }

            const name = document.getElementById("fullName").value.trim();
            const building = document.getElementById("building").value;
            const room = document.getElementById("room").value.trim();
            const phone = document.getElementById("phone").value.trim();
            if (!name || !building || !room) {
                alert("Please provide your name, building, and room.");
                return;
            }

            const totals = calculateTotals();
            const order = {
                name,
                building,
                room,
                phone,
                items: cart.slice(),
                subtotal: totals.subtotal,
                delivery: totals.delivery,
                total: totals.total,
                status: "pending",
                createdAt: new Date().toISOString()
            };

            await saveOrderToFirestore(order);

            // clear and show success
            cart = [];
            renderCart();
            orderForm.reset();
            if (subtotalEl) subtotalEl.textContent = formatUSD(0);
            if (deliveryEl) deliveryEl.textContent = formatUSD(0);
            if (totalEl) totalEl.textContent = formatUSD(0);
            const successMessage = document.getElementById("successMessage");
            if (successMessage) {
                successMessage.textContent = `Thanks ${order.name}! Your order total is ${formatUSD(order.total)}. It will be delivered to building ${order.building}, room ${order.room}.`;
            }
            if (orderSuccessModal) {
                orderSuccessModal.classList.add("active");
                orderSuccessModal.style.display = "flex";
            }
        });

        if (closeSuccess)
            closeSuccess.addEventListener("click", () => {
                const orderSuccessModal = document.getElementById("orderSuccessModal");
                if (orderSuccessModal) {
                    orderSuccessModal.classList.remove("active");
                    orderSuccessModal.style.display = "none";
                }
            });

        renderCart();
    })();

    // -------------------------
    // Staff PIN + Realtime Listener
    // -------------------------
    (function staffPage() {
        const staffLoginBox = document.getElementById("staffLogin");
        const ordersPanel = document.getElementById("ordersPanel");
        const staffPinInput = document.getElementById("staffPin");
        const staffLoginBtn = document.getElementById("staffLoginBtn");
        const ordersList = document.getElementById("ordersList");
        const refreshBtn = document.getElementById("refreshOrders");
        const logoutBtn = document.getElementById("logoutBtn");

        if (!staffLoginBox || !ordersPanel || !staffPinInput || !staffLoginBtn || !ordersList) return;

        const expectedPin = window.STAFF_PIN || "";
        const fb = window.__FIREBASE;
        let unsubscribe = null;

        function formatDateFromFirestore(ts) {
            if (!ts) return "";
            if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
            try {
                return new Date(ts).toLocaleString();
            } catch {
                return "";
            }
        }

        function renderOrdersFromDocs(docs) {
            ordersList.innerHTML = "";
            if (!docs || docs.length === 0) {
                ordersList.innerHTML = "<p class='muted'>No orders yet.</p>";
                return;
            }

            const table = document.createElement("table");
            table.className = "order-table";
            table.innerHTML = `<thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>`;
            const tbody = document.createElement("tbody");

            docs.forEach((doc) => {
                // when docs are DocumentSnapshots (from Firestore) use doc.data()
                let data, id;
                if (typeof doc.data === "function") {
                    data = doc.data();
                    id = doc.id;
                } else {
                    data = doc;
                    id = doc.id || doc.id;
                }
                const itemsHtml = (data.items || []).map((i) => `${i.name} × ${i.qty}`).join("<br/>");
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td>#${id}</td>
          <td>${data.name || ""}<br/><small>${data.building || ""} / ${data.room || ""}${data.phone ? "<br/>" + data.phone : ""}</small></td>
          <td>${itemsHtml}</td>
          <td>USD ${Number(data.total || 0).toFixed(2)}</td>
          <td>${formatDateFromFirestore(data.createdAt)}</td>
          <td><span class="order-status ${data.status || "pending"}">${data.status || "pending"}</span></td>
          <td>
            <button class="btn btn-secondary-outline fulfill-btn" data-id="${id}">Mark fulfilled</button>
            <button class="btn btn-secondary-outline delete-btn" data-id="${id}">Delete</button>
          </td>
        `;
                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            ordersList.appendChild(table);
        }

        async function attachRealtimeListener() {
            if (!fb || !fb.db) {
                // fallback: read localStorage once
                const local = JSON.parse(localStorage.getItem("orders") || "[]");
                if (local.length) renderOrdersFromDocs(local.slice().reverse());
                else ordersList.innerHTML = "<p class='muted'>No orders yet.</p>";
                return;
            }
            if (unsubscribe) unsubscribe();
            unsubscribe = fb.db
                .collection("orders")
                .orderBy("createdAt", "desc")
                .onSnapshot(
                    (snapshot) => {
                        renderOrdersFromDocs(snapshot.docs);
                    },
                    (err) => {
                        console.error("Realtime listener error:", err);
                        ordersList.innerHTML = "<p class='muted'>Realtime listener failed.</p>";
                    }
                );
        }

        // unlock using PIN
        staffLoginBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const pin = (staffPinInput.value || "").trim();
            if (!expectedPin) return alert("Staff PIN not configured.");
            if (pin === expectedPin) {
                staffLoginBox.style.display = "none";
                ordersPanel.style.display = "";
                sessionStorage.setItem("staffUnlocked", "1");
                attachRealtimeListener();
            } else {
                alert("Incorrect PIN.");
            }
        });

        // restore session
        if (sessionStorage.getItem("staffUnlocked") === "1") {
            staffLoginBox.style.display = "none";
            ordersPanel.style.display = "";
            attachRealtimeListener();
        }

        // delegated actions (fulfill/delete)
        ordersList.addEventListener("click", async (evt) => {
            const btn = evt.target.closest("button");
            if (!btn) return;
            const id = btn.getAttribute("data-id");
            if (!id) return;
            if (!fb || !fb.db) {
                // localStorage fallback
                let orders = JSON.parse(localStorage.getItem("orders") || "[]");
                const idx = orders.findIndex((o) => String(o.id) === String(id));
                if (idx === -1) return;
                if (btn.classList.contains("fulfill-btn")) {
                    orders[idx].status = "fulfilled";
                    localStorage.setItem("orders", JSON.stringify(orders));
                    renderOrdersFromDocs(orders.slice().reverse());
                } else if (btn.classList.contains("delete-btn")) {
                    if (!confirm("Delete this order?")) return;
                    orders.splice(idx, 1);
                    localStorage.setItem("orders", JSON.stringify(orders));
                    renderOrdersFromDocs(orders.slice().reverse());
                }
                return;
            }

            // Firestore actions
            try {
                if (btn.classList.contains("fulfill-btn")) {
                    await fb.db.collection("orders").doc(id).update({ status: "fulfilled" });
                } else if (btn.classList.contains("delete-btn")) {
                    if (!confirm("Delete this order?")) return;
                    await fb.db.collection("orders").doc(id).delete();
                }
            } catch (err) {
                console.error("Order action failed:", err);
                alert("Action failed. Check console.");
            }
        });

        if (refreshBtn)
            refreshBtn.addEventListener("click", async () => {
                if (!fb || !fb.db) {
                    const local = JSON.parse(localStorage.getItem("orders") || "[]");
                    renderOrdersFromDocs(local.slice().reverse());
                    return;
                }
                try {
                    const snap = await fb.db.collection("orders").orderBy("createdAt", "desc").get();
                    renderOrdersFromDocs(snap.docs);
                } catch (err) {
                    console.error(err);
                    alert("Failed to fetch orders.");
                }
            });

        if (logoutBtn)
            logoutBtn.addEventListener("click", () => {
                if (unsubscribe) unsubscribe();
                sessionStorage.removeItem("staffUnlocked");
                staffLoginBox.style.display = "";
                ordersPanel.style.display = "none";
            });
    })();
} // end __init
// --- Auto-mark nav link active based on current page or hash ---
(function setActiveNavLink() {
    try {
        const links = Array.from(
            document.querySelectorAll(".nav-right-container a.nav-item, .nav-right-container a.btn")
        );
        const currentPath = (location.pathname || "/").replace(/\/$/, "");

        links.forEach((a) => {
            const href = a.getAttribute("href");
            if (!href) return;

            if (href.startsWith("#")) {
                if (
                    (currentPath === "" || currentPath.endsWith("index.html") || currentPath === "/") &&
                    location.hash === href
                ) {
                    a.classList.add("active");
                } else {
                    a.classList.remove("active");
                }
                return;
            }

            const url = new URL(href, location.origin);
            const hrefPath = (url.pathname || "/").replace(/\/$/, "");
            const isIndexHere =
                (hrefPath === "/index.html" || hrefPath === "") &&
                (currentPath === "" || currentPath === "/index.html" || currentPath === "/");

            if (isIndexHere || hrefPath === currentPath) {
                a.classList.add("active");
            } else {
                a.classList.remove("active");
            }
        });
    } catch (e) {
        console.warn("setActiveNavLink error", e);
    }
})();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", __init);
} else {
    __init();
}