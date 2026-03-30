import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BaseURL, ImgURL } from '../../endpoint/URL';
import { 
  Search, Loader2, Monitor, Cpu, 
  Plus,
  ChevronRight, Box, RefreshCw, Layers, Image as ImageIcon
} from 'lucide-react';

export default function DeviceSearch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllDevices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [searchRes, parentsRes, componentsRes] = await Promise.all([
        axios.get(`${BaseURL}/devices/search`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BaseURL}/devices/parents`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BaseURL}/devices`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const searchData = searchRes.data;
      const parents = parentsRes.data?.data || [];
      const components = componentsRes.data || [];

      // mark type for clarity
      const normalizedParents = parents.map(p => ({ ...p, device_type: 'parent' }));
      const normalizedComponents = components.map(c => ({ ...c, device_type: 'component' }));

      // Combine all data
      const allParents = [...(searchData.results?.parents || []), ...normalizedParents];
      const allComponents = [...(searchData.results?.components || []), ...normalizedComponents];

      // Deduplicate by id
      const uniqueParents = allParents.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id || t.parent_id === item.id)
      );
      const uniqueComponents = allComponents.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id || t.device_id === item.id)
      );

      setData({
        results: {
          parents: uniqueParents,
          components: uniqueComponents
        }
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDevices();
  }, []);

  const normalizeItem = (item) => {
    return {
      ...item,
      id: item.id ?? item.device_id ?? item.parent_id,
      name: item.name ?? item.device_name ?? item.parent_name ?? '',
      serial_number: item.serial_number ?? item.device_serial ?? item.parent_serial ?? '',
      category: item.category ?? item.device_category ?? item.parent_category ?? '',
      status: item.status ?? item.device_status ?? item.parent_status ?? '',
      image_path: item.image_path ?? item.parent?.image_path ?? item.device_image_path ?? '',
      device_type: item.device_type ?? (item.parent_id ? 'parent' : 'component'),
    };
  };

  const getFilteredResults = () => {
    if (!data) return [];
    let combined = [];
    if (activeTab === 'all') {
      combined = [...(data.results?.parents || []), ...(data.results?.components || [])];
    } else if (activeTab === 'parents') {
      combined = data.results?.parents || [];
    } else if (activeTab === 'components') {
      combined = data.results?.components || [];
    }

    const normalized = combined.map(normalizeItem);

    return normalized.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const finalResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Inventory Explorer</h1>
            <p className="text-slate-500 font-medium">จัดการอุปกรณ์ทั้งหมดในระบบเดียว</p>
          </div>
          

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="ค้นหาชื่อหรือซีเรียล..."
                className="pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-none shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 dark:text-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchAllDevices}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={() => navigate('/devices/add-parent')} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition shadow-sm"
            >
              <Plus size={16} /> เพิ่มอุปกรณ์หลัก
            </button>
            <button 
              onClick={() => navigate('/devices/add')} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-medium transition shadow-sm"
            >
              <Plus size={16} /> เพิ่มอุปกรณ์ย่อย
            </button>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[1.5rem] w-fit mb-8 border border-white dark:border-slate-700">
          <TabButton 
            active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')} 
            label="All" 
            count={data ? (data.results?.parents?.length + data.results?.components?.length) : 0} 
            icon={<Layers size={14} />}
          />
          <TabButton 
            active={activeTab === 'parents'} 
            onClick={() => setActiveTab('parents')} 
            label="Parents" 
            count={data?.results?.parents?.length || 0} 
            icon={<Monitor size={14} />}
          />
          <TabButton 
            active={activeTab === 'components'} 
            onClick={() => setActiveTab('components')} 
            label="Components" 
            count={data?.results?.components?.length || 0} 
            icon={<Cpu size={14} />}
          />
        </div>

        {/* Grid Results */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalResults.map(item => (
              <DeviceCard 
                key={`${item.device_type}-${item.id}`} 
                item={item} 
                onClick={() => navigate(`/devices/component-parent/${item.id}`)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count, icon }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.2rem] text-sm font-black transition-all cursor-pointer ${
        active 
        ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md scale-105' 
        : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon} {label}
      <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${active ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 dark:bg-slate-900 text-slate-400'}`}>
        {count}
      </span>
    </button>
  );
}

function DeviceCard({ item, onClick }) {
  const isParent = item.device_type === 'parent';

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'In-stock':
        return 'bg-emerald-100 text-emerald-600';
      case 'In-use':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      case 'In-repair':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case 'Inactive':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-400';
    }
  };

  // สร้าง URL รูปภาพ (สมมติว่าเก็บไว้ที่ storage ของ backend)
  // ปรับแก้ URL ตามโครงสร้างโฟลเดอร์จริงของคุณ เช่น `${BaseURL}/storage/${item.image_path}`
  const imageUrl = item.image_path ? `${ImgURL}/${item.image_path}` : null;

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* ส่วนแสดงรูปภาพหรือไอคอน */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; // fallback หากโหลดรูปไม่ขึ้น
            }}
          />
        ) : (
          <div className={`p-6 rounded-3xl ${isParent ? 'bg-indigo-600/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-500'} transition-colors duration-500`}>
             {isParent ? <Monitor size={48} /> : <Cpu size={48} />}
          </div>
        )}
        
        
        {/* Badge ประเภทอุปกรณ์ที่มุมซ้ายบน */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-xl text-[10px] font-black text-white shadow-lg ${isParent ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
          {isParent ? 'PARENT' : 'COMPONENT'}
        </div>
      </div>

      <div className="p-7">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {item.category}
          </span>
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${getStatusBadgeClass(item.status)}`}>
            {item.status || 'Unknown'}
          </span>
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{item.serial_number}</p>

        <div className="pt-5 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
          <div className="text-[10px] font-bold text-slate-300 italic uppercase">
            ID: #{item.id}
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-tighter">
            Details <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}