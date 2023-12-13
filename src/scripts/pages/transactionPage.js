// Importing styles for the transaction page
import "../../styles/transaction.css";

// Importing necessary functions from Firebase for Firestore, Authentication, and App initialization
import {
  getFirestore,
  collection,
  query,
  getDoc,
  doc,
  getDocs,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Importing icons for the application
import appIcon from "../../public/icons/simplebiz-icons.png";
import userIcon from "../../public/icons/user.svg";
import firebaseConfig from "../common/config";

// Initializing Firebase App and obtaining Firestore and Auth instances
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Helper function to fetch transaction data from Firestore
const fetchTransactionData = async (userId, startDate, endDate) => {
  // Formatting dates for consistency
  const formattedStartDate = startDate.split("-").reverse().join("-");
  const formattedEndDate = endDate.split("-").reverse().join("-");

  // Creating a reference to the 'transactions' collection for a specific user
  const transactionsRef = collection(db, `users/${userId}/transactions`);
  // Querying the Firestore database to get transaction documents
  const querySnapshot = await getDocs(transactionsRef);

  // Mapping document data to a more usable format
  const transactions = querySnapshot.docs.map((doc) => {
    const date = doc.id; // the date is the document ID
    const transactionData = doc.data().transactions;

    return {
      date,
      transactionData,
    };
  });

  console.log("Fetched transactions:", transactions);
  return transactions;
};

// Helper function to calculate total price from transactions
const calculateTotalPrice = (transactions) => {
  // Initializing variables for total quantity and total price
  let totalQuantity = 0;
  let totalPrice = 0;

  // Iterating through each transaction and updating totals
  transactions.forEach((transaction) => {
    if (transaction.transactionData) {
      const {
        totalQuantity: transactionTotalQuantity,
        totalPrice: transactionTotalPrice,
      } = calculateTransactionTotal(transaction.transactionData);
      totalQuantity += transactionTotalQuantity;
      totalPrice += transactionTotalPrice;
    }
  });

  return { totalQuantity, totalPrice };
};

// Helper function to calculate total quantity and total price from transaction data
const calculateTransactionTotal = (transactionData) => {
  let transactionTotalQuantity = 0;
  let transactionTotalPrice = 0;

  // Iterating through each product in the transaction and updating totals
  transactionData.forEach((data) => {
    data.products.forEach((product) => {
      transactionTotalQuantity += product.quantity || 0;
      transactionTotalPrice += product.totalPrice || 0;
    });
  });

  return { transactionTotalQuantity, transactionTotalPrice };
};

// Event listener for each row in the main transaction table
let lastClickedRow = null;

const handleRowClick = async (row) => {
  // Remove the 'selected' class from the previously clicked row
  if (lastClickedRow) {
    lastClickedRow.classList.remove("selected");
  }

  // Add the 'selected' class to the clicked row
  row.classList.add("selected");
  lastClickedRow = row;

  // Extract transaction data from the clicked row's attributes
  const transactionData = JSON.parse(row.getAttribute("data-transaction"));

  // Render detailed transaction rows in the detail table
  renderDetailTransactionRows(transactionData.transactionData);
};

// Helper function to render detailed transaction rows in the detail table
const renderDetailTransactionRows = (transactions) => {
  const detailTbody = document.querySelector("#detailTransacTable tbody");
  detailTbody.innerHTML = "";

  // Create a map to store aggregated data for each product on a specific date
  const productMap = new Map();

  transactions.forEach((data) => {
    data.products.forEach((product) => {
      const productName = product.productName;
      const quantity = product.quantity || 0;
      const price = product.price || 0;
      const totalPrice = product.totalPrice || 0;

      // Create a unique key for each product on a specific date
      const key = `${data.date}-${productName}`;

      if (!productMap.has(key)) {
        productMap.set(key, {
          productName,
          totalQuantity: quantity,
          totalPrice,
          price,
        });
      } else {
        // If the product on the same date already exists, update the quantities and prices
        productMap.get(key).totalQuantity += quantity;
        productMap.get(key).totalPrice += totalPrice;
      }
    });
  });

  // Iterate through the aggregated data and render the rows
  productMap.forEach((product) => {
    const detailRow = document.createElement("tr");
    detailRow.innerHTML = `
        <td>${product.productName}</td>
        <td>${product.totalQuantity}</td>
        <td>${product.price.toLocaleString()}</td>
        <td>${product.totalPrice.toLocaleString()}</td>
    `;

    detailTbody.appendChild(detailRow);
  });
};

// Helper function to render transaction rows in the main table
const renderTransactionRows = (transactions) => {
  const tbody = document.querySelector("#transacTable tbody");
  tbody.innerHTML = "";

  transactions.forEach((transaction) => {
    if (transaction.transactionData) {
      const { transactionTotalQuantity, transactionTotalPrice } =
        calculateTransactionTotal(transaction.transactionData);

      const row = document.createElement("tr");
      row.className = "clickable-row"; // Adding a class for easy selection
      row.setAttribute("data-date", transaction.date); // Adding date attribute
      row.setAttribute("data-transaction", JSON.stringify(transaction)); // Adding transaction data attribute

      row.innerHTML = `
              <td>${transaction.date}</td>
              <td>${transactionTotalQuantity}</td>
              <td>${transactionTotalPrice.toLocaleString()}</td>
          `;

      // Add event listener for each row
      row.addEventListener("click", () => handleRowClick(row));

      tbody.appendChild(row);
    }
  });
};

// Helper function to render evaluation report rows in the table
const renderEvaluationReportRows = (highestSales, lowestSales) => {
  const highestSalesTbody = document.getElementById("highest-sales");
  const lowestSalesTbody = document.getElementById("lowest-sales");

  // Render highest sales
  highestSales.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.productName}</td>
      <td>${product.totalQuantity}</td>
      <td>${product.totalPrice.toLocaleString()}</td>
    `;
    highestSalesTbody.appendChild(row);
  });

  // Render lowest sales
  lowestSales.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.productName}</td>
      <td>${product.totalQuantity}</td>
      <td>${product.totalPrice.toLocaleString()}</td>
    `;
    lowestSalesTbody.appendChild(row);
  });
};

// Function to render the entire transaction page
const renderTransactionPage = (container) => {
  // Setting the background color of the body
  document.body.style.backgroundColor = "#F1F1FF";

  // Set up an Auth state listener
  const authStateListener = onAuthStateChanged(auth, (user) => {
    if (user) {
      // If the user is authenticated, fetch and update user data
      initializePage(user.uid);
    } else {
      console.warn("User is not authenticated.");
    }
  });

  // Call initializePage when the page loads
  document.addEventListener("DOMContentLoaded", () => {
    authStateListener(); // Trigger the listener when the page loads
  });

  // Helper function to fetch user data and update the UI
  const initializePage = async (userId) => {
    try {
      // Fetching user profile data to get UMKM name
      const userDoc = await getDoc(doc(db, "users", userId));
      const umkmName = userDoc.data().umkm;

      // Update the user profile name in the UI
      updateUserName(umkmName);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Call initializePage when the page loads
  initializePage();

  // Helper function to update the user name in the UI
  const updateUserName = (umkmName) => {
    console.log("Updating user name:", umkmName);
    const userNameElement = document.querySelector(".user-button span");
    userNameElement.textContent = umkmName;
  };

  // Event handler for the "Terapkan" (Apply) button
  const handleApplyButtonClick = async () => {
    const startDate = document.getElementById("start").value;
    const endDate = document.getElementById("end").value;

    if (startDate && endDate) {
      const userId = auth.currentUser.uid;

      try {
        // Fetching transaction data based on user ID and date range
        const transactions = await fetchTransactionData(
          userId,
          startDate,
          endDate
        );

        // Calculating total quantity and total price from the fetched transactions
        const { totalQuantity, totalPrice } = calculateTotalPrice(transactions);

        // Rendering transaction rows in the table
        renderTransactionRows(transactions);

        // Calculate highest and lowest sales
        const highestSales = calculateHighestSales(transactions);
        const lowestSales = calculateLowestSales(transactions);

        // Rendering evaluation report rows
        renderEvaluationReportRows(highestSales, lowestSales);
      } catch (error) {
        // Handling errors that may occur during the fetch operation
        console.error("Error handling apply button click:", error);
      }
    }
  };

  // Helper function to calculate highest sales
  const calculateHighestSales = (transactions) => {
    // Flatten the array of transactions and products
    const allProducts = transactions.flatMap((transaction) =>
      transaction.transactionData.flatMap((data) => data.products)
    );

    // Create a map to store aggregated data for each product
    const productMap = new Map();

    // Iterate through each product and update the aggregated data
    allProducts.forEach((product) => {
      const productName = product.productName;
      const quantity = product.quantity || 0;
      const totalPrice = product.totalPrice || 0;

      if (!productMap.has(productName)) {
        productMap.set(productName, { totalQuantity: 0, totalPrice: 0 });
      }

      productMap.get(productName).totalQuantity += quantity;
      productMap.get(productName).totalPrice += totalPrice;
    });

    // Convert the map values to an array for rendering
    const highestSales = Array.from(productMap.entries()).map(
      ([productName, data]) => ({
        productName,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
      })
    );

    // Sort the products by totalQuantity in descending order
    const sortedProducts = highestSales.sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    );

    return sortedProducts;
  };

  // Helper function to calculate lowest sales
  const calculateLowestSales = (transactions) => {
    // Use the same approach as calculateHighestSales but sort in ascending order
    const allProducts = transactions.flatMap((transaction) =>
      transaction.transactionData.flatMap((data) => data.products)
    );

    const productMap = new Map();

    allProducts.forEach((product) => {
      const productName = product.productName;
      const quantity = product.quantity || 0;
      const totalPrice = product.totalPrice || 0;

      if (!productMap.has(productName)) {
        productMap.set(productName, { totalQuantity: 0, totalPrice: 0 });
      }

      productMap.get(productName).totalQuantity += quantity;
      productMap.get(productName).totalPrice += totalPrice;
    });

    // Convert the map values to an array for rendering
    const lowestSales = Array.from(productMap.entries()).map(
      ([productName, data]) => ({
        productName,
        totalQuantity: data.totalQuantity,
        totalPrice: data.totalPrice,
      })
    );

    // Sort the products by totalQuantity in ascending order
    const sortedProducts = lowestSales.sort(
      (a, b) => a.totalQuantity - b.totalQuantity
    );

    return sortedProducts;
  };

  // Populating the container with HTML content
  container.innerHTML = `
    <!-- Header section of the application -->
    <header id="mainHeader">
        <div class="main-app-bar">
            <div class="main-app-bar-title">
                <img src=${appIcon} alt="SimpleBiz Icons">
                <h1 class="main-app-title">SimpleBiz</h1>
            </div>
            <div class="main-menu-icon">
                <!-- Hamburger menu icon -->
                <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
                    <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
                </svg>
            </div>
            <nav id="mainDrawer" class="main-nav">
                <ul class="main-nav-list">
                    <!-- Navigation links -->
                    <li class="nav-item"><a href="/dashboard" class="nav-link">Dashboard</a></li>
                    <li class="nav-item"><a href="/product" class="nav-link">Produk</a></li>
                    <li class="nav-item user-button">
                        <!-- User profile button -->
                        <button>
                <img src="${userIcon}" alt="User Profile">
                <span>Nama User</span>
            </button>
                    </li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- Main content section of the transaction page -->
    <main class="transac-main">
        <!-- Filter container for date range selection -->
        <div class="filter-container">
            <h3 class="filter-title">Filter Tanggal</h3>
            <!-- Date input fields and apply button -->
            <input type="date" id="start" name="date-start" value="" />
            <span>-</span>
            <input type="date" id="end" name="date-end" value="" />
            <button class="apply-button" id="apply-button">Terapkan</button>
        </div>
        <!-- Transaction table section -->
        <div class="transac-content">
            <div class="table-title">
                <h2>Laporan Transaksi</h2>
            </div>
            <!-- Transaction table structure -->
            <table class="transac-table" id="transacTable">
                <thead>
                    <!-- Table headers -->
                    <tr>
                        <th>Tanggal</th>
                        <th>Jumlah Barang</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
        <!-- Detailed transaction table section -->
        <div class="transac-content" id="detailTransaction">
            <div class="table-title">
                <h2>Detail Transaksi</h2>
            </div>
            <!-- Detailed transaction table structure -->
            <table class="transac-table" id="detailTransacTable">
                <thead>
                    <!-- Table headers for detailed transactions -->
                    <tr>
                        <th>Nama Barang</th>
                        <th>Jumlah Barang</th>
                        <th>Harga Satuan</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
        <!-- Evaluation report section -->
        <div class="transac-content">
            <div class="table-title">
                <h2>Evaluasi</h2>
            </div>
            <!-- Table structure for evaluation report -->
            <table class="transac-table" id="evaluation-report">
                <thead>
                    <!-- Table headers for evaluation report -->
                    <tr>
                        <th>Nama Barang</th>
                        <th>Total Penjualan</th>
                        <th>Total Harga</th>
                    </tr>
                </thead>
                <tbody id="highest-sales">
                    <!-- Special row for highest sales -->
                    <tr class="special-row">
                        <td colspan="3">Penjualan Tertinggi</td>
                    </tr>
                </tbody>
                <tbody id="lowest-sales">
                    <!-- Special row for highest sales -->
                    <tr class="special-row">
                        <td colspan="3">Penjualan Terendah</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
    <!-- Footer section of the application -->
    <footer>
        <div class="footer-content">
            <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
        </div>
    </footer>
    `;

  // Event listeners and interactions for navigation and button clicks
  const menuIcon = container.querySelector(".main-menu-icon");
  const navList = container.querySelector(".main-nav-list");
  const mainContent = container.querySelector(".transac-main");
  const detailTransacTable = document.getElementById("detailTransaction");

  let lastClickedRow = null;

  const navItems = container.querySelectorAll(".nav-item a");

  mainContent.addEventListener("click", () => {
    navList.classList.remove("active");
  });

  navItems.forEach((navItem) => {
    navItem.addEventListener("click", () => {
      navList.classList.remove("active");
    });
  });

  menuIcon.addEventListener("click", () => {
    navList.classList.toggle("active");
  });

  const applyButton = document.getElementById("apply-button");
  applyButton.addEventListener("click", handleApplyButtonClick);
};

// Exporting the function as the default export for the module
export default renderTransactionPage;
