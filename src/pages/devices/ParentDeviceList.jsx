import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BaseURL } from '../../endpoint/URL';
import { 
  Monitor, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Cpu, 
  Calendar, 
  Package, 
  Search,
  PlusCircle,
  ArrowLeft
} from 'lucide-react';

export default function ParentDeviceList() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // เก็บ ID ของแถวที่กางออก
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParents = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/devices/parents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParents(res.data);
      } catch (err) {
        console.error("Fetch parents error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParents();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-slate-900 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:text-indigo-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Parent Devices</h1>
              <p className="text-slate-500 font-medium">จัดการรายการเครื่องคอมพิวเตอร์และเซิร์ฟเวอร์หลัก</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="ค้นหาเครื่องหลัก..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border-none rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate('/devices/add-parent')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <PlusCircle size={18} /> Add Parent
            </button>
          </div>
        </div>

        {/* Device List */}
        <div className="space-y-4">
          {filteredParents.map((parent) => (
            <div key={parent.id} className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
              {/* Parent Row */}
              <div 
                className={`p-6 md:p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors ${expandedId === parent.id ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                onClick={() => toggleExpand(parent.id)}
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-indigo-200">
                    <Monitor size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{parent.name}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{parent.serial_number}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">สถานะ</p>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-xs font-bold">
                      {parent.status}
                    </span>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">อุปกรณ์ย่อย</p>
                    <p className="text-sm font-black dark:text-white">{parent.child_devices.length} ชิ้น</p>
                  </div>
                  <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                    {expandedId === parent.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {/* Child Devices (Expandable Section) */}
              {expandedId === parent.id && (
                <div className="px-8 pb-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                    {parent.child_devices.length > 0 ? (
                      parent.child_devices.map((child) => (
                        <div key={child.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-800 text-indigo-500 rounded-lg shadow-sm">
                              <Cpu size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold dark:text-white">{child.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{child.serial_number}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-black bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700 text-slate-500">
                            {child.category}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="md:col-span-2 py-6 text-center text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        ไม่มีอุปกรณ์ย่อยติดตั้งภายในเครื่องนี้
                      </div>
                    )}
                  </div>
                  
                  {/* View Details Button */}
                  <div className="mt-6 flex justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/devices/parents/${parent.id}`);
                      }}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-widest"
                    >
                      View Full Details <Package size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}