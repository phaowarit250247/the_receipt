import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL, ImgURL } from '../endpoint/URL';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Wrench,
  DollarSign,
  User,
  Cpu
} from 'lucide-react';

export default function RepairDetail() {
  const { deviceId, repairId } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    return_date: new Date().toISOString().split('T')[0],
    device_status: 'In-use'
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);

        // Fetch device info
        const deviceRes = await axios.get(`${BaseURL}/devices/${deviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDevice(deviceRes.data.data || deviceRes.data);

        // For now, assume repair data comes from the device
        if (deviceRes.data.data?.repairs) {
          const foundRepair = deviceRes.data.data.repairs.find(r => r.id === parseInt(repairId));
          setRepair(foundRepair);
        }
      } catch (err) {
        console.error("Error:", err);
        setMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลได้' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [deviceId, repairId]);

  const handleComplete = async (e) => {
    e.preventDefault();
    setCompleting(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${BaseURL}/devices/${deviceId}/repairs/${repairId}/complete`,
        {
          return_date: formData.return_date,
          device_status: formData.device_status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setMessage({ type: 'success', text: 'ยืนยันการซ่อมสำเร็จ' });
        setTimeout(() => navigate('/repairs'), 1500);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'เกิดข้อผิดพลาด'
      });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">รายละเอียดการซ่อม</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Repair #{repairId}</p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border-2 flex items-center gap-3 ${
            message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-semibold">{message.text}</span>
          </div>
        )}

        {/* Device Card */}
        {device && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-6"></div>
            <div className="p-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                {device.image_path ? (
                  <img src={`${ImgURL}/${device.image_path}`} alt={device.name} className="w-full h-full object-cover" />
                ) : (
                  <Cpu size={56} className="text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{device.name}</h2>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold">Serial:</span> {device.serial_number}</p>
                  <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold">หมวดหมู่:</span> {device.category}</p>
                  <p className="text-slate-600 dark:text-slate-400"><span className="font-semibold">สถานะ:</span> {device.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Repair Details Card */}
        {repair && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-6"></div>
            <div className="p-8 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Issue Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <Wrench size={16} className="inline mr-2" />
                    ปัญหา
                  </label>
                  <p className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 border-l-4 border-rose-500">
                    {repair.issue_description}
                  </p>
                </div>

                {/* Repair Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    วันที่รับซ่อม
                  </label>
                  <p className="text-slate-600 dark:text-slate-300 font-semibold">
                    {new Date(repair.repair_date).toLocaleDateString('th-TH')}
                  </p>
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    ค่าซ่อม
                  </label>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    ฿{repair.cost?.toLocaleString() || 0}
                  </p>
                </div>

                {/* Technician */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    <User size={16} className="inline mr-2" />
                    ช่างซ่อม
                  </label>
                  <p className="text-slate-600 dark:text-slate-300 font-semibold">
                    {repair.technician_name}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    สถานะการซ่อม
                  </label>
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    repair.status?.toLowerCase() === 'completed' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                    : repair.status?.toLowerCase() === 'in_progress' || repair.status?.toLowerCase() === 'in progress'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                    : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                  }`}>
                    {repair.status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Return Date Display */}
              {repair.return_date && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border-l-4 border-emerald-500">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    ✓ ส่งคืนแล้ว: {new Date(repair.return_date).toLocaleDateString('th-TH')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Complete Repair Form */}
        {repair && !repair.return_date && (
          <form onSubmit={handleComplete} className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">ยืนยันการซ่อมเสร็จสิ้น</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Return Date */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  วันที่ส่งคืน *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  value={formData.return_date}
                  onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                />
              </div>

              {/* Device Status */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  สถานะอุปกรณ์หลังซ่อม *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  value={formData.device_status}
                  onChange={(e) => setFormData({...formData, device_status: e.target.value})}
                >
                  <option value="In-use">ใช้งาน</option>
                  <option value="In-stock">คงคลัง</option>
                  <option value="Inactive">ไม่ใช้งาน</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={completing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/50 transition font-semibold flex items-center gap-2 disabled:opacity-70"
              >
                {completing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {completing ? 'กำลังบันทึก...' : 'ยืนยันเสร็จสิ้น'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
