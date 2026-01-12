import React from 'react'

const StatusHistory = ({ statusHistory }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-lg font-semibold mb-4">Order History</h2>
    <div className="flow-root">
      <ul className="-mb-8">
        {statusHistory.length > 0 ? (
          statusHistory.map((history, index) => (
            <li key={index}>
              <div className="relative pb-8">
                {index !== statusHistory.length - 1 && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        history.status === 'Completed'
                          ? 'bg-green-500'
                          : history.status === 'Pending'
                            ? 'bg-yellow-500'
                            : history.status === 'Processing'
                              ? 'bg-blue-500'
                              : history.status === 'Shipped'
                                ? 'bg-purple-500'
                                : 'bg-gray-500'
                      }`}
                    >
                      <svg
                        className="h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Status changed to{' '}
                        <span className="font-medium text-gray-900">
                          {history.status}
                        </span>
                      </p>
                      {history.comment && (
                        <p className="text-sm text-gray-500 mt-1">
                          {history.comment}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      <time dateTime={history.date}>
                        {new Date(history.date).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-500">No status history available</p>
        )}
      </ul>
    </div>
  </div>
)

export default StatusHistory
