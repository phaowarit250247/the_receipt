import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL } from '../endpoint/URL';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search
} from 'lucide-react';

export default function AddRepair() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  
  const [formData, setFormData] = useState({
    device_id: '',
    device_name: '',
    issue_description: '',
    repair_date: new Date().toISOString().split('T')[0],
    cost: '',
    technician_name: ''
  });

  const [showDeviceList, setShowDeviceList] = useState(false);
  const [searchDevice, setSearchDevice] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ดึงรายชื่ออุปกรณ์ทั้งหมด
  useEffect(() => {
    const fetchDevices = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/devices`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const deviceList = res.data.data || res.data || [];
        setDevices(Array.isArray(deviceList) ? deviceList : []);
        setFilteredDevices(Array.isArray(deviceList) ? deviceList : []);
      } catch (err) {
        console.error("Error fetching devices", err);
      } finally {
        setLoadingDevices(false);
      }
    };
    fetchDevices();
  }, []);

  // ค้นหาอุปกรณ์
  const handleSearchDevice = (search) => {
    setSearchDevice(search);
    if (search.trim() === '') {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
        d.id?.toString().includes(search)
      );
      setFilteredDevices(filtered);
    }
  };

  // เลือกอุปกรณ์
  const handleSelectDevice = (device) => {
    setFormData({
      ...formData,
      device_id: device.id,
      device_name: device.name
    });
    setShowDeviceList(false);
    setSearchDevice('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.device_id) {
      setMessage({ type: 'error', text: 'กรุณาเลือกอุปกรณ์ก่อน' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    try {
      const payload = {
        issue_description: formData.issue_description,
        repair_date: formData.repair_date,
        return_date: null,
        cost: parseInt(formData.cost) || 0,
        technician_name: formData.technician_name
      };

      const response = await axios.post(
        `${BaseURL}/devices/${formData.device_id}/repairs`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 || response.status === 200) {
        setMessage({ type: 'success', text: 'บันทึกการซ่อมสำเร็จ' });
        setTimeout(() => navigate('/repairs'), 1500);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">เพิ่มรายการซ่อม</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">บันทึกข้อมูลการส่งซ่อมอุปกรณ์ใหม่</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-6"></div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Alert Message */}
            {message.text && (
              <div className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${
                message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
                : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-semibold">{message.text}</span>
              </div>
            )}

            {/* Device Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                อุปกรณ์ที่ต้องการซ่อม *
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDeviceList(!showDeviceList)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition text-left flex items-center justify-between"
                >
                  <span>{formData.device_name || 'เลือกอุปกรณ์...'}</span>
                  <Search size={18} className="text-slate-400" />
                </button>

                {showDeviceList && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                      <input
                        type="text"
                        placeholder="ค้นหาชื่ออุปกรณ์หรือ Serial..."
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                        value={searchDevice}
                        onChange={(e) => handleSearchDevice(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredDevices.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                          ไม่พบอุปกรณ์
                        </div>
                      ) : (
                        filteredDevices.map((device) => (
                          <button
                            key={device.id}
                            type="button"
                            onClick={() => handleSelectDevice(device)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">{device.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {device.id} | Serial: {device.serial_number}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                รายละเอียดปัญหา *
              </label>
              <textarea
                required
                rows="4"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition resize-none"
                value={formData.issue_description}
                onChange={(e) => setFormData({...formData, issue_description: e.target.value})}
                placeholder="อธิบายปัญหาที่พบกับอุปกรณ์..."
              />
            </div>

            {/* Grid 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Repair Date */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  วันที่รับซ่อม *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                  value={formData.repair_date}
                  onChange={(e) => setFormData({...formData, repair_date: e.target.value})}
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  ค่าซ่อม (บาท)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Technician Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                ชั่งซ่อม *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
                value={formData.technician_name}
                onChange={(e) => setFormData({...formData, technician_name: e.target.value})}
                placeholder="เช่น: สมชาย ช่างซ่อม"
              />
            </div>

            {/* Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving || !formData.device_id}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:shadow-lg hover:shadow-rose-500/50 transition font-semibold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
