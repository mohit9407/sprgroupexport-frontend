import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderStatuses } from '@/features/orderStatus/orderStatusSlice'

const StatusUpdateForm = ({
  statusId,
  setStatusId,
  comment,
  setComment,
  handleStatusUpdate,
  router,
}) => {
  const dispatch = useDispatch()
  const { statuses, loading, error } = useSelector((state) => state.orderStatus)

  useEffect(() => {
    dispatch(fetchOrderStatuses())
  }, [dispatch])

  if (loading) return <div>Loading statuses...</div>
  if (error) return <div>Error loading statuses: {error}</div>

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Update Status</h2>
      <form onSubmit={handleStatusUpdate}>
        <div className="mb-4">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Order Status
          </label>
          <select
            id="status"
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {statuses.map((statusItem) => (
              <option key={statusItem._id} value={statusItem._id}>
                {statusItem.orderStatus}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Add Comment (Optional)
          </label>
          <textarea
            id="comment"
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            placeholder="Add a comment about this status update"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Update Status
          </button>
        </div>
      </form>
    </div>
  )
}

export default StatusUpdateForm
