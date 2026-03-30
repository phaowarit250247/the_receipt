import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL, ImgURL } from '../../endpoint/URL';
import { 
  ArrowLeft, Loader2, Cpu, Monitor, 
  ChevronRight, Tag, Info, Settings, ShieldCheck, History, Calendar, Plus, 
  AlertCircle, Clock, Link as LinkIcon, Unlink
} from 'lucide-react';

export default function ComponentParentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('components');
  const [availableChildren, setAvailableChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [repairHistories, setRepairHistories] = useState([]);

  // UX/UI: Clean Card Style
  const cardStyle = "bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm";
  const labelStyle = "text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1";

  const fetchRepairHistory = async (deviceId) => {
    if (!deviceId) {
      setRepairHistories([]);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${BaseURL}/repairs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let list = [];
      if (res.data && Array.isArray(res.data.repairs)) {
        list = res.data.repairs;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      }

      const filtered = list.filter((repair) => {
        const repairDeviceId = repair.device?.id || repair.device_id;
        return repairDeviceId && Number(repairDeviceId) === Number(deviceId);
      });

      setRepairHistories(filtered);
    } catch (err) {
      console.error('Error fetching repair history for device', err);
      setRepairHistories([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const [parentRes, devicesRes] = await Promise.all([
          axios.get(`${BaseURL}/devices/parents/${id}/children`, { headers: { Authorization: `Bearer ${token}` }}),
          axios.get(`${BaseURL}/devices`, { headers: { Authorization: `Bearer ${token}` }})
        ]);

        if (parentRes.data.success) {
          setData(parentRes.data);

          const currentDeviceId = parentRes.data.device?.id || parentRes.data.device_id || parentRes.data.parent?.id || parentRes.data.parent_id || id;
          await fetchRepairHistory(currentDeviceId);
        }

        const available = (devicesRes.data || []).filter(dev => !dev.parent_device_id);
        setAvailableChildren(available);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" size={40} />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">กำลังโหลดข้อมูลอุปกรณ์...</p>
      </div>
    </div>
  );
  
  if (!data) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-4 max-w-sm p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="text-rose-600 dark:text-rose-400" size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">ไม่พบข้อมูล</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">อุปกรณ์นี้อาจถูกลบไปแล้ว หรือคุณไม่มีสิทธิ์เข้าถึง</p>
        </div>
        <button onClick={() => navigate(-1)} className="w-full py-2.5 mt-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition">
          ย้อนกลับ
        </button>
      </div>
    </div>
  );

  const isTypeParent = data.type === 'parent';

  const header = {
    id: isTypeParent ? (data.parent_id ?? data.parent?.id) : (data.device_id ?? data.device?.id),
    name: isTypeParent ? (data.parent_name ?? data.parent?.name) : (data.device_name ?? data.device?.name),
    serial: isTypeParent ? (data.parent_serial ?? data.parent?.serial_number) : (data.device_serial ?? data.device?.serial_number),
    status: isTypeParent ? (data.parent_status ?? data.parent?.status) : (data.device_status ?? data.device?.status),
    image: isTypeParent ? (data.image_path ?? data.parent?.image_path) : (data.image_path ?? data.device_image_path ?? data.device?.image_path)
  };

  const parentInfo = data.parent ?? (isTypeParent ? {
    id: data.parent_id,
    name: data.parent_name,
    category: data.parent_category,
    serial_number: data.parent_serial,
    status: data.parent_status,
    image_path: data.image_path,
    created_at: data.parent?.created_at || data.created_at || data.parent_created_at
  } : null);

  const purchaseSource = data.purchase || data.parent?.purchase || data.receipt || data.parent?.receipt || data.order || data.parent?.order || {};
  const warrantyExpireDate = purchaseSource?.warranty_expire_date || data.warranty_expire_date || data.parent?.warranty_expire_date;
  const purchaseVendor = purchaseSource?.vendor_name || purchaseSource?.vendor || data.vendor_name || data.parent?.vendor_name || data.parent?.vendor;
  const purchasePoNumber = purchaseSource?.po_number || purchaseSource?.po || data.po_number || data.parent?.po_number || data.parent?.po;


  const refreshData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [parentRes, devicesRes] = await Promise.all([
        axios.get(`${BaseURL}/devices/parents/${id}/children`, { headers: { Authorization: `Bearer ${token}` }}),
        axios.get(`${BaseURL}/devices`, { headers: { Authorization: `Bearer ${token}` }})
      ]);
      if (parentRes.data.success) {
        setData(parentRes.data);
        const currentDeviceId = parentRes.data.device?.id || parentRes.data.device_id || parentRes.data.parent?.id || parentRes.data.parent_id || id;
        await fetchRepairHistory(currentDeviceId);
      }
      const available = (devicesRes.data || []).filter(dev => !dev.parent_device_id);
      setAvailableChildren(available);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttach = async () => {
    if (!selectedChildId) return;
    setActionLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${BaseURL}/devices/${id}/attach/${selectedChildId}`, null, { headers: { Authorization: `Bearer ${token}` }});
      setSelectedChildId('');
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDetach = async (childId) => {
    // UX: It's good practice to add a confirm dialog here in the future
    setActionLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${BaseURL}/devices/detach/${childId}`, null, { headers: { Authorization: `Bearer ${token}` }});
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const children = Array.isArray(data.children) ? data.children : [];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'In-use': return { badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50', dot: 'bg-emerald-500' };
      case 'In-repair': return { badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800/50', dot: 'bg-amber-500' };
      case 'Inactive': return { badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800/50', dot: 'bg-rose-500' };
      default: return { badge: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-500' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <ArrowLeft size={16} />
            </div>
            <span>ย้อนกลับ</span>
          </button>
          
          <button 
            onClick={() => {
              const displayType = data.user_preference?.display_type;
              if (displayType === 'main_device') {
                navigate(`/devices/parents/${header.id}/edit`);
              } else if (displayType === 'component') {
                navigate(`/devices/edit/${header.id}`);
              }
            }} 
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm"
          >
            <Settings size={16} />
            <span>แก้ไขข้อมูลอุปกรณ์</span>
          </button>
        </div>

        {/* Main Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              {header.image ? (
                <img src={`${ImgURL}/${header.image}`} alt={header.name} className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.style.display='none';}} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Cpu size={40} className="text-slate-300 dark:text-slate-600" />
                </div>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 ${getStatusStyle(header.status).dot}`} />
          </div>
          
          <div className="flex-1 z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-2.5 py-1 rounded-md">
                {isTypeParent ? 'Device Host' : 'Component'}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusStyle(header.status).badge}`}>
                {header.status || 'Unknown'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{header.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Tag size={14} />
              <p className="text-sm font-mono">{header.serial}</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Details */}
          <div className="space-y-6">
            
            {/* Identity Card */}
            <div className={cardStyle}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Monitor size={16} className="text-indigo-500" />
                ข้อมูลพื้นฐาน
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className={labelStyle}>ชื่ออ้างอิง (Parent)</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{parentInfo?.name || '-'}</p>
                </div>
                <div>
                  <p className={labelStyle}>หมวดหมู่</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{parentInfo?.category || 'ไม่ได้ระบุ'}</p>
                </div>
                
              </div>
            </div>

            {/* Warranty Card */}
            

            {/* Additional Info */}
            <div className={cardStyle}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Info size={16} className="text-indigo-500" />
                รายละเอียดเพิ่มเติม
              </h3>
              <div className="space-y-4">
                <div>
                  <p className={labelStyle}>รูปแบบการแสดงผล</p>
                  <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                    {data.user_preference?.display_type || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className={labelStyle}>คำอธิบาย</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {data.user_preference?.description || 'ไม่มีข้อมูลรายละเอียดที่บันทึกไว้'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Tabs & Content */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 overflow-hidden flex flex-col">
              
              {/* Tabs Header */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 px-2 pt-2 bg-slate-50 dark:bg-slate-800/50">
                <button
                  onClick={() => setActiveTab('components')}
                  className={`px-5 py-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'components' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <Cpu size={16} />
                  อุปกรณ์ย่อย
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'components' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {children.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-5 py-3.5 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  <History size={16} />
                  ประวัติการซ่อม
                  {repairHistories.length > 0 && (
                     <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'history' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {repairHistories.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 bg-white dark:bg-slate-800">
                
                {activeTab === 'components' && (
                  <div className="space-y-6">
                    {isTypeParent ? (
                      <>
                        {/* PARENT VIEW: Attach Interface */}
                        {availableChildren.length > 0 && (
                          <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mr-2">
                              <LinkIcon size={16} />
                              <span className="text-sm font-medium whitespace-nowrap">พ่วงอุปกรณ์</span>
                            </div>
                            <select
                              className="flex-1 w-full text-sm appearance-none px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                              value={selectedChildId}
                              onChange={(e) => setSelectedChildId(e.target.value)}
                            >
                              <option value="">-- เลือกอุปกรณ์ย่อยที่ว่างอยู่ --</option>
                              {availableChildren.map((dev) => (
                                <option key={dev.id} value={dev.id}>
                                  {dev.name} ({dev.serial_number})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={handleAttach}
                              disabled={!selectedChildId || actionLoading}
                              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition whitespace-nowrap flex items-center justify-center gap-2"
                            >
                              {actionLoading ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16}/>}
                              เพิ่มเข้าชุด
                            </button>
                          </div>
                        )}

                        {/* PARENT VIEW: Children List */}
                        {children.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {children.map((child) => {
                              const childImage = child.image_path || child.image || child.device_image_path || child.imagePath || child.attributes?.image_path;
                              const childStatus = child.status || child.status_label;
                              
                              return (
                                <div 
                                  key={child.id} 
                                  onClick={() => navigate(`/devices/${child.id}`)}
                                  className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4 relative overflow-hidden"
                                >
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                    {childImage ? (
                                      <img src={`${ImgURL}/${childImage}`} className="w-full h-full object-cover" alt={child.name} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.style.display='none';}} />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Cpu size={20} className="text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0 pr-8">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                      {child.name}
                                    </p>
                                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">{child.serial_number}</p>
                                    {childStatus && (
                                      <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusStyle(childStatus).badge}`}>
                                        {childStatus}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Detach Action */}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDetach(child.id); }}
                                    disabled={actionLoading}
                                    title="ถอดอุปกรณ์นี้ออก"
                                    className="absolute right-4 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                  >
                                    <Unlink size={18} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <Cpu size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <h4 className="text-slate-700 dark:text-slate-300 font-semibold mb-1">ยังไม่มีอุปกรณ์ย่อย</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">อุปกรณ์นี้ยังไม่ได้ถูกพ่วงเข้ากับ Component ใดๆ</p>
                            
                            {availableChildren.length === 0 && (
                              <button 
                                onClick={() => navigate('/devices/add', { state: { parent_device_id: header.id } })}
                                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold inline-flex items-center gap-2 transition"
                              >
                                <Plus size={16} /> ลงทะเบียนอุปกรณ์ย่อยใหม่
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      // COMPONENT VIEW: Show Parent Device Link
                      <div>
                        {parentInfo?.id || data.parent_id ? (
                          <div 
                            onClick={() => navigate(`/devices/parents/${parentInfo?.id || data.parent_id}`)}
                            className="group bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                {parentInfo?.image_path ? (
                                  <img src={`${ImgURL}/${parentInfo.image_path}`} className="w-full h-full object-cover" alt={parentInfo?.name} onError={(e)=>{e.currentTarget.onerror=null; e.currentTarget.style.display='none';}} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Monitor size={24} className="text-slate-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">อุปกรณ์หลักที่เชื่อมอยู่</p>
                                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {parentInfo?.name || `Main device #${parentInfo?.id || data.parent_id}`}
                                </p>
                                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{parentInfo?.serial_number}</p>
                              </div>
                              
                              <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <Unlink size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <h4 className="text-slate-700 dark:text-slate-300 font-semibold mb-1">ไม่มีอุปกรณ์หลักที่เชื่อมอยู่</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">อุปกรณ์นี้เป็นแบบอิสระ (Stand-alone)</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {repairHistories.length > 0 ? (
                      <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 md:ml-4 space-y-6 pb-4">
                        {repairHistories.map((r, idx) => (
                          <div key={r.id} className="relative pl-6 md:pl-8">
                            {/* Timeline dot */}
                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 bg-amber-500" />
                            
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                <div>
                                  <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Clock size={14} className="text-amber-600" />
                                    แจ้งซ่อมครั้งที่ {idx + 1}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">{new Date(r.repair_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                {r.status && (
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase border ${r.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800'}`}>
                                    {r.status === 'completed' ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                {r.issue_description || 'ไม่มีรายละเอียดปัญหา'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <History size={28} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h4 className="text-slate-700 dark:text-slate-300 font-semibold mb-1">ยังไม่มีประวัติการซ่อม</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">เมื่ออุปกรณ์นี้มีการแจ้งซ่อม ข้อมูลจะถูกบันทึกและแสดงผลที่นี่</p>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}