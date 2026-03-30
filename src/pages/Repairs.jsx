import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL } from '../endpoint/URL';
import {
  ArrowLeft,
  Loader2,
  Wrench,
  Calendar,
  AlertCircle,
  Plus,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Repairs() {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  
  const [completeModal, setCompleteModal] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    return_date: new Date().toISOString().split('T')[0]
  });
  const [completeMessage, setCompleteMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchRepairs = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/repairs/in-repair`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Map devices dengan latest_repair ของแต่ละอุปกรณ์
        if (res.data && res.data.devices) {
          const repairsList = res.data.devices.map(device => ({
            id: device.latest_repair?.id,
            device_id: device.id,
            device_name: device.name,
            serial_number: device.serial_number,
            category: device.category,
            status: device.latest_repair?.status || device.status,
            issue_description: device.latest_repair?.issue_description,
            repair_date: device.latest_repair?.repair_date,
            return_date: device.latest_repair?.return_date,
            cost: device.latest_repair?.cost,
            technician_name: device.latest_repair?.technician_name,
            created_at: device.latest_repair?.created_at
          }));
          setRepairs(repairsList);
        } else if (Array.isArray(res.data)) {
          setRepairs(res.data);
        }
      } catch (err) {
        console.error("Error fetching repairs", err);
        setError('ไม่สามารถโหลดข้อมูลการซ่อมได้');
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

  const handleCompleteRepair = (repair) => {
    setCompleteModal(repair);
    setCompleteForm({
      return_date: new Date().toISOString().split('T')[0]
    });
    setCompleteMessage({ type: '', text: '' });
  };

  const handleSubmitComplete = async (e) => {
    e.preventDefault();
    setCompleting(true);
    setCompleteMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${BaseURL}/devices/${completeModal.device_id}/repairs/${completeModal.id}/complete`,
        {
          return_date: completeForm.return_date,
          device_status: 'In-use'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCompleteMessage({ type: 'success', text: 'ยืนยันการซ่อมเสร็จสิ้น' });
        
        // Refresh repairs list
        setTimeout(() => {
          setCompleteModal(null);
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error("Error:", err);
      setCompleteMessage({
        type: 'error',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยัน'
      });
    } finally {
      setCompleting(false);
    }
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
              <h1 className="text-4xl font-black text-slate-900 dark:text-white">การส่งซ่อมอุปกรณ์</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">ติดตามและจัดการรายการซ่อมลูกค้า</p>
            </div>
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
          <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/30 dark:to-sky-950/30 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-xl">
                <Wrench size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">รายการซ่อมอุปกรณ์</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">แสดงอุปกรณ์ที่กำลังอยู่ในระหว่างการซ่อม</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/repairs/history/all')}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-600/50 transition flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                📚 ดูประวัติ
              </button>
              <button
                onClick={() => navigate('/repairs/add')}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-indigo-600/50 transition flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Plus size={20} /> เพิ่มรายการ
              </button>
            </div>
          </div>

          {filteredRepairs.length === 0 ? (
            <div className="p-16 text-center">
              <Wrench size={56} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold mb-2">ไม่มีรายการซ่อม</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">กดปุ่ม "เพิ่มรายการ" เพื่อบันทึกอุปกรณ์ใหม่</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-widest border-b-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">ลำดับ</th>
                    <th className="px-6 py-4">อุปกรณ์</th>
                    <th className="px-6 py-4">Serial Number</th>
                    <th className="px-6 py-4">หมวดหมู่</th>
                    <th className="px-6 py-4">สถานะ</th>
                    <th className="px-6 py-4">ช่างซ่อม</th>
                    <th className="px-6 py-4">ค่าซ่อม</th>
                    <th className="px-6 py-4 text-center">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredRepairs.map((repair, idx) => (
                    <tr key={repair.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-700/50 transition group">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/30 transition">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">{repair.device_name || '-'}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-400">
                        {repair.serial_number || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
                          {repair.category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusColor(repair.status)}`}>
                          {repair.status || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <p className="font-medium">{repair.technician_name || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-rose-600 dark:text-rose-400">฿{parseInt(repair.cost || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center flex-wrap">
                          <button
                            onClick={() => navigate(`/repairs/${repair.device_id}/${repair.id}`)}
                            className="px-3 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 font-bold text-xs transition hover:scale-105 active:scale-95"
                          >
                            ดูรายละเอียด
                          </button>
                          {!repair.return_date && (
                            <button
                              onClick={() => handleCompleteRepair(repair)}
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/40 transition font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95"
                            >
                              <CheckCircle2 size={16} /> ยืนยันเสร็จ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Complete Repair Modal */}
      {completeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-6 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">ยืนยันการซ่อมเสร็จสิ้น</h3>
                <p className="text-emerald-100 text-xs mt-1">บันทึกวันที่ส่งคืนและอัปเดตสถานะ</p>
              </div>
              <button
                onClick={() => setCompleteModal(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmitComplete} className="p-6 space-y-5">

              {completeMessage.text && (
                <div className={`p-4 rounded-xl border-2 border-l-4 flex items-start gap-3 ${
                  completeMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400'
                  : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
                }`}>
                  {completeMessage.type === 'success' ? (
                    <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold text-sm">{completeMessage.type === 'success' ? 'สำเร็จ' : 'เกิดข้อผิดพลาด'}</p>
                    <p className="text-xs mt-0.5">{completeMessage.text}</p>
                  </div>
                </div>
              )}

              {/* Device Info Card */}
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/30 dark:to-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">ข้อมูลอุปกรณ์</p>
                <p className="font-bold text-slate-900 dark:text-white text-base">{completeModal.device_name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Serial: <span className="font-mono">{completeModal.serial_number}</span></p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">ปัญหา: {completeModal.issue_description}</p>
              </div>

              {/* Return Date Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  📅 วันที่ส่งคืน *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-bold"
                  value={completeForm.return_date}
                  onChange={(e) => setCompleteForm({...completeForm, return_date: e.target.value})}
                />
              </div>

              {/* Device Status Info */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  ✓ สถานะอุปกรณ์หลังซ่อม
                </label>
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">ใช้งานได้ปกติ</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">อุปกรณ์จะเปลี่ยนเป็นสถานะ "ใช้งาน"</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setCompleteModal(null)}
                  disabled={completing}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-bold text-sm disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={completing}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/50 transition font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95"
                >
                  {completing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      ยืนยันและบันทึก
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
