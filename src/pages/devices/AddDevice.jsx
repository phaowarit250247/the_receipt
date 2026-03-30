import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL } from '../../endpoint/URL';
import { 
  ArrowLeft, PlusCircle, Loader2, AlertCircle, 
  CheckCircle2, Cpu, Tag, HardDrive, Activity, ShoppingCart, Image as ImageIcon 
} from 'lucide-react';


export default function AddDevice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serial_number: '',
    name: '',
    category: 'RAM',
    status: 'In-use',
    purchase_id: '',
    parent_device_id: '',
    image: null
  });

  const [purchases, setPurchases] = useState([]);
  const [parentDevices, setParentDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const labelStyle = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setFormData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [purchasesRes, devicesRes] = await Promise.all([
          axios.get(`${BaseURL}/purchases`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${BaseURL}/devices/parents`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setPurchases(purchasesRes.data);

        const allParentDevices = devicesRes.data || [];
        setParentDevices(allParentDevices);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');
    try {
      const payload = new FormData();
      payload.append('serial_number', formData.serial_number);
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('status', formData.status);
      if (formData.purchase_id) payload.append('purchase_id', formData.purchase_id);
      if (formData.parent_device_id) payload.append('parent_device_id', formData.parent_device_id);
      if (formData.image) payload.append('image', formData.image);

      const response = await axios.post(`${BaseURL}/devices`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201 || response.status === 200) {
        setMessage({ type: 'success', text: 'เพิ่มอุปกรณ์ย่อยเรียบร้อยแล้ว' });
        setTimeout(() => navigate('/devices'), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-indigo-50/50 dark:from-slate-950 dark:to-slate-900 p-4 md:p-10">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-all font-medium"
        >
          <div className="p-2 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-all">
            <ArrowLeft size={18} />
          </div>
          ย้อนกลับ
        </button>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 dark:shadow-none border border-white dark:border-slate-700 overflow-hidden">
          
          {/* Header Section */}
          <div className="relative bg-indigo-600 p-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-5">
              <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl shadow-inner">
                <Cpu size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">New Child Device</h1>
                <p className="text-indigo-100 text-sm opacity-80 font-medium">ลงทะเบียนอุปกรณ์ย่อยเข้าสู่ระบบ</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            
            {/* Status Feedback */}
            {message.text && (
              <div className={`flex items-center gap-3 p-4 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
                message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                : 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                <p className="text-sm font-bold">{message.text}</p>
              </div>
            )}

            {/* Section 1: General Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                <Tag size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">ข้อมูลพื้นฐาน</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase">ชื่ออุปกรณ์</label>
                  <input 
                    type="text" required placeholder="ตัวอย่าง: RAM DDR4 8GB"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase">Serial Number</label>
                  <input 
                    type="text" required placeholder="ระบุหมายเลขซีเรียล"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <label className={labelStyle}>รูปภาพ (Attachment)</label>
                    <div className="relative h-[220px] group">
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                      <div className={`w-full h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${imagePreview ? 'border-emerald-500 bg-white' : 'border-slate-200 bg-slate-50/50 hover:border-emerald-400'}`}>
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover rounded-[1.4rem]" alt="preview" />
                        ) : (
                          <>
                            <ImageIcon size={40} className="text-slate-300 mb-2" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center px-4">Click or Drag Image to Upload</span>
                          </>
                        )}
                      </div>
                    </div>
                    {formData.image && (
                      <p className="mt-2 text-sm text-slate-400">เลือกไฟล์: {formData.image.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Classification */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                <HardDrive size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">การจัดหมวดหมู่และสถานะ</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase">หมวดหมู่</label>
                  <select 
                    className="appearance-none w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="RAM">💾 RAM</option>
                    <option value="SSD">💿 SSD</option>
                    <option value="HDD">📀 HDD</option>
                    <option value="GPU">🎮 GPU</option>
                    <option value="CPU">⚙️ CPU</option>
                    <option value="Motherboard">🔌 Motherboard</option>
                    <option value="PSU">⚡ Power Supply</option>
                    <option value="Monitor">🖥️ Monitor</option>
                    <option value="Keyboard">⌨️ Keyboard</option>
                    <option value="Mouse">🖱️ Mouse</option>
                    <option value="Other">📦 Other</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase">สถานะ</label>
                  <select 
                    className="appearance-none w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="In-use">🟢 In-use (ใช้งาน)</option>
                    <option value="In-repair">🟡 In-repair (ซ่อม)</option>
                    <option value="Inactive">🔴 Inactive (ไม่ใช้งาน)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: References */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                <ShoppingCart size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">การเชื่อมโยงข้อมูล</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase">เลขที่ใบสั่งซื้อ (PO)</label>
                  <select 
                    className="appearance-none w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                    value={formData.purchase_id}
                    onChange={(e) => setFormData({...formData, purchase_id: e.target.value})}
                  >
                    <option value="">เลือกรายการใบสั่งซื้อ (ไม่จำเป็น)</option>
                    {purchases.map((po) => (
                      <option key={po.id} value={po.id}>
                        📄 {po.po_number} — {po.vendor_name}
                      </option>
                    ))}
                  </select>
                  {fetchingData && (
                    <div className="absolute right-4 top-10 flex items-center gap-2 text-indigo-500">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase">อุปกรณ์หลัก (Parent Device)</label>
                  <select 
                    className="appearance-none w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white/90 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                    value={formData.parent_device_id}
                    onChange={(e) => setFormData({...formData, parent_device_id: e.target.value})}
                  >
                    <option value="">เลือกอุปกรณ์หลัก (ไม่จำเป็น)</option>
                    {parentDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        💻 {device.name} — {device.serial_number}
                      </option>
                    ))}
                  </select>
                  {fetchingData && (
                    <div className="absolute right-4 top-10 flex items-center gap-2 text-indigo-500">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="group relative w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" />}
                {loading ? 'SAVING DATA...' : 'REGISTER DEVICE'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
