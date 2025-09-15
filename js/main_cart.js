
// Unified cart script: keeps cart in localStorage and sync across pages
(function(){
  // Cart stored as array of {name, price}
  const STORAGE_KEY = "miTienda_cart_v1";
  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const cartBtn = document.getElementById("cart-btn");
  const cartCountEl = document.getElementById("cart-count");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const vaciarBtn = document.getElementById("vaciar-carrito");

  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
  function calcTotal(){ return cart.reduce((s,i)=>s+Number(i.price||0), 0); }
  function render(){
    if(!cartItemsEl) return;
    cartItemsEl.innerHTML = "";
    if(cart.length===0){
      cartItemsEl.textContent = "No hay productos";
    } else {
      cart.forEach(item=>{
        const div = document.createElement("div");
        div.textContent = `${item.name} - S/ ${Number(item.price).toFixed(2)}`;
        cartItemsEl.appendChild(div);
      });
    }
    if(cartCountEl) cartCountEl.textContent = cart.length;
    if(cartTotalEl) cartTotalEl.textContent = `S/ ${calcTotal().toFixed(2)}`;
  }

  // Sync on storage changes (other tabs/pages)
  window.addEventListener("storage", (e)=>{
    if(e.key===STORAGE_KEY) { cart = JSON.parse(e.newValue || "[]"); render(); }
  });

  // Add to cart buttons
  document.addEventListener("click", (e)=>{
    const t = e.target.closest && e.target.closest(".add-to-cart");
    if(t){
      e.preventDefault();
      const name = t.dataset.name || t.getAttribute("data-name") || t.textContent.trim();
      const price = Number(t.dataset.price || t.getAttribute("data-price") || 0);
      cart.push({name, price});
      save();
      render();
      animateCart();
    }
    if(e.target && e.target.id==="vaciar-carrito"){
      cart = []; save(); render();
    }
  });

  function animateCart(){
    if(!cartBtn || !cartCountEl) return;
    cartBtn.classList.add("animate");
    cartCountEl.classList.add("flash");
    setTimeout(()=>{ cartBtn.classList.remove("animate"); cartCountEl.classList.remove("flash"); }, 700);
  }

  // Initialize elements when DOM ready
  document.addEventListener("DOMContentLoaded", ()=>{
    // render initially
    render();
    // back to top handler
    const back = document.querySelector(".back-to-top");
    window.addEventListener("scroll", ()=>{
      if(!back) return;
      if(window.scrollY>300) back.classList.add("show"); else back.classList.remove("show");
    });
    if(back) back.addEventListener("click", ()=> window.scrollTo({top:0, behavior:"smooth"}));
  });
})();
