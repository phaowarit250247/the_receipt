import { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseURL } from '../endpoint/URL';
import {
  Loader2,
  Package,
  AlertTriangle,
  Wrench,
  ShoppingCart,
  Cpu,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));

      try {
        const res = await axios.get(`${BaseURL}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // เข้าถึงข้อมูลตามโครงสร้าง JSON: res.data.data
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching summary", err);
        setError('ไม่สามารถโหลดข้อมูลจากเซิร์ฟเวอร์ได้');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  const { devices, purchases, repairs, warranty } = dashboardData;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            สวัสดี {user?.name || 'Admin'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">สรุปข้อมูลระบบประจำวันที่ {new Date().toLocaleDateString('th-TH')}</p>
        </header>

        {/* Top Stats - 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="cursor-pointer" onClick={() => navigate('/devices/search')}>
            <StatCard
              title="อุปกรณ์ทั้งหมด"
              value={devices?.total || 0}
              icon={<Package />}
              color="bg-blue-500"
            />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/purchases')}>
            <StatCard
              title="ยอดจัดซื้อรวม"
              value={purchases?.total_amount?.toLocaleString() || 0}
              suffix="฿"
              icon={<ShoppingCart />}
              color="bg-emerald-500"
            />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/repairs')}>
            <StatCard title="ส่งซ่อม" value={repairs.this_month.count} icon={<Wrench />} color="bg-rose-500" />
          </div>
          <StatCard title="ประกันหมด/เตือน" value={warranty.expired_count + warranty.warning_count} icon={<AlertTriangle />} color="bg-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Category Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                <Cpu size={20} className="text-indigo-500" /> แยกตามหมวดหมู่
              </h2>
              <div className="space-y-4">
                {devices.by_category.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">{item.category}</span>
                    <span className="font-semibold bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-sm dark:text-white">
                      {item.count} ชิ้น
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold mb-2 dark:text-white">ผู้จำหน่ายสูงสุด</h2>
              {purchases.top_vendors.map((vendor, idx) => (
                <div key={idx} className="mt-2 text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-300">{vendor.vendor_name}</p>
                  <p className="text-indigo-600 font-bold">{vendor.total_spent.toLocaleString()} ฿</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Recent/Top Devices Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                  <History size={20} className="text-indigo-500" /> รายการอุปกรณ์
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">ชื่ออุปกรณ์</th>
                      <th className="px-6 py-4">Serial No.</th>
                      <th className="px-6 py-4">หมวดหมู่</th>
                      <th className="px-6 py-4 text-center">ซ่อม (ครั้ง)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {repairs.top_devices.map((device) => (
                      <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900 dark:text-white">{device.name}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {device.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{device.serial_number}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{device.category}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold ${device.repair_count > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {device.repair_count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-component สำหรับ Stat Card
function StatCard({ title, value, icon, color, suffix = "" }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg shadow-current/20`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {value} <span className="text-sm font-normal">{suffix}</span>
        </p>
      </div>
    </div>
  );
}