import React, { useEffect, useState } from 'react';
import { userService } from '../services/publicService';
import { Line } from 'react-chartjs-2';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Loader from './Loader';
import '../styles/Statistics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [sortOption, setSortOption] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
    fetchUsers();
  }, []);

  const fetchStatistics = async () => {
    try {
      const data = await userService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyWorkItems = (workItems) => {
    const months = Array(12).fill(0);
    workItems.forEach(item => {
      const date = new Date(item.createdAt);
      if (date.getFullYear() === filterYear) {
        months[date.getMonth()]++;
      }
    });
    return months;
  };

  const getTotalWorkItemsForYear = (workItems) => {
    return workItems.filter(item => new Date(item.createdAt).getFullYear() === filterYear).length;
  };

  const filteredUsers = users
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      if (sortOption === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortOption === 'workItems') {
        comparison = a.workItems.length - b.workItems.length;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="statistics-container">
      <div className="statistics-filter-container">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="statistics-filter-input"
        />
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(parseInt(e.target.value))}
          className="statistics-filter-select"
        >
          {[...Array(3)].map((_, i) => {
            const year = new Date().getFullYear() - i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>
        <div className="statistics-sort-container">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="statistics-filter-select"
          >
            <option value="name">Sort by Name</option>
            <option value="workItems">Sort by Work Items</option>
          </select>
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="statistics-sort-direction-toggle"
            title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortDirection === 'asc' ? 
              <ChevronUpIcon className="h-5 w-5" /> : 
              <ChevronDownIcon className="h-5 w-5" />
            }
          </button>
        </div>
      </div>
      <div className="statistics-user-cards">
        {filteredUsers.map(user => (
          <div 
            key={user._id} 
            className="statistics-user-card"
            onClick={() => handleUserClick(user._id)}
          >
            <div className="statistics-user-details">
              <h3>{user.name} <br/><span>({user.email})</span></h3>
              <p>Total Work Items: {getTotalWorkItemsForYear(user.workItems)}</p>
              <Line
                data={{
                  labels: Array(12).fill('').map((_, i) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return monthNames[i];
                  }),
                  datasets: [{
                    label: 'Work Items',
                    data: getMonthlyWorkItems(user.workItems),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                  }]
                }}
                options={{
                  scales: {
                    x: {
                      ticks: {
                        callback: (value, index) => {
                          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                          return monthNames[index];
                        }
                      }
                    },
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;
