import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__text">
        © {new Date().getFullYear()} Corporación Universitaria Antonio José de Sucre — UAJS Smart Campus
      </p>
    </footer>
  )
}
