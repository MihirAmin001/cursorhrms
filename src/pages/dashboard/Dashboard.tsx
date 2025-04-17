import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { useRBAC } from '../../hooks/useRBAC';

interface DashboardStats {
  employees: number;
  departments: number;
  leaveRequests: number;
  documents: number;
  activeEmployees: number;
  pendingLeaveRequests: number;
  recentHires: number;
  upcomingBirthdays: number;
}

interface StatItem {
  name: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  change: string;
  changeType: 'positive' | 'negative';
  color: string;
}

interface QuickAction {
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  roles: string[];
  color: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();

  const { data: statsData, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        { count: employeesCount },
        { count: departmentsCount },
        { count: leaveRequestsCount },
        { count: documentsCount },
        { count: activeEmployeesCount },
        { count: pendingLeaveRequestsCount },
        { count: recentHiresCount },
        { count: upcomingBirthdaysCount },
      ] = await Promise.all([
        supabase.from('cursorhrms_employees').select('*', { count: 'exact', head: true }),
        supabase.from('cursorhrms_departments').select('*', { count: 'exact', head: true }),
        supabase.from('cursorhrms_leave_requests').select('*', { count: 'exact', head: true }),
        supabase.from('cursorhrms_documents').select('*', { count: 'exact', head: true }),
        supabase.from('cursorhrms_employees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('cursorhrms_leave_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('cursorhrms_employees').select('*', { count: 'exact', head: true }).gte('hire_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('cursorhrms_employees').select('*', { count: 'exact', head: true }).gte('birth_date', new Date().toISOString()).lte('birth_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      return {
        employees: employeesCount || 0,
        departments: departmentsCount || 0,
        leaveRequests: leaveRequestsCount || 0,
        documents: documentsCount || 0,
        activeEmployees: activeEmployeesCount || 0,
        pendingLeaveRequests: pendingLeaveRequestsCount || 0,
        recentHires: recentHiresCount || 0,
        upcomingBirthdays: upcomingBirthdaysCount || 0,
      };
    },
  });

  const stats: StatItem[] = [
    {
      name: 'Total Employees',
      value: statsData?.employees || 0,
      icon: UsersIcon,
      change: '+4.75%',
      changeType: 'positive',
      color: 'bg-blue-500',
    },
    {
      name: 'Active Employees',
      value: statsData?.activeEmployees || 0,
      icon: UserGroupIcon,
      change: '+2.15%',
      changeType: 'positive',
      color: 'bg-green-500',
    },
    {
      name: 'Departments',
      value: statsData?.departments || 0,
      icon: BuildingOfficeIcon,
      change: '+1.39%',
      changeType: 'positive',
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Leave Requests',
      value: statsData?.pendingLeaveRequests || 0,
      icon: CalendarIcon,
      change: '-1.39%',
      changeType: 'negative',
      color: 'bg-yellow-500',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      name: 'Add Employee',
      icon: UsersIcon,
      path: '/employees/new',
      roles: ['admin', 'hr'],
      color: 'bg-blue-500',
    },
    {
      name: 'Manage Leave',
      icon: CalendarIcon,
      path: '/leave',
      roles: ['admin', 'hr', 'manager', 'employee'],
      color: 'bg-green-500',
    },
    {
      name: 'View Documents',
      icon: DocumentIcon,
      path: '/documents',
      roles: ['admin', 'hr', 'manager', 'employee'],
      color: 'bg-purple-500',
    },
    {
      name: 'Department Overview',
      icon: BuildingOfficeIcon,
      path: '/departments',
      roles: ['admin', 'hr'],
      color: 'bg-yellow-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to your HRMS dashboard. Here's an overview of your organization.
          </p>
        </div>
        <div className="flex space-x-4">
          {(hasPermission('admin') || hasPermission('hr')) && (
            <button
              onClick={() => navigate('/employees/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Employee
            </button>
          )}
          <button
            onClick={() => navigate('/leave')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Request Leave
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions
            .filter((action) => {
              return action.roles.some(role => hasPermission(role as any));
            })
            .map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.path)}
                className="flex items-center p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-md ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="ml-4 text-sm font-medium text-gray-900">{action.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">New Employee Onboarded</p>
              <p className="text-sm text-gray-500">John Doe joined the Marketing team</p>
            </div>
            <div className="ml-auto text-sm text-gray-500">2 hours ago</div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Leave Request Approved</p>
              <p className="text-sm text-gray-500">Jane Smith's leave request was approved</p>
            </div>
            <div className="ml-auto text-sm text-gray-500">1 day ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 