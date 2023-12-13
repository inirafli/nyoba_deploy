// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import '../../styles/login.css';
import firebaseConfig from '../common/config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const handleLoginSuccess = (userCredential) => {
  const { user } = userCredential;
  redirectToDashboard(); // Redirect to the dashboard after successful login
};

const handleLoginError = (error) => {
  console.error('Login gagal :', error.message);
  const errorMessage = document.querySelector('.error-message');
  errorMessage.textContent = error.message;
};

const redirectToDashboard = () => {
  // Check if the user is authenticated before redirecting
  const user = auth.currentUser;
  if (user) {
    window.location.href = '/dashboard'; // Change "/dashboard" to the actual path of your dashboard page
  } else {
    console.error('User not authenticated');
    // You may want to handle the case where the user is not authenticated
  }
};

const renderLoginPage = (container) => {
  document.body.style.backgroundColor = '#3d5a80';

  container.innerHTML = `
    <main id="login-page">
        <button id="back" class="back-button" type="button">
            <svg class="vector" width="48" height="48" viewBox="0 0 63 63" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0.21875 31.5C0.21875 48.7754 14.2246 62.7812 31.5 62.7812C48.7754 62.7812 62.7812 48.7754 62.7812 31.5C62.7812 14.2246 48.7754 0.21875 31.5 0.21875C14.2246 0.21875 0.21875 14.2246 0.21875 31.5ZM32.1993 17.7603C32.4237 17.9829 32.6021 18.2475 32.7242 18.5389C32.8463 18.8304 32.9098 19.1431 32.9111 19.4592C32.9123 19.7752 32.8513 20.0884 32.7315 20.3809C32.6117 20.6733 32.4355 20.9393 32.2129 21.1637L24.3444 29.0938H44.4336C45.0718 29.0938 45.6838 29.3473 46.1351 29.7985C46.5863 30.2498 46.8398 30.8618 46.8398 31.5C46.8398 32.1382 46.5863 32.7502 46.1351 33.2015C45.6838 33.6527 45.0718 33.9062 44.4336 33.9062H24.3444L32.2129 41.8363C32.4354 42.0609 32.6116 42.3271 32.7313 42.6197C32.851 42.9124 32.9119 43.2257 32.9105 43.5419C32.9091 43.8581 32.8454 44.1709 32.7232 44.4624C32.6009 44.754 32.4224 45.0186 32.1978 45.2412C31.9733 45.4638 31.7071 45.6399 31.4144 45.7596C31.1218 45.8793 30.8084 45.9402 30.4923 45.9388C30.1761 45.9374 29.8633 45.8738 29.5717 45.7515C29.2802 45.6292 29.0155 45.4507 28.793 45.2262L16.8535 33.1949C16.4062 32.7442 16.1552 32.135 16.1552 31.5C16.1552 30.865 16.4062 30.2558 16.8535 29.8051L28.793 17.7738C29.0156 17.549 29.2803 17.3703 29.5721 17.2479C29.8639 17.1255 30.1769 17.0619 30.4933 17.0606C30.8097 17.0593 31.1233 17.1205 31.416 17.2406C31.7087 17.3606 31.9749 17.5372 32.1993 17.7603Z"
                    fill="white" />
            </svg>
        </button>
        <div class="login-container">
            <h2 class="form-title">Masuk Akun</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                    <div class="input-container">
                        <input type="checkbox" id="showPassword">
                        <label for="showPassword">Tampilkan Password</label>
                    </div>
                </div>

                <button type="submit" class="login-button">Masuk</button>
            </form>
            <p class="error-message">Ini adalah Warning</p>
            <p>Belum punya akun? <a href="/register">Daftar Disini!</a></p>
        </div>
        <div class="login-headline">
            <h1>Selamat Datang Kembali</h1>
            <p>Daftarkan bisnis Anda hari ini dan mulailah merasakan keuntungan dari sistem pencatatan digital yang
                efisien.</p>
        </div>
    </main>
    `;

  const backButton = document.querySelector('#back');
  const passwordInput = document.querySelector('#password');
  const showPasswordCheck = document.querySelector('#showPassword');

  showPasswordCheck.addEventListener('change', () => {
    const type = showPasswordCheck.checked ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
  });

  backButton.addEventListener('click', () => {
    window.history.pushState(null, null, '/');
    window.location.href = '/';
  });

  const loginForm = document.querySelector('#login-form');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      // Sign in user with Firebase authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Console log to show successful login
      console.log('Login berhasil dilakukan:', userCredential);

      // Redirect to the dashboard upon successful login
      handleLoginSuccess(userCredential);
    } catch (error) {
      // Handle login errors
      console.error('Login gagal:', error.message);

      // Display error message to the user
      const errorMessage = document.querySelector('.error-message');
      errorMessage.textContent = error.message;

      handleLoginError(error);
    }
  });
};

export default renderLoginPage;
