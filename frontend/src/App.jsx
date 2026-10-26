import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-01-01');

  useEffect(() => {
    axios.get('https://wind-power-api.onrender.com/api/wind-data')
      .then(response => {
        if (response.data.status === "success") {
          setDashboardData(response.data);
        } else {
          setError("Failed to fetch data: " + response.data.message);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Backend server is not running or unreachable.");
        setLoading(false);
      });
  }, []);

  const formatTimeAxis = (timeStr) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  // Custom Premium Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-2xl">
          <p className="text-gray-300 text-sm mb-2 pb-2 border-b border-gray-700 font-medium">
            Time: <span className="text-white font-bold">{label ? formatTimeAxis(label) : ''}</span>
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <p className="text-sm font-medium text-white">
                {entry.name}: <span className="font-bold">{Number(entry.value).toLocaleString()} MW</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-sm border border-red-100 max-w-lg text-center">
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p>{error}</p>
      </div>
    </div>
  );
  
  if (!dashboardData) return null;

  const uniqueDates = [...new Set(dashboardData.data.map(item => item.startTime.split('T')[0]))];
  const filteredData = dashboardData.data.filter(item => item.startTime.startsWith(selectedDate));

  const totalActualForDay = filteredData.reduce((sum, item) => sum + (item.actual_generation || 0), 0).toFixed(2);
  const totalForecastForDay = filteredData.reduce((sum, item) => sum + (item.forecast_generation || 0), 0).toFixed(2);
  const totalErrorForDay = filteredData.reduce((sum, item) => sum + (item.error_mw || 0), 0).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Wind Power <span className="text-indigo-600">Intelligence</span>
            </h1>
            <p className="text-slate-500 mt-1">Elexon BMRS Real-time Day-Ahead Forecasting Analysis</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700">Select Date:</label>
            <select 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-300 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {uniqueDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </header>
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider mb-1">Intervals</h3>
            <p className="text-2xl font-bold text-slate-800">{filteredData.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:border-indigo-100 cursor-default">
            <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Actual (MW)</p>
            <h3 className="text-3xl font-bold text-indigo-600">{Number(totalActualForDay).toLocaleString()}</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:border-emerald-100 cursor-default">
            <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">Forecast (MW)</h3>
            <p className="text-3xl font-bold text-emerald-500">{Number(totalForecastForDay).toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:border-amber-100 cursor-default">
            <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">Error (MW)</h3>
            <p className="text-3xl font-bold text-amber-500">{Number(totalErrorForDay).toLocaleString()}</p>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 flex flex-col justify-center text-white col-span-2 lg:col-span-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="text-slate-400 font-semibold text-xs uppercase tracking-wider mb-1">Status</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-xl font-bold">Live Synced</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Generation: Actual vs Forecast ({selectedDate})</h2>
              <p className="text-sm text-slate-500">Comparative trend analysis across settlement periods</p>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="startTime" 
                    tickFormatter={formatTimeAxis}
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                    minTickGap={30}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  <Line 
                    type="monotone" 
                    name="Actual Generation"
                    dataKey="actual_generation" 
                    stroke="#4f46e5" 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} 
                  />
                  <Line 
                    type="monotone" 
                    name="Forecasted Generation"
                    dataKey="forecast_generation" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    strokeDasharray="5 5" 
                    dot={false} 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Forecast Error Variance ({selectedDate})</h2>
              <p className="text-sm text-slate-500">Positive values indicate under-forecasting; negative values indicate over-forecasting</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="startTime" tickFormatter={formatTimeAxis} minTickGap={30} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="error_mw" fill="#f59e0b" name="Error (MW)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;