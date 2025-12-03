export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dashboard cards will go here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Users</h3>
          <p className="mt-2 text-gray-600">Manage application users</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>
          <p className="mt-2 text-gray-600">Application settings</p>
        </div>
      </div>
    </div>
  )
}
