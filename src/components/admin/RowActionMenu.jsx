'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export function RowActionsMenu({ label = 'Action', items = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center w-24 p-2 gap-1 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:bg-gray-200 hover:text-sky-600"
      >
        {label}
        <span className="text-xs">▼</span>
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-32 rounded border border-gray-200 bg-white shadow-lg">
          <ul className="py-1 text-sm">
            {items.map((item, index) => {
              const isLast = index === items.length - 1

              const baseClass =
                'block w-full text-left pl-4 py-1 hover:bg-gray-100'
              const dangerClass = item.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700'

              return (
                <li key={index}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`${baseClass} ${dangerClass}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        item.onClick?.()
                      }}
                      className={`${baseClass} ${dangerClass}`}
                    >
                      {item.label}
                    </button>
                  )}

                  {!isLast && (
                    <div className="my-0.5 border-t border-gray-200" />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
