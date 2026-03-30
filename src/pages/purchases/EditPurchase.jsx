import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL, ImgURL } from '../../endpoint/URL';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, 
  CheckCircle2, FileEdit, Image as ImageIcon, X
} from 'lucide-react';

export default function EditPurchase() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    po_number: '',
    vendor_name: '',
    purchase_date: '',
    warranty_expire_date: '',
    sequence: '',
    tax_id: '',
    branch: '',
    item_value: '',
    vat_amount: '',
    total_amount: '',
    notes: '',
    image: null
  });

  const labelStyle = "block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1";
  const inputStyle = "w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";

  useEffect(() => {
    const fetchPurchase = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${BaseURL}/purchases/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const d = res.data;
        setFormData({
          ...d,
          purchase_date: d.purchase_date?.split('T')[0] || '',
          warranty_expire_date: d.warranty_expire_date?.split('T')[0] || '',
          receipt_type: d.receipt_type || 'normal',
          image: null // รีเซ็ตไฟล์ภาพใหม่ทุกครั้งที่โหลด
        });
        if (d.image_path) {
          setImagePreview(`${ImgURL}/${d.image_path}`);
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'ไม่สามารถโหลดข้อมูลได้' });
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);

  const handleValueChange = (value) => {
    const itemValue = parseFloat(value) || 0;
    const vat = itemValue * 0.07;
    const total = itemValue + vat;
    setFormData({
      ...formData,
      item_value: value,
      vat_amount: vat.toFixed(2),
      total_amount: total.toFixed(2)
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');

    // ใช้ FormData เพราะมีการส่งไฟล์
    const data = new FormData();
    data.append('_method', 'PUT'); // หลอก API ว่าเป็น PUT (Method Spoofing)
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      await axios.post(`${BaseURL}/purchases/${id}`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });
      setMessage({ type: 'success', text: 'อัปเดตข้อมูลเรียบร้อยแล้ว' });
      setTimeout(() => navigate(`/purchases/${id}`), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'เกิดข้อผิดพลาด' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium">
            <ArrowLeft size={18} /> ย้อนกลับ
          </button>
          <h1 className="text-xl font-bold dark:text-white">แก้ไขข้อมูลการสั่งซื้อ</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {message.text && (
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <p className="text-sm font-semibold">{message.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ฝั่งข้อมูลตัวอักษร */}
              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>เลขที่ PO</label>
                  <input type="text" required className={inputStyle} value={formData.po_number} onChange={(e) => setFormData({...formData, po_number: e.target.value})} />
                </div>
                <div>
                  <label className={labelStyle}>ชื่อผู้จำหน่าย</label>
                  <input type="text" required className={inputStyle} value={formData.vendor_name} onChange={(e) => setFormData({...formData, vendor_name: e.target.value})} />
                </div>
                <div>
                  <label className={labelStyle}>เลขประจำตัวผู้เสียภาษี</label>
                  <input type="text" className={inputStyle} value={formData.tax_id} onChange={(e) => setFormData({...formData, tax_id: e.target.value})} placeholder="เช่น 1234567890123" />
                </div>
                <div>
                  <label className={labelStyle}>ประเภทใบเสร็จ (Receipt Type)</label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="radio" name="receipt_type" value="normal" checked={formData.receipt_type === 'normal'} onChange={(e) => setFormData({...formData, receipt_type: e.target.value})} />
                      normal
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="radio" name="receipt_type" value="tax_invoice" checked={formData.receipt_type === 'tax_invoice'} onChange={(e) => setFormData({...formData, receipt_type: e.target.value})} />
                      tax_invoice
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyle}>วันที่ซื้อ</label>
                    <input type="date" required className={inputStyle} value={formData.purchase_date} onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelStyle}>วันที่หมดประกัน</label>
                    <input type="date" required className={inputStyle} value={formData.warranty_expire_date} onChange={(e) => setFormData({...formData, warranty_expire_date: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* ฝั่งรูปภาพ */}
              <div>
                <label className={labelStyle}>รูปภาพใบเสร็จ / หลักฐาน</label>
                <div className="relative aspect-video md:aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/50 group">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm">
                          เปลี่ยนรูปภาพ
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <ImageIcon size={40} className="text-slate-300 mb-2" />
                      <span className="text-xs font-bold text-slate-400 uppercase">อัปโหลดรูปภาพ</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* ส่วนตัวเลข */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <label className={labelStyle}>ราคาไม่รวม VAT</label>
                <input type="number" step="0.01" required className={inputStyle} value={formData.item_value} onChange={(e) => handleValueChange(e.target.value)} />
              </div>
              <div>
                <label className={labelStyle}>ภาษี (7%)</label>
                <input type="text" readOnly className={`${inputStyle} bg-slate-100 cursor-not-allowed`} value={formData.vat_amount} />
              </div>
              <div>
                <label className={labelStyle}>ยอดสุทธิ</label>
                <input type="text" readOnly className={`${inputStyle} bg-slate-100 font-bold text-emerald-600`} value={formData.total_amount} />
              </div>
            </div>

            <div>
              <label className={labelStyle}>หมายเหตุ</label>
              <textarea rows="2" className={inputStyle} value={formData.notes || ''} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 font-bold text-slate-500">ยกเลิก</button>
              <button 
                type="submit" disabled={saving}
                className="px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                บันทึกการแก้ไข
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}