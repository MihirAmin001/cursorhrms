import React, { useEffect, useState } from 'react';
import { getEmployeesByBirthDateRange } from '../../api/employees';

const EmployeeBirthdays: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // Get current date and next month's date
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);

        // Format dates as ISO strings
        const startDate = today.toISOString();
        const endDate = nextMonth.toISOString();

        const data = await getEmployeesByBirthDateRange(startDate, endDate);
        setEmployees(data);
      } catch (err) {
        setError('Failed to fetch employees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Upcoming Birthdays</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-gray-600">Email: {employee.email}</p>
            <p className="text-gray-600">
              Birthday: {new Date(employee.birth_date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      {employees.length === 0 && (
        <p className="text-gray-500">No upcoming birthdays in the next month.</p>
      )}
    </div>
  );
};

export default EmployeeBirthdays; 