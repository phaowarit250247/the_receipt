import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL } from '../../endpoint/URL';
import { 
  ArrowLeft, PlusCircle, Loader2, AlertCircle, 
  CheckCircle2, Box, Tag, Layers, Activity, ShoppingCart, Image as ImageIcon 
} from 'lucide-react';

export default function AddParentDevice() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serial_number: '',
    name: '',
    category: 'Computer',
    status: 'In-use',
    purchase_id: '',
    image: null
  });

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingPurchases, setFetchingPurchases] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState(null);
  
  const labelStyle = "block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase";
  
  // สร้างตัวแปรสำหรับคลาสของ Input/Select เพื่อลดความซ้ำซ้อนและแก้ปัญหาสีทับกัน
  const inputStyle = "w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-slate-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white outline-none transition-all";

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
    const fetchPurchases = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/purchases`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchases(res.data);
      } catch (err) {
        console.error("Error fetching purchases:", err);
      } finally {
        setFetchingPurchases(false);
      }
    };
    fetchPurchases();
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
      if (formData.image) payload.append('image', formData.image);

      const response = await axios.post(`${BaseURL}/devices/parents`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 201 || response.status === 200) {
        setMessage({ type: 'success', text: 'เพิ่มอุปกรณ์หลักเรียบร้อยแล้ว' });
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
                <Box size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">New Parent Device</h1>
                <p className="text-indigo-100 text-sm opacity-80 font-medium">ลงทะเบียนอุปกรณ์หลักเข้าสู่ระบบ</p>
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
                  <label className={labelStyle}>ชื่ออุปกรณ์</label>
                  <input 
                    type="text" required placeholder="ตัวอย่าง: Dell OptiPlex 7090 MFF"
                    className={inputStyle}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelStyle}>Serial Number</label>
                  <input 
                    type="text" required placeholder="ระบุ Service Tag หรือหมายเลขซีเรียล"
                    className={inputStyle}
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <label className={labelStyle}>รูปภาพใบเสร็จ / หลักฐาน (Attachment)</label>
                    <div className="relative h-[220px] group">
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                      <div className={`w-full h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${imagePreview ? 'border-emerald-500 bg-white dark:bg-slate-800' : 'border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900 hover:border-emerald-400'}`}>
                        {imagePreview ? (
                          <img src={imagePreview} className="w-full h-full object-cover rounded-[1.4rem]" alt="preview" />
                        ) : (
                          <>
                            <ImageIcon size={40} className="text-slate-300 dark:text-slate-500 mb-2" />
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
                <Layers size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">การจัดหมวดหมู่และสถานะ</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className={labelStyle}>หมวดหมู่</label>
                  <select 
                    className={`appearance-none ${inputStyle}`}
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Computer">💻 Computer</option>
                    <option value="Desktop">🖥️ Desktop</option>
                    <option value="Laptop">💻 Laptop</option>
                    <option value="Server">☁️ Server</option>
                    <option value="Workstation">🏗️ Workstation</option>
                  </select>
                </div>
                <div className="relative">
                  <label className={labelStyle}>สถานะ</label>
                  <select 
                    className={`appearance-none ${inputStyle}`}
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

            {/* Section 3: Reference */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                <ShoppingCart size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">การเชื่อมโยงข้อมูล</h2>
              </div>
              
              <div className="relative">
                <label className={labelStyle}>เลขที่ใบสั่งซื้อ (PO)</label>
                <select 
                  required
                  className={`appearance-none ${inputStyle}`}
                  value={formData.purchase_id}
                  onChange={(e) => setFormData({...formData, purchase_id: e.target.value})}
                >
                  <option value="">เลือกรายการใบสั่งซื้อจากระบบ...</option>
                  {purchases.map((po) => (
                    <option key={po.id} value={po.id}>
                      📄 {po.po_number} — {po.vendor_name}
                    </option>
                  ))}
                </select>
                {fetchingPurchases && (
                  <div className="absolute right-4 top-10 flex items-center gap-2 text-indigo-500">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                )}
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