export default function UserDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Welcome to Your Dashboard
      </h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800">Your Activities</h2>
        <div className="mt-4 space-y-4">
          <p className="text-gray-600">Recent activity will be shown here.</p>
        </div>
      </div>
    </div>
  )
}
