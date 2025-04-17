import React from 'react';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manager Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Team Management */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900">Team Management</h3>
            <p className="text-blue-700 mt-2">View and manage your team members</p>
            <button
              onClick={() => navigate('/employees')}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              View Team
            </button>
          </div>

          {/* Leave Approvals */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-green-900">Leave Approvals</h3>
            <p className="text-green-700 mt-2">Review and approve leave requests</p>
            <button
              onClick={() => navigate('/leave')}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Manage Leave
            </button>
          </div>

          {/* Team Documents */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-purple-900">Team Documents</h3>
            <p className="text-purple-700 mt-2">Access and manage team documents</p>
            <button
              onClick={() => navigate('/documents')}
              className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              View Documents
            </button>
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Team Overview</h3>
        <div className="space-y-4">
          {/* Add team overview items here */}
          <div className="border-b pb-4">
            <p className="text-gray-600">No team data to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard; 