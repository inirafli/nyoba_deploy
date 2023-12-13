import { getAuth } from 'firebase/auth';
import renderLandingPage from '../scripts/pages/landingPage';
import renderRegisterPage from '../scripts/pages/registerPage';
import renderLoginPage from '../scripts/pages/loginPage';
import renderTransactionPage from '../scripts/pages/transactionPage';
import renderProductPage from '../scripts/pages/productPage';
import renderDashboardPage from '../scripts/pages/dashboardPage';

const renderPage = () => {
  const appContainer = document.querySelector('#app');
  const path = window.location.pathname;

  // Initialize the auth variable
  const auth = getAuth();

  switch (path) {
    case '/register':
      renderRegisterPage(appContainer)
      break

    case '/login':
      renderLoginPage(appContainer);
      break;

    case '/transaction':
      renderTransactionPage(appContainer);
      break;

    case '/product':
      renderProductPage(appContainer, auth); // Pass the auth variable
      break;

    case '/dashboard':
      renderDashboardPage(appContainer);
      break;

    default:
      renderLandingPage(appContainer);
  }
};

export default renderPage;
