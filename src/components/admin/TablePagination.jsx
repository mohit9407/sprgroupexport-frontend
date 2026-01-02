function getPaginationRange(current, total, delta = 2) {
  const range = []
  const rangeWithDots = []
  let last = null

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i)
    }
  }

  for (const page of range) {
    if (last) {
      if (page - last === 2) {
        rangeWithDots.push(last + 1)
      } else if (page - last > 2) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(page)
    last = page
  }

  return rangeWithDots
}

export default function TablePagination({
  pageIndex,
  pageCount,
  onPageChange,
}) {
  const currentPage = pageIndex + 1
  const pages = getPaginationRange(currentPage, pageCount)

  return (
    <ul className="flex items-center gap-1 text-sm">
      <li
        className={`page-item ${currentPage === 1 ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <button
          className="px-3 py-1.5 border rounded"
          onClick={() => onPageChange(pageIndex - 1)}
        >
          ‹
        </button>
      </li>

      {pages.map((page, idx) =>
        page === '...' ? (
          <li key={idx} className="px-2 py-1 text-gray-400">
            ...
          </li>
        ) : (
          <li key={idx}>
            <button
              className={`px-3 py-1.5 border rounded ${
                page === currentPage
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => onPageChange(page - 1)}
            >
              {page}
            </button>
          </li>
        ),
      )}

      <li
        className={`page-item ${currentPage === pageCount ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <button
          className="px-3 py-1.5 border rounded"
          onClick={() => onPageChange(pageIndex + 1)}
        >
          ›
        </button>
      </li>
    </ul>
  )
}
