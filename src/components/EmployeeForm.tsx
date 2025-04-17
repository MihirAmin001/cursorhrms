import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Employee } from '../lib/supabase';

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
}

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  department_id: string;
  status: 'active' | 'inactive';
  hire_date: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onClose }) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    department_id: '',
    status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        position: employee.position,
        department_id: employee.department_id,
        status: employee.status,
        hire_date: employee.hire_date,
      });
    }
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createMutation = useMutation({
    mutationFn: async (newEmployee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedEmployee: Partial<Employee>) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updatedEmployee)
        .eq('id', employee?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (employee) {
      await updateMutation.mutateAsync(formData);
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            type="text"
            name="first_name"
            id="first_name"
            required
            value={formData.first_name}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            required
            value={formData.last_name}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div>
        <label
          htmlFor="position"
          className="block text-sm font-medium text-gray-700"
        >
          Position
        </label>
        <input
          type="text"
          name="position"
          id="position"
          required
          value={formData.position}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div>
        <label
          htmlFor="department_id"
          className="block text-sm font-medium text-gray-700"
        >
          Department
        </label>
        <select
          name="department_id"
          id="department_id"
          required
          value={formData.department_id}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Select a department</option>
          {/* Add department options here */}
        </select>
      </div>

      <div>
        <label
          htmlFor="hire_date"
          className="block text-sm font-medium text-gray-700"
        >
          Hire Date
        </label>
        <input
          type="date"
          name="hire_date"
          id="hire_date"
          required
          value={formData.hire_date}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          name="status"
          id="status"
          required
          value={formData.status}
          onChange={handleChange}
          className="input-field"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="btn-primary"
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm; 