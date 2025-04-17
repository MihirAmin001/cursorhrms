import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">System Overview</h3>
            <p className="text-blue-700 mt-2">Manage system settings and configurations</p>
            <button
              onClick={() => navigate('/settings')}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Go to Settings
            </button>
          </div>

          {/* User Management */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">User Management</h3>
            <p className="text-green-700 mt-2">Manage user accounts and permissions</p>
            <button
              onClick={() => navigate('/employees')}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Manage Users
            </button>
          </div>

          {/* Department Management */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900">Department Management</h3>
            <p className="text-purple-700 mt-2">Manage departments and team structures</p>
            <button
              onClick={() => navigate('/departments')}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Manage Departments
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {/* Add recent activity items here */}
          <div className="border-b pb-4">
            <p className="text-gray-600">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 