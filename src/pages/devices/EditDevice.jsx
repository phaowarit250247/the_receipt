import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL } from '../../endpoint/URL';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export default function EditDevice() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    category: '',
    status: '',
    parent_device_id: null,
    purchase_id: null
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      const token = localStorage.getItem('token');
      try {
        // Always fetch from /devices/:id endpoint
        const res = await axios.get(`${BaseURL}/devices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Map ข้อมูลจาก API ลง State
        const d = res.data;
        setFormData({
          name: d.name || '',
          serial_number: d.serial_number || '',
          category: d.category || '',
          status: d.status || '',
          parent_device_id: d.parent_device_id || null,
          purchase_id: d.purchase_id || null
        });
        if (d.image_path) {
          setImagePreview(`${d.image_path}`);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        const errorMsg = err.response?.status === 404 ? 'ไม่พบอุปกรณ์นี้ในระบบ' : 'ไม่สามารถโหลดข้อมูลอุปกรณ์ได้';
        setMessage({ type: 'error', text: errorMsg });
        if (err.response?.status === 404) setTimeout(() => navigate(-1), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    const token = localStorage.getItem('token');

    try {
      // Use FormData to support optional image upload
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('serial_number', formData.serial_number);
      payload.append('category', formData.category);
      payload.append('status', formData.status);
      // Always append parent_device_id and purchase_id as strings
      payload.append('parent_device_id', formData.parent_device_id || '');
      payload.append('purchase_id', formData.purchase_id || '');
      if (imageFile) payload.append('image', imageFile);

      // Debug: log payload content
      console.log('Payload being sent:');
      for (let pair of payload.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Always PUT to /devices/:id endpoint
      const response = await axios.put(`${BaseURL}/devices/${id}`, payload, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.status === 200) {
        setMessage({ type: 'success', text: 'บันทึกการแก้ไขเรียบร้อยแล้ว' });
        // หน่วงเวลาเล็กน้อยก่อนกลับหน้าเดิมเพื่อให้ผู้ใช้เห็นสถานะ success
        setTimeout(() => navigate(`/devices/${id}`), 1500);
      }
    } catch (err) {
      console.error("Update error:", err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">แก้ไขอุปกรณ์</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">กรุณากรอกข้อมูลให้ครบถ้วน</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-6"></div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">ชื่ออุปกรณ์ *</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="เชื่น: Laptop Dell XPS 13"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Serial Number *</label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                  placeholder="เชื่น: SN-12345"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">หมวดหมู่ *</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="RAM">หน่วยความจำ (RAM)</option>
                  <option value="CPU">CPU</option>
                  <option value="Graphics Card">การ์ดจอ</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">สถานะ *</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="">-- เลือกสถานะ --</option>
                  <option value="In-stock">คงคลัง</option>
                  <option value="In-use">ใช้งาน</option>
                  <option value="In-repair">ซ่อมแซม</option>
                  <option value="Inactive">ไม่ใช้งาน</option>
                </select>
              </div>

              {/* Parent Device ID */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">ติดตั้งใน (Parent ID)</label>
                <input 
                  type="text"
                  placeholder="ปล่อยว่างหากเป็นเครื่องหลัก"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={formData.parent_device_id || ''}
                  onChange={(e) => setFormData({...formData, parent_device_id: e.target.value})}
                />
              </div>
              
              {/* Purchase ID */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Purchase ID</label>
                <input 
                  type="text"
                  placeholder="ปล่อยว่างหากไม่มี"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={formData.purchase_id || ''}
                  onChange={(e) => setFormData({...formData, purchase_id: e.target.value})}
                />
              </div>
              
              {/* Image upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">รูปภาพ</label>
                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 group hover:border-indigo-400 transition">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-slate-900 px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg">
                          เปลี่ยนรูปภาพ
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={44} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">อัปโหลดรูปภาพ</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">หรือลากวางที่นี่</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

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
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition font-semibold flex items-center gap-2 disabled:opacity-70"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}