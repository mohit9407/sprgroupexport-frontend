'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FiSearch } from 'react-icons/fi'

const SearchBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    setQuery(params.get('search') || '')
  }, [pathname])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (typeof window === 'undefined') return

    const trimmedQuery = query.trim()
    const params = new URLSearchParams(window.location.search)

    if (trimmedQuery) {
      params.set('search', trimmedQuery)
    } else {
      params.delete('search')
    }

    const queryString = params.toString()
    router.push(queryString ? `/shop?${queryString}` : '/shop')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full md:max-w-2xl">
      <div className="flex items-center rounded-md border border-[#D4B37C] bg-white shadow-sm overflow-hidden">
        <div className="flex flex-1 items-center gap-3 px-4 py-3">
          <FiSearch className="text-lg text-[#7a5b2d]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, metals, sizes, colors..."
            className="w-full border-0 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
            aria-label="Search products"
          />
        </div>

        <button
          type="submit"
          className="bg-[#BA8B4E] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#A87D45]"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar
