import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/publicService';
import { Line } from 'react-chartjs-2';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Loader from './Loader';
import '../styles/UserDetails.css';

const UserDetails = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const { userId } = useParams();
  const [userCategories, setUserCategories] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetchUserData();
    console.log("userData :: ", getAllUserData())
  }, [userId, selectedYear, selectedMonth]);

  const fetchUserData = async () => {
    try {
      const users = await userService.getAllUsers();
      const user = users.find(u => u._id === userId);
      setUserData(user);
      fetchUserCategories();
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCategories = async () => {
    let categories = await userService.getAllCategories(userId);
    categories = categories && categories.length > 0 ? categories : [];
    
    categories = categories.map(category => {
      let filteredWorkItems = category.workItems;

      if (selectedMonth !== 'all') {
        filteredWorkItems = filteredWorkItems.filter(item => {
          const date = new Date(item.createdAt);
          return date.getFullYear() === selectedYear && date.getMonth() === parseInt(selectedMonth);
        });
      } else {
        filteredWorkItems = filteredWorkItems.filter(item => {
          const date = new Date(item.createdAt);
          return date.getFullYear() === selectedYear;
        });
      }

      return {
        ...category,
        workItems: filteredWorkItems,
        itemCount: filteredWorkItems.length
      };
    });

    setUserCategories(categories);
  };

  const getWorkItemStats = () => {
    let filteredItems = userData.workItems;
    
    if (selectedMonth !== 'all') {
      filteredItems = filteredItems.filter(item => {
        const date = new Date(item.createdAt);
        return date.getFullYear() === selectedYear && date.getMonth() === parseInt(selectedMonth);
      });
    } else {
      filteredItems = filteredItems.filter(item => {
        const date = new Date(item.createdAt);
        return date.getFullYear() === selectedYear;
      });
    }

    const completed = filteredItems.filter(item => item.isCompleted).length;
    const total = filteredItems.length;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;

    return { completed, total, completionRate };
  };

  const getChartData = () => {
    if (selectedMonth === 'all') {
      // Show monthly data for selected year
      const monthlyData = Array(12).fill(0);
      userData.workItems.forEach(item => {
        const date = new Date(item.createdAt);
        if (date.getFullYear() === selectedYear) {
          monthlyData[date.getMonth()]++;
        }
      });
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: monthlyData
      };
    } else {
      // Show daily data for selected month
      const daysInMonth = new Date(selectedYear, parseInt(selectedMonth) + 1, 0).getDate();
      const dailyData = Array(daysInMonth).fill(0);
      
      userData.workItems.forEach(item => {
        const date = new Date(item.createdAt);
        if (date.getFullYear() === selectedYear && date.getMonth() === parseInt(selectedMonth)) {
          dailyData[date.getDate() - 1]++;
        }
      });
      
      return {
        labels: Array.from({length: daysInMonth}, (_, i) => i + 1),
        data: dailyData
      };
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const formatDateTime = (date) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(date).toLocaleString(undefined, options);
  };

  const formatSubItemDate = (date) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffInHours = Math.floor((now - itemDate) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - itemDate) / (1000 * 60));
        return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    if (itemDate.getFullYear() === now.getFullYear()) {
      return itemDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    
    return itemDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAllUserData = () => {
    return JSON.stringify({
      userInfo: userData,
      categories: userCategories,
      workItems: userData?.workItems
    });
  };

  if (loading) return <Loader />;
  if (!userData) return <div className="user-details-error">User not found</div>;

  const stats = getWorkItemStats();
  const chartData = getChartData();

  return (
    <div className="user-details-container">
      <div className="user-details-info">
        <div className="user-details-header">
          <div>
            <h1>{userData.name}</h1>
            <p className="email">{userData.email}</p>
          </div>
          <div className="user-details-filters">
            <select
              className="user-details-filter-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setSelectedMonth("all");
              }}
            >
              {[...Array(3)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <select
              className="user-details-filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ].map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="user-details-stats-grid">
        <div className="user-details-stat-card">
          <h3>Total Items Worked On</h3>
          <p>{stats.total}</p>
        </div>
        <div className="user-details-stat-card">
          <h3>Completed Items</h3>
          <p>{stats.completed}</p>
        </div>
      </div>

      <div className="user-details-chart-container">
        <h2>Work Items {selectedMonth === "all" ? "by Month" : "by Day"}</h2>
        <Line
          data={{
            labels: chartData.labels,
            datasets: [
              {
                label: "Work Items",
                data: chartData.data,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                fill: false,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>

      <div className="user-details-categories-container">
        {userCategories?.map((category) => {
          if(category.workItems.length <= 0){
            return;
          }
          
          return (
            <div
              key={category._id}
              className={`user-details-category-accordion ${
                expandedCategories[category._id] ? "expanded" : ""
              }`}
            >
              <div
                className="user-details-category-header"
                onClick={() => toggleCategory(category._id)}
              >
                <h3>{category.name}</h3>
                <span className="item-count">{category.itemCount}</span>
                {expandedCategories[category._id] ? (
                  <ChevronDownIcon className="h-5 w-5" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5" />
                )}
              </div>
              {expandedCategories[category._id] && (
                <>
                  {category.description && <div className="user-details-category-desc">
                    {<h4>{category.description}</h4>}
                  </div>}
                  <div className="user-details-category-items">
                    {category.workItems.map((item) => (
                      <div
                        key={item._id}
                        className={`user-details-category-item ${
                          expandedItems[item._id] ? "expanded" : ""
                        }`}
                      >
                        <div
                          className="user-details-category-item-header"
                          onClick={() => toggleItem(item._id)}
                        >
                          <div className="user-details-item-title">
                            <h4>{item.title}</h4>
                          </div>
                          <div className="item-dates">
                            <span>{formatDateTime(item.startDate)} - {item.endDate ? formatDateTime(item.endDate) : 'Ongoing'}</span>
                          </div>
                          <div className={`item-status ${item.isCompleted ? '' : 'in-progress'}`}>
                            {item.isCompleted ? 'Completed' : 'In Progress'}
                          </div>
                          {expandedItems[item._id] ? (
                            <ChevronDownIcon className="h-5 w-5" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5" />
                          )}
                        </div>
                        {expandedItems[item._id] && (
                          <div className="user-details-category-item-details">
                            {item.description && <p>{item.description}</p>}
                            <div className="user-details-subitems-list">
                              {item.subItems.map((subItem) => (
                                <div key={subItem._id} className="user-details-subitem">
                                  <p>{subItem.description}</p>
                                  <div className="item-dates">
                                    <span>{formatSubItemDate(subItem.createdAt)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDetails;
