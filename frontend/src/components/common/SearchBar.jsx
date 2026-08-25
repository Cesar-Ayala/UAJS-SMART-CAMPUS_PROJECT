import { useState } from 'react'
import './SearchBar.css'

export default function SearchBar({ placeholder = 'Buscar servicios...', onSearch }) {
  const [term, setTerm] = useState('')

  const handleChange = (e) => {
    setTerm(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <div className="search-bar">
      <input
        className="search-bar__input"
        type="text"
        value={term}
        placeholder={placeholder}
        onChange={handleChange}
      />
    </div>
  )
}
