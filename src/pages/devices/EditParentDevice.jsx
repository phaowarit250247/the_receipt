import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL, ImgURL } from '../../endpoint/URL';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon
} from 'lucide-react';

export default function EditParentDevice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    category: '',
    status: '',
    purchase_id: ''
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
    const fetchParent = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/devices/parents/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = res.data;
        setFormData({
          name: d.name || d.parent_name || '',
          serial_number: d.serial_number || d.parent_serial || '',
          category: d.category || d.parent_category || '',
          status: d.status || d.parent_status || '',
          purchase_id: d.purchase?.id || d.purchase_id || ''
        });
        if (d.image_path || d.parent?.image_path) {
          setImagePreview((d.image_path || d.parent?.image_path).startsWith('http') ? (d.image_path || d.parent?.image_path) : `${ImgURL}/${d.image_path || d.parent?.image_path}`);
        }
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.status === 404 ? 'ไม่พบเครื่องหลักนี้ในระบบ' : 'ไม่สามารถโหลดข้อมูลเครื่องหลักได้';
        setMessage({ type: 'error', text: errorMsg });
        setTimeout(() => navigate(-1), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchParent();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('serial_number', formData.serial_number);
      payload.append('category', formData.category);
      payload.append('status', formData.status);
      if (formData.purchase_id) payload.append('purchase_id', formData.purchase_id);
      if (imageFile) payload.append('image', imageFile);

      const res = await axios.put(`${BaseURL}/devices/parents/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'บันทึกเรียบร้อย' });
      setTimeout(() => navigate(`/devices/parents/${id}`), 1200);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">แก้ไขเครื่องหลัก</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">อัปเดตข้อมูลเครื่องหลักของคุณ</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-6"></div>
          
          {message.text && (
            <div className={`mx-8 mt-6 p-4 rounded-2xl border-2 flex items-center gap-3 ${
              message.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-semibold">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">ชื่อเครื่องหลัก *</label>
              <input type="text" required className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} placeholder="เช่น: Dell Server" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Serial Number</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" value={formData.serial_number} onChange={(e)=>setFormData({...formData, serial_number: e.target.value})} placeholder="SN-12345" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Category</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} placeholder="Server" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">สถานะ *</label>
                <select className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value})}>
                  <option value="">-- เลือกสถานะ --</option>
                  <option value="In-use">ใช้งาน</option>
                  <option value="In-repair">ซ่อมแซม</option>
                  <option value="Inactive">ไม่ใช้งาน</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Purchase ID</label>
                <input type="text" placeholder="ปล่อยว่างหากไม่มี" className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" value={formData.purchase_id} onChange={(e)=>setFormData({...formData, purchase_id: e.target.value})} />
              </div>
            </div>

            <div>
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

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-semibold">ยกเลิก</button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 transition font-semibold flex items-center gap-2 disabled:opacity-70">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
