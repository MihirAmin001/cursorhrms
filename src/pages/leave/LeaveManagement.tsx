import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { LeaveRequest, Employee } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  TableCellsIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

type SortField = 'employee' | 'type' | 'start_date' | 'end_date' | 'status';
type SortDirection = 'asc' | 'desc';

interface LeaveBalance {
  [key: string]: number;
}

interface LeaveBalanceRecord {
  employee_id: string;
  leave_type: string;
  balance: number;
}

const LeaveManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [formData, setFormData] = useState({
    leave_type: 'annual' as const,
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [sortField, setSortField] = useState<SortField>('start_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch leave requests
  const { data: leaveRequests, isLoading: isLoadingRequests } = useQuery<LeaveRequest[]>({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch employees
  const { data: employees, isLoading: isLoadingEmployees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch leave balances
  const { data: leaveBalances, isLoading: isLoadingBalances } = useQuery<LeaveBalanceRecord[]>({
    queryKey: ['leave-balances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_balances')
        .select('*');

      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingRequests || isLoadingEmployees || isLoadingBalances;

  // Filter, sort, and search functionality
  const filteredLeaveRequests = useMemo(() => {
    if (!leaveRequests) return [];
    
    let filtered = leaveRequests.filter((request: LeaveRequest) => {
      const employee = employees?.find((e: Employee) => e.id === request.employee_id);
      const employeeName = employee ? `${employee.first_name} ${employee.last_name}`.toLowerCase() : '';
      const matchesSearch = employeeName.includes(searchTerm.toLowerCase()) ||
                          request.leave_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a: LeaveRequest, b: LeaveRequest) => {
      let comparison = 0;
      switch (sortField) {
        case 'employee':
          const employeeA = employees?.find((e: Employee) => e.id === a.employee_id);
          const employeeB = employees?.find((e: Employee) => e.id === b.employee_id);
          const nameA = employeeA ? `${employeeA.first_name} ${employeeA.last_name}` : '';
          const nameB = employeeB ? `${employeeB.first_name} ${employeeB.last_name}` : '';
          comparison = nameA.localeCompare(nameB);
          break;
        case 'type':
          comparison = a.leave_type.localeCompare(b.leave_type);
          break;
        case 'start_date':
          comparison = new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          break;
        case 'end_date':
          comparison = new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [leaveRequests, employees, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredLeaveRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeaveRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLeaveRequests, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const headers = ['Employee', 'Type', 'Start Date', 'End Date', 'Reason', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredLeaveRequests.map(request => {
        const employee = employees?.find(e => e.id === request.employee_id);
        const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : '';
        return [
          `"${employeeName}"`,
          request.leave_type,
          request.start_date,
          request.end_date,
          `"${request.reason}"`,
          request.status
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leave-requests-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const createMutation = useMutation({
    mutationFn: async (newLeave: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([newLeave])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setIsModalOpen(false);
      setFormData({
        leave_type: 'annual',
        start_date: '',
        end_date: '',
        reason: '',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error('No authenticated user found');
      return;
    }

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (startDate > endDate) {
      alert('End date must be after start date');
      return;
    }

    const newLeave = {
      ...formData,
      employee_id: user.id,
      status: 'pending' as const,
    };

    await createMutation.mutateAsync(newLeave);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting leave request:', error);
      }
    }
  };

  const handleApprove = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, status: 'approved' });
  };

  const handleReject = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, status: 'rejected' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XMarkIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-700 hover:text-red-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employee leave requests
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center"
          >
            Export CSV
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            className="btn-secondary flex items-center"
          >
            {viewMode === 'table' ? (
              <>
                <CalendarIcon className="h-5 w-5 mr-2" />
                Calendar View
              </>
            ) : (
              <>
                <TableCellsIcon className="h-5 w-5 mr-2" />
                Table View
              </>
            )}
          </button>
          <button
            onClick={() => {
              setSelectedLeave(null);
              setFormData({
                leave_type: 'annual',
                start_date: '',
                end_date: '',
                reason: '',
              });
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Request Leave
          </button>
        </div>
      </div>

      {/* Leave Balance Summary */}
      {leaveBalances && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(leaveBalances).map(([type, balance]) => (
            <div key={type} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 capitalize">{type} Leave</h3>
              <p className="mt-2 text-2xl font-semibold text-gray-900">
                {`${balance} days`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by employee name, leave type, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-10"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRequests.map((request) => {
                  const employee = employees?.find((e) => e.id === request.employee_id);
                  return (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {employee?.first_name?.[0]}{employee?.last_name?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee?.first_name} {employee?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{employee?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.leave_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(request.start_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(request.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {(() => {
                            if (!employee || !leaveBalances) return '0 days';
                            const balance = leaveBalances.find(
                              (b) => b.employee_id === employee.id && b.leave_type === request.leave_type
                            ) as LeaveBalanceRecord | undefined;
                            return balance ? `${balance.balance} days` : '0 days';
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-secondary px-4 py-2"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="btn-secondary px-4 py-2"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-center">Calendar view coming soon...</p>
        </div>
      )}

      {/* Leave Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Request Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="leave_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Leave Type
                </label>
                <select
                  name="leave_type"
                  id="leave_type"
                  required
                  value={formData.leave_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    id="start_date"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    required
                    value={formData.end_date}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Reason
                </label>
                <textarea
                  name="reason"
                  id="reason"
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement; 