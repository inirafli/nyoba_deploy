import renderPage from '../routes/route'

console.log('Hello, SimpleBiz')

document.addEventListener('DOMContentLoaded', () => {
  renderPage()
  window.addEventListener('popstate', renderPage)
})
