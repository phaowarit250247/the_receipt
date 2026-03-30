import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL } from '../endpoint/URL';
import {
  ArrowLeft,
  Loader2,
  Wrench,
  History as HistoryIcon,
  AlertCircle
} from 'lucide-react';

export default function RepairHistory() {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRepairs = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/repairs`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Map API response ให้เป็นรูปแบบที่ใช้งานได้
        if (res.data && res.data.repairs) {
          const repairsList = res.data.repairs.map(repair => ({
            id: repair.id,
            device_id: repair.device?.id,
            device_name: repair.device?.name,
            serial_number: repair.device?.serial_number,
            category: repair.device?.category,
            status: repair.status,
            issue_description: repair.issue_description,
            repair_date: repair.repair_date,
            return_date: repair.return_date,
            cost: repair.cost,
            technician_name: repair.technician_name
          }));
          setRepairs(repairsList);
        } else if (Array.isArray(res.data)) {
          setRepairs(res.data);
        }
      } catch (err) {
        console.error("Error fetching repairs", err);
        setError('ไม่สามารถโหลดข้อมูลประวัติการซ่อมได้');
      } finally {
        setLoading(false);
      }
    };
    fetchRepairs();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  // Filter repairs based on status
  const filteredRepairs = repairs ? (
    filterStatus === 'all' 
      ? repairs 
      : repairs.filter(r => {
          const status = r.status?.toLowerCase() || '';
          if (filterStatus === 'pending') return status.includes('pending');
          if (filterStatus === 'in_progress') return status.includes('progress');
          if (filterStatus === 'completed') return status.includes('completed');
          return false;
        })
  ) : [];

  // Count by status
  const statusCounts = repairs ? {
    all: repairs.length,
    pending: repairs.filter(r => (r.status?.toLowerCase() || '').includes('pending')).length,
    in_progress: repairs.filter(r => (r.status?.toLowerCase() || '').includes('progress')).length,
    completed: repairs.filter(r => (r.status?.toLowerCase() || '').includes('completed')).length
  } : { all: 0, pending: 0, in_progress: 0, completed: 0 };

  const statusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('pending')) return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    if (s.includes('progress')) return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (s.includes('completed')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ArrowLeft size={22} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">ประวัติการซ่อมอุปกรณ์</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">ดูประวัติการซ่อมทั้งหมด</p>
            </div>
          </div>

          {/* Summary Info */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 dark:from-indigo-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-bold">รวม</span> <span className="text-lg font-black text-slate-900 dark:text-white">{repairs.length}</span> รายการ | 
              <span className="font-bold ml-3">รอ</span> <span className="text-rose-600 dark:text-rose-400 font-bold">{statusCounts.pending}</span> | 
              <span className="font-bold ml-3">กำลัง</span> <span className="text-blue-600 dark:text-blue-400 font-bold">{statusCounts.in_progress}</span> | 
              <span className="font-bold ml-3">เสร็จ</span> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{statusCounts.completed}</span>
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-3 dark:bg-red-900/20 dark:border-red-700" role="alert">
            <AlertCircle size={24} className="text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-900 dark:text-red-300">เกิดข้อผิดพลาด</p>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Status Filter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'ทั้งหมด', value: statusCounts.all, key: 'all', color: 'from-slate-500 to-slate-600', icon: '📋' },
            { label: 'รอการซ่อม', value: statusCounts.pending, key: 'pending', color: 'from-amber-500 to-amber-600', icon: '⏳' },
            { label: 'กำลังซ่อม', value: statusCounts.in_progress, key: 'in_progress', color: 'from-blue-500 to-blue-600', icon: '🔧' },
            { label: 'เสร็จสิ้น', value: statusCounts.completed, key: 'completed', color: 'from-emerald-500 to-emerald-600', icon: '✓' }
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilterStatus(stat.key)}
              className={`p-4 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                filterStatus === stat.key
                  ? `bg-gradient-to-br ${stat.color} text-white border-transparent shadow-lg`
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className={`text-xs font-bold uppercase tracking-wider ${filterStatus === stat.key ? 'opacity-80' : 'text-slate-500 dark:text-slate-400'}`}>
                {stat.label}
              </p>
              <p className="text-2xl font-black mt-1">{stat.value}</p>
            </button>
          ))}
        </div>

        {/* Repairs Table */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* Table Header */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="p-3 bg-purple-600 rounded-xl">
              <HistoryIcon size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">ประวัติการซ่อม</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">แสดงรายการซ่อมทั้งหมดตั้งแต่เดิม</p>
            </div>
          </div>

          {filteredRepairs.length === 0 ? (
            <div className="p-16 text-center">
              <HistoryIcon size={56} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold mb-2">ไม่มีประวัติการซ่อม</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">ยังไม่มีรายการซ่อมที่ตรงกับตัวกรองนี้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest border-b-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">ลำดับ</th>
                    <th className="px-6 py-4">อุปกรณ์</th>
                    <th className="px-6 py-4">Serial Number</th>
                    <th className="px-6 py-4">ปัญหา</th>
                    <th className="px-6 py-4">ช่างซ่อม</th>
                    <th className="px-6 py-4">ค่าซ่อม</th>
                    <th className="px-6 py-4">สถานะ</th>
                    <th className="px-6 py-4">วันที่รับ</th>
                    <th className="px-6 py-4">วันที่ส่งคืน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredRepairs.map((repair, idx) => (
                    <tr key={repair.id} className="hover:bg-purple-50/30 dark:hover:bg-slate-700/50 transition group">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{repair.device_name || '-'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{repair.category || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                        {repair.serial_number || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                        <p className="truncate">{repair.issue_description || '-'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {repair.technician_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-rose-600 dark:text-rose-400">฿{parseInt(repair.cost || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusColor(repair.status)}`}>
                          {repair.status || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {repair.repair_date ? new Date(repair.repair_date).toLocaleDateString('th-TH') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {repair.return_date ? new Date(repair.return_date).toLocaleDateString('th-TH') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
