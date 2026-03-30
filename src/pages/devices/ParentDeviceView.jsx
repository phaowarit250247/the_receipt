import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL, ImgURL } from '../../endpoint/URL';
import { 
  ArrowLeft, Loader2, Monitor, Cpu, ShieldCheck, 
  History, Laptop, LayoutGrid, Tag, Calendar, 
  CreditCard, Wrench, ChevronRight, Plus
} from 'lucide-react';

export default function ParentDeviceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  // สไตล์ส่วนกลาง
  const cardStyle = "bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700";
  const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1";

  useEffect(() => {
    const fetchParentDetail = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const res = await axios.get(`${BaseURL}/devices/parents/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDevice(res.data);
      } catch (err) {
        console.error("Error fetching parent device:", err);
        setDevice(null);
      } finally {
        setLoading(false);
      }
    };
    fetchParentDetail();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  if (!device) return <div className="p-10 text-center font-bold dark:text-white">ไม่พบข้อมูลอุปกรณ์หลัก</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-slate-900 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between mb-10">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-bold transition-all cursor-pointer"
          >
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm group-hover:shadow-md transition-all text-slate-400">
              <ArrowLeft size={20} />
            </div>
            ย้อนกลับ
          </button>
          
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-black dark:text-white hover:bg-slate-50 transition cursor-pointer">
              แก้ไขเครื่องหลัก
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Device Identity (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`${cardStyle} text-center`}>
              <div className="w-24 h-24 rounded-[2rem] overflow-hidden mx-auto mb-4 shadow-xl">
                {device.image_path ? (
                  <img src={`${ImgURL}/${device.image_path}`} alt={device.name} className="w-24 h-24 object-cover rounded-[2rem]" />
                ) : (
                  <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center">
                    <Monitor size={48} />
                  </div>
                )}
              </div>
              
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{device.name}</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{device.category}</p>

              <div className="mt-4">
                {(() => {
                  const status = device.status || '';
                  let classes = 'px-4 py-1 rounded-lg text-xs font-black uppercase ';
                  if (status === 'In-use') classes += 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
                  else if (status === 'In-repair') classes += 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                  else if (status === 'Inactive') classes += 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
                  else classes += 'bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-300';
                  return <span className={classes}>{status}</span>;
                })()}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-700 space-y-5 text-left">
                <div className="flex items-center gap-3">
                  <Tag className="text-slate-300" size={18} />
                  <div>
                    <p className={labelStyle}>Service Tag / SN</p>
                    <p className="text-sm font-black dark:text-white">{device.serial_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="text-slate-300" size={18} />
                  <div>
                    <p className={labelStyle}>วันที่เริ่มใช้งาน</p>
                      <p className="text-sm font-black dark:text-white">{device.created_at ? new Date(device.created_at).toLocaleDateString('th-TH') : '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Summary Mini Card */}
            <div className={`${cardStyle} !bg-indigo-900 text-white border-none`}>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/10 rounded-2xl"><ShieldCheck size={24}/></div>
                <div className="text-right">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Warranty Expire</p>
                  <p className="text-lg font-black text-rose-400">
                    {device.purchase?.warranty_expire_date ? new Date(device.purchase.warranty_expire_date).toLocaleDateString('th-TH') : '-'}
                  </p>
                </div>
              </div>
              <p className="text-xs opacity-70 mb-1">Vendor: {device.purchase?.vendor_name || '-'}</p>
              <p className="text-xs font-bold uppercase tracking-widest">PO: {device.purchase?.po_number || '-'}</p>
            </div>
          </div>

          {/* Right Column: Children & History (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Child Devices Section (The "Components") */}
            <div className={cardStyle}>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 dark:border-slate-700">
                <h2 className="text-xl font-black flex items-center gap-3 dark:text-white">
                  <LayoutGrid className="text-indigo-500" size={24} /> อุปกรณ์ภายในเครื่อง
                </h2>
                <button className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl hover:bg-indigo-100 transition cursor-pointer">
                  <Plus size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {device.child_devices && device.child_devices.length > 0 ? (
                  device.child_devices.map((child) => (
                    <div 
                      key={child.id} 
                      onClick={() => navigate(`/devices/${child.id}`)}
                      className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-slate-800 text-indigo-500 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                          <Cpu size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700 dark:text-white">{child.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{child.serial_number}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2rem]">
                    <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">ไม่มีอุปกรณ์ย่อยติดตั้งอยู่</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Repair History */}
            <div className={cardStyle}>
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white">
                <History className="text-indigo-500" size={24} /> ประวัติการซ่อมบำรุง
              </h2>
              <div className="space-y-6">
                {device.repair_histories && device.repair_histories.length > 0 ? (
                  device.repair_histories.map((repair) => (
                    <div key={repair.id} className="flex gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <div className="hidden sm:block">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
                          <Wrench size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-slate-900 dark:text-white leading-none">แจ้งซ่อม #{repair.id}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(repair.repair_date).toLocaleDateString('th-TH')}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">"{repair.issue_description}"</p>
                        <div className="flex gap-6 items-center">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <CreditCard size={14}/> {parseFloat(repair.cost).toLocaleString()} ฿
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-slate-400 text-sm font-bold uppercase tracking-widest opacity-50">ไม่มีประวัติการซ่อม</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}