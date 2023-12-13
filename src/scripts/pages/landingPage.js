import '../../styles/landing.css';

import appIcon from '../../public/icons/simplebiz-icons.png';
import landingImage from '../../public/images/landing-page-image.png';

const renderLandingPage = (container) => {
  container.innerHTML = `
    <header class="landing-header">
        <div class="app-bar">
            <div class="app-bar__title">
                <img src=${appIcon} alt="SimpleBiz Icons">
                <h1 class="app-title">SimpleBiz</h1>
            </div>
            <div class="menu-icon">
                <svg class="material-icons" width="36" height="36" viewBox="0 0 24 24">
                    <path fill="#3d5a80" d="M3 18h18v-2H3v2zM3 13h18v-2H3v2zM3 6v2h18V6H3z"></path>
                </svg>
            </div>
            <nav id="drawer" class="nav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="#">Beranda</a></li>
                    <li class="nav-item"><a href="/login">Masuk</a></li>
                    <li class="nav-item"><a href="/register" id="daftar">Daftar</a></li>
                </ul>
            </nav>
        </div>
    </header>
    <main class="landing-main">
        <div class="hero">
            <div class="hero-content">
                <h1 class="hero-title">Pencatatan Digital untuk UMKM Indonesia</h1>
                <p class="hero-desc">Sederhana. Cepat. Akurat. SimpleBiz adalah solusi pencatatan digital yang mendukung
                    UMKM di Indonesia.</p>
                <button class="start-note" id="startNoteBtn">Mulai Mencatat</button>
            </div>
            <div class="hero-image">
                <img src=${landingImage} alt="Hero Image">
            </div>
        </div>
        <div class="feature">
            <div class="feature-title">
                <h2>Mengapa Memilih Layanan SimpleBiz?</h2>
            </div>
            <div class="feature-list">
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg class="material-symbols-add-notes-outline" width="128" height="128" viewBox="0 0 144 144"
                            fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M30 126C26.7 126 23.874 124.824 21.522 122.472C19.17 120.12 17.996 117.296 18 114V30C18 26.7 19.176 23.874 21.528 21.522C23.88 19.17 26.704 17.996 30 18H114C117.3 18 120.126 19.176 122.478 21.528C124.83 23.88 126.004 26.704 126 30V70.2C124.1 69.3 122.15 68.524 120.15 67.872C118.15 67.22 116.1 66.746 114 66.45V30H30V114H66.3C66.6 116.2 67.076 118.3 67.728 120.3C68.38 122.3 69.154 124.2 70.05 126H30ZM30 108V114V30V66.45V66V108ZM42 102H66.45C66.75 99.9 67.226 97.85 67.878 95.85C68.53 93.85 69.254 91.9 70.05 90H42V102ZM42 78H78.6C81.8 75 85.376 72.5 89.328 70.5C93.28 68.5 97.504 67.15 102 66.45V66H42V78ZM42 54H102V42H42V54ZM108 138C99.7 138 92.624 135.074 86.772 129.222C80.92 123.37 77.996 116.296 78 108C78 99.7 80.926 92.624 86.778 86.772C92.63 80.92 99.704 77.996 108 78C116.3 78 123.376 80.926 129.228 86.778C135.08 92.63 138.004 99.704 138 108C138 116.3 135.074 123.376 129.222 129.228C123.37 135.08 116.296 138.004 108 138ZM105 126H111V111H126V105H111V90H105V105H90V111H105V126Z"
                                fill="black" />
                        </svg>
                    </div>
                    <div class="feature-content">
                        <h2>Pencatatan Efisien</h2>
                        <p>Mencatat transaksi penjualan dengan cepat dan mudah. Pengguna dapat merekam transaksi mereka
                            secara efisien meminimalisir waktu pencatatan.</p>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg class="material-symbols-file-copy-outline-rounded" width="128" height="128"
                            viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M114 114H48C44.7 114 41.874 112.824 39.522 110.472C37.17 108.12 35.996 105.296 36 102V18C36 14.7 37.176 11.874 39.528 9.52201C41.88 7.17001 44.704 5.99601 48 6.00001H85.05C86.65 6.00001 88.176 6.30001 89.628 6.90001C91.08 7.50001 92.354 8.35001 93.45 9.45001L122.55 38.55C123.65 39.65 124.5 40.926 125.1 42.378C125.7 43.83 126 45.354 126 46.95V102C126 105.3 124.824 108.126 122.472 110.478C120.12 112.83 117.296 114.004 114 114ZM114 48H93C90.5 48 88.374 47.124 86.622 45.372C84.87 43.62 83.996 41.496 84 39V18H48V102H114V48ZM24 138C20.7 138 17.874 136.824 15.522 134.472C13.17 132.12 11.996 129.296 12 126V48C12 46.3 12.576 44.874 13.728 43.722C14.88 42.57 16.304 41.996 18 42C19.7 42 21.126 42.576 22.278 43.728C23.43 44.88 24.004 46.304 24 48V126H84C85.7 126 87.126 126.576 88.278 127.728C89.43 128.88 90.004 130.304 90 132C90 133.7 89.424 135.126 88.272 136.278C87.12 137.43 85.696 138.004 84 138H24Z"
                                fill="black" />
                        </svg>
                    </div>
                    <div class="feature-content">
                        <h2>Laporan Transaksi Terperinci</h2>
                        <p>Akses laporan transaksi secara rinci dalam berbagai periode waktu. Pengguna dapat dengan
                            mudah menganalisis performa penjualan harian, mingguan, atau bulanan.</p>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg class="material-symbols-chart-data-outline-rounded" width="128" height="128"
                            viewBox="0 0 144 144" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M62.7 77.85L70.5 85.65C71.6 86.75 73 87.3 74.7 87.3C76.4 87.3 77.8 86.75 78.9 85.65L96 68.55V72.15C96 73.85 96.576 75.25 97.728 76.35C98.88 77.45 100.304 78 102 78C103.7 78 105.126 77.426 106.278 76.278C107.43 75.13 108.004 73.704 108 72V54C108 52.3 107.424 50.874 106.272 49.722C105.12 48.57 103.696 47.996 102 48H83.85C82.15 48 80.75 48.576 79.65 49.728C78.55 50.88 78 52.304 78 54C78 55.7 78.576 57.126 79.728 58.278C80.88 59.43 82.304 60.004 84 60H87.45L74.7 72.9L66.9 65.1C65.8 63.9 64.4 63.3 62.7 63.3C61 63.3 59.6 63.9 58.5 65.1L40.2 83.4C39 84.5 38.4 85.9 38.4 87.6C38.4 89.3 39 90.7 40.2 91.8C41.3 93 42.7 93.6 44.4 93.6C46.1 93.6 47.5 93 48.6 91.8L62.7 77.85ZM30 126C26.7 126 23.874 124.824 21.522 122.472C19.17 120.12 17.996 117.296 18 114V30C18 26.7 19.176 23.874 21.528 21.522C23.88 19.17 26.704 17.996 30 18H114C117.3 18 120.126 19.176 122.478 21.528C124.83 23.88 126.004 26.704 126 30V114C126 117.3 124.824 120.126 122.472 122.478C120.12 124.83 117.296 126.004 114 126H30ZM30 114H114V30H30V114Z"
                                fill="black" />
                        </svg>
                    </div>
                    <div class="feature-content">
                        <h2>Meningkatkan Penjualan</h2>
                        <p>Dapat memberikan evaluasi untuk meningkatkan penjualan melalui rekomendasi produk
                            yang sesuai dengan kebutuhan pelanggan.</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <footer>
        <div class="footer-content">
            <p>&copy; 2023 Capstone C523-PS036's SimpleBiz Application. All rights reserved.</p>
        </div>
    </footer>
    `;

  const menuIcon = container.querySelector('.menu-icon');
  const navList = container.querySelector('.nav-list');
  const mainContent = container.querySelector('main');
  const startNoteBtn = container.querySelector('#startNoteBtn');

  const navItems = container.querySelectorAll('.nav-item a');

  mainContent.addEventListener('click', () => {
    navList.classList.remove('active');
  });

  navItems.forEach((navItem) => {
    navItem.addEventListener('click', () => {
      navList.classList.remove('active');
    });
  });

  menuIcon.addEventListener('click', () => {
    navList.classList.toggle('active');
  });

  startNoteBtn.addEventListener('click', () => {
    window.location.href = '/login';
  });
};

export default renderLandingPage;
