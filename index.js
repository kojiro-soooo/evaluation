const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = () => {
    // define your method to get cart data
    return fetch(URL + "/cart").then((data)=>data.json());
  };

  const getInventory = () => {
    // define your method to get inventory data
    return fetch(URL + "/inventory").then((data)=>data.json());
  };

  const updateInventory = (content, id, newAmount) => {
    return fetch(URL + "/inventory" + "/" + id, {
      method:"PATCH",
      body: JSON.stringify(newAmount),
      header: "Content-type: application/json"}).then((data)=>data.json());
  }

  const addToCart = (inventoryItem) => {
    // define your method to add an item to cart
    return fetch(URL + "/cart", {
      method: "POST",
      body: JSON.stringify(inventoryItem),
      header: {"Content-type": "application/json"}
    }).then((data)=>data.json());
  };

  const updateCart = (id, newAmount) => {
    // define your method to update an item in cart
    return fetch(URL + "/cart" + "/" + id, {
      method: "PATCH",
      body: JSON.stringify(newAmount),
      header: "Content-type: application/json"}).then((data)=>data.json());
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
    fetch (URL + "/cart" + id, {method: "DELETE"}).then((data)=>data.json());
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    updateInventory,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
      this.#onChange();
    }
    set inventory(newInventory) {
      this.#inventory = newInventory;
      this.#onChange();
    }

    subscribe(cb) {
      this.#onChange = cb;
    }

    updateInventory = (id, newAmount) => {
      var toUpdate = this.#inventory.find((item)=>item.id === +id);
      toUpdate.amount = newAmount;
      this.#onChange();
    }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    updateInventory,
  } = API;
  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
    updateInventory,
  };
})();

const View = (() => {
  // implement your logic for View
  const inventoryListEl = document.querySelector(".inventory-container ul");
  const shoppingListEl = document.querySelector(".cart-container ul");
  const itemCountEl = document.querySelectorAll(".item-count")
  const incrementButtonEl = document.getElementsByTagName("")
  const decrementButtonEl = document.querySelectorAll(".decrement-button")
  const addBtnEl = document.querySelector(".add-button")

  const renderInventory = (inventoryList) => {
    let listItem = "";


    inventoryList.forEach((inventoryItem) => {
      let listItemText = `
        <li inventory-id="${inventoryItem.id}">
          <span>${inventoryItem.content}
            <button class="decrement-button">-</button>
            <p>${inventoryItem.amount}</p>
            <button class="increment-button">+</button>
            <button class="add-button">add to cart</button>
          </span>
        </li>`
      listItem += listItemText
    });
    inventoryListEl.innerHTML = listItem;
  }

  const clearInventoryList = () => {
    inventoryListEl.value = "";
  };

  const renderCart =  (cartList) => {
    let listItem = "";
    cartList.forEach((cartItem) => {
      let listItemText = `
        <li inventory-id="${cartItem.id}">
          <span>${cartItem.content}
            <button class="decrement-button">-</button>
            <p>${cartItem.amount}</p>
            <button class="increment-button">+</button>
            <button class="add-button">add to cart</button>
          </span>
        </li>`
      listItem += listItemText
    });
    inventoryListEl.innerHTML = listItem;
  }

  // const renderCart = (cartList) => {
  //   let listItem = "";

  //   cartList.forEach((cartItem) => {
  //     let listItemText = `
  //       <li cart-id="${cartItem.id}">
  //         <span>${cartItem.content}</span>
  //       </li>`
  //     listItem += listItemText
  //   });
  //   inventoryListEl.innerHTML = listItem;
  // }

  return {
    inventoryListEl,
    shoppingListEl,
    renderInventory,
    clearInventoryList,
    itemCountEl,
    incrementButtonEl,
    decrementButtonEl,
    addBtnEl,
    // renderCart,
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = () => {
    model.getInventory().then((data)=>{
      state.inventory = data;
    });
  };

  const handleUpdateAmount = () => {
    view.inventoryListEl.addEventListener("click", (e) => {
      const id = e.target.parentNode.parentNode.getAttribute("inventory-id");
      const inventoryItem = state.inventory.find((item)=>item.id === +id);
      if(e.target.getAttribute("class") === "increment-button"){
        inventoryItem.amount++
        state.updateInventory(id, inventoryItem.amount);
      } else if (e.target.getAttribute("class") === "decrement-button"){
        inventoryItem.amount--
        state.updateInventory(id, inventoryItem.amount);
      }
      // model.updateInventory(id,inventoryItem.amount);
    });
  };

  const handleAddToCart = () => {
    view.inventoryListEl.addEventListener("click", (e)=>{
      e.preventDefault();
      const id = e.target.parentNode.parentNode.getAttribute("inventory-id");
      const inventoryItem = state.inventory.find((item)=>item.id === +id);
      console.log(inventoryItem)
      if(e.target.getAttribute("class") === "add-button"){
        model.addToCart(inventoryItem).then((data)=>{
          console.log(data)
          state.cart = [data, ...state.cart];
        })
      }
      console.log(state.cart)

    })
  };

  const handleDelete = () => {};

  const handleCheckout = () => {};
  const bootstrap = () => {
    handleUpdateAmount();
    handleAddToCart();
    init();
    state.subscribe(() => {
      view.renderInventory(state.inventory);
      // view.renderCart(state.cart);
    }
    )

  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
