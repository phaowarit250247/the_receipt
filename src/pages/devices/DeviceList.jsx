import { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseURL, ImgURL } from '../../endpoint/URL';
import {
    Search,
    Loader2,
    Monitor,
    Cpu,
    Calendar,
    ExternalLink,
    ChevronRight,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevices = async () => {
            const token = localStorage.getItem('token');
            try {
                const [parentsRes, componentsRes] = await Promise.all([
                    axios.get(`${BaseURL}/devices/parents`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${BaseURL}/devices`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const parents = parentsRes.data || [];
                const components = componentsRes.data || [];

                // mark type for clarity and combine
                const normalizedParents = parents.map(p => ({ ...p, device_type: 'parent' }));
                const normalizedComponents = components.map(c => ({ ...c, device_type: 'component' }));

                setDevices([...normalizedParents, ...normalizedComponents]);
            } catch (err) {
                console.error("Fetch devices error:", err);
                setDevices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchDevices();
    }, []);

    // ฟังก์ชันกรองข้อมูลในหน้าจอ (Client-side Search)
    const filteredDevices = devices.filter(d =>
        (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">รายการอุปกรณ์ไอที</h1>
                        <p className="text-slate-500 dark:text-slate-400">จัดการและตรวจสอบสถานะอุปกรณ์ทั้งหมดในระบบ</p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อหรือ Serial..."
                            className="pl-10 pr-4 py-2.5 w-full md:w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">อุปกรณ์ / Serial</th>
                                    <th className="px-6 py-4">หมวดหมู่</th>
                                    <th className="px-6 py-4">สถานะ</th>
                                    <th className="px-6 py-4">การจัดซื้อ / ประกัน</th>
                                    <th className="px-6 py-4">ติดตั้งใน</th>
                                    
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredDevices.map((device) => (
                                    <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                                    {device.image_path ? (
                                                        <img src={`${ImgURL}/${device.image_path}`} alt={device.name} className="w-10 h-10 object-cover" onError={(e)=>{e.target.onerror=null;e.target.src='https://via.placeholder.com/40'}} />
                                                    ) : (
                                                        (device.device_type === 'parent' ? <Monitor size={20} /> : <Cpu size={20} />)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white leading-tight">{device.name}</p>
                                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{device.serial_number}</p>
                                                
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">{device.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const status = device.status || '';
                                                let classes = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ';
                                                if (status === 'In-use') classes += 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                                                else if (status === 'In-repair') classes += 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                                                else if (status === 'Inactive') classes += 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
                                                else classes += 'bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-300';
                                                return <span className={classes}>{status}</span>;
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs space-y-1">
                                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                        <Calendar size={14} />
                                                        {device.purchase?.purchase_date ? new Date(device.purchase.purchase_date).toLocaleDateString('th-TH') : '-'}
                                                </div>
                                                <div className="text-rose-500 font-medium">
                                                    Exp: {device.purchase?.warranty_expire_date ? new Date(device.purchase.warranty_expire_date).toLocaleDateString('th-TH') : '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {device.parent_device ? (
                                                <div className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md w-fit">
                                                    {device.parent_device.name}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Stand-alone</span>
                                            )}
                                        </td>
                                        
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredDevices.length === 0 && (
                        <div className="p-20 text-center text-slate-500">
                            <p>ไม่พบข้อมูลอุปกรณ์ที่ค้นหา</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}