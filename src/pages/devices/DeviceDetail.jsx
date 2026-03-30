import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL, ImgURL } from '../../endpoint/URL';
import { 
  ArrowLeft, 
  Loader2, 
  Cpu, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Wrench, 
  History,
  Info
} from 'lucide-react';


export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  const parentDevice = device?.parent_device || device?.parent || (device && device.parent_device_id ? { id: device.parent_device_id, name: device.parent_device_name || 'อุปกรณ์หลัก' } : null);

  useEffect(() => {
    const fetchDeviceDetail = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/devices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDevice(res.data);
      } catch (err) {
        console.error("Error fetching device detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceDetail();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  if (!device) return <div className="p-8 text-center dark:text-white">ไม่พบข้อมูลอุปกรณ์</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            <ArrowLeft size={20} />
            <span>ย้อนกลับ</span>
          </button>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/devices/edit/${id}`)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium dark:text-white hover:bg-slate-50 transition">
              แก้ไขข้อมูล
            </button>
            
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Device Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4">
                {device.image_path ? (
                  <img src={`${ImgURL}/${device.image_path}`} alt={device.name} className="w-20 h-20 object-cover rounded-2xl" />
                ) : (
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                    <Cpu size={40} />
                  </div>
                )}
              </div>
              
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{device.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{device.category}</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                device.status === 'In-stock' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-amber-100 text-amber-700'
              }`}>
                {device.status}
              </span>
              
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-left space-y-4">
                <DetailRow label="Serial Number" value={device.serial_number} />
                <DetailRow label="วันที่เพิ่มเข้าระบบ" value={new Date(device.created_at).toLocaleDateString('th-TH')} />
                <DetailRow
                  label="ติดตั้งที่"
                  value={
                    parentDevice ? (
                      <button
                        onClick={() => navigate(`/devices/${parentDevice.id}`)}
                        className="text-indigo-600 dark:text-indigo-300 font-semibold hover:underline"
                      >
                        {parentDevice.name || `Main device #${parentDevice.id}`}
                      </button>
                    ) : (
                      'อิสระ (Stand-alone)'
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info & History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Purchase & Warranty Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 dark:text-white">
                <ShieldCheck className="text-indigo-500" /> ข้อมูลการจัดซื้อและประกัน
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase">เลขที่ใบสั่งซื้อ (PO)</span>
                    <span className="font-semibold dark:text-white">{device.purchase.po_number}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase">ผู้จัดจำหน่าย</span>
                    <span className="font-semibold dark:text-white">{device.purchase.vendor_name}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase">วันที่ซื้อ</span>
                    <span className="font-semibold dark:text-white">{new Date(device.purchase.purchase_date).toLocaleDateString('th-TH')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase">วันที่หมดประกัน</span>
                    <span className="font-semibold text-rose-500">{new Date(device.purchase.warranty_expire_date).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">หมายเหตุการสั่งซื้อ</span>
                <p className="text-sm dark:text-slate-300">{device.purchase.notes || '-'}</p>
              </div>
            </div>

            {/* Repair History Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-6 dark:text-white">
                <History className="text-indigo-500" /> ประวัติการส่งซ่อม
              </h2>
              {device.repair_histories.length > 0 ? (
                <div className="space-y-4">
                  {/* วนลูปประวัติการซ่อมตรงนี้ถ้ามีข้อมูล */}
                </div>
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl">
                  <div className="text-slate-300 dark:text-slate-600 mb-2 flex justify-center"><Wrench size={40} /></div>
                  <p className="text-slate-500 dark:text-slate-400">ยังไม่เคยมีประวัติการส่งซ่อม</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component สำหรับแถวข้อมูลเล็กๆ
function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{label}</span>
      <span className="text-sm font-medium dark:text-slate-200">{value}</span>
    </div>
  );
}