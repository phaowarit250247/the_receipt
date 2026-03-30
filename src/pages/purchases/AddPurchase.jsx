import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL } from '../../endpoint/URL';
import { 
  ArrowLeft, Save, Loader2, AlertCircle, 
  CheckCircle2, FilePlus, Calculator, Store, Calendar, ClipboardList, Image as ImageIcon, Building2, Hash, Receipt, CalendarDays, ShieldCheck, NotebookPen, BadgePercent, CreditCard
} from 'lucide-react';

export default function AddPurchase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imagePreview, setImagePreview] = useState(null);

  // สไตล์ที่อัปเกรดให้สวยขึ้น
  const labelStyle = "block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase tracking-wider flex items-center gap-2";
  const inputStyle = "w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-white outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-400/20 hover:border-emerald-300";
  const cardStyle = "bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 hover:shadow-xl transition-all duration-300";

  const [formData, setFormData] = useState({
    po_number: '',
    vendor_name: '',
    purchase_date: new Date().toISOString().split('T')[0],
    warranty_expire_date: '',
    sequence: 'SEQ-001',
    tax_id: '',
    branch: 'สาขาหลัก',
    receipt_type: 'normal',
    item_value: '',
    vat_amount: '0.00',
    total_amount: '0.00',
    notes: '',
    image: null
  });

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
    setLoading(true);
    setMessage({ type: '', text: '' });

    const token = localStorage.getItem('token');
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post(`${BaseURL}/purchases`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}` 
        }
      });

      if (response.status === 201 || response.status === 200) {
        setMessage({ type: 'success', text: '✅ เพิ่มรายการสั่งซื้อและรูปภาพเรียบร้อยแล้ว' });
        setTimeout(() => navigate('/purchases'), 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || '❌ เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-10 text-slate-900 dark:text-white transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button - Enhanced */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-3 text-slate-500 hover:text-emerald-600 mb-8 transition-all duration-300 font-semibold bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:shadow-md cursor-pointer"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>ย้อนกลับ</span>
        </button>

        {/* Main Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl drop-shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          
          {/* Hero Header - Enhanced */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-600 text-white p-8 md:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl -ml-20 -mb-20"></div>
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-white/20 backdrop-blur rounded-2xl shadow-xl border border-white/30">
                  <FilePlus size={32} strokeWidth={1.8} />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight uppercase bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                    เพิ่มคำสั่งซื้อใหม่
                  </h1>
                  <p className="text-emerald-100 text-sm font-semibold tracking-wide mt-1 flex items-center gap-2">
                    <span className="inline-block w-1 h-1 bg-emerald-300 rounded-full"></span>
                    กรอกข้อมูลให้ครบถ้วน พร้อมแนบไฟล์ใบเสร็จ
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur rounded-xl border border-white/30 shadow-lg">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
                  สถานะ: พร้อมใช้งาน
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            {/* Message Alert - Enhanced */}
            {message.text && (
              <div className={`flex items-center gap-3 p-5 rounded-2xl border-2 animate-in slide-in-from-top-2 duration-300 ${
                message.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}>
                {message.type === 'success' ? <CheckCircle2 size={24} strokeWidth={1.8} /> : <AlertCircle size={24} strokeWidth={1.8} />}
                <p className="text-sm font-bold flex-1">{message.text}</p>
              </div>
            )}

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column - General Information */}
              <div className="space-y-6">
                <div className={cardStyle}>
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-emerald-100 dark:border-emerald-900">
                    <Hash size={20} className="text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">ข้อมูลทั่วไป</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className={labelStyle}>
                        <Hash size={14} />
                        เลขที่ PO (PO Number)
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="PO-2027-003" 
                        className={inputStyle} 
                        value={formData.po_number} 
                        onChange={(e) => setFormData({...formData, po_number: e.target.value})} 
                      />
                    </div>
                    
                    <div>
                      <label className={labelStyle}>
                        <Store size={14} />
                        ชื่อผู้จำหน่าย (Vendor)
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="กรอกชื่อร้านหรือผู้จำหน่าย" 
                        className={inputStyle} 
                        value={formData.vendor_name} 
                        onChange={(e) => setFormData({...formData, vendor_name: e.target.value})} 
                      />
                    </div>
                    
                    <div>
                      <label className={labelStyle}>
                        <Hash size={14} />
                        เลขประจำตัวผู้เสียภาษี (Tax ID)
                      </label>
                      <input 
                        type="text" 
                        placeholder="เช่น 1234567890123" 
                        className={inputStyle} 
                        value={formData.tax_id} 
                        onChange={(e) => setFormData({...formData, tax_id: e.target.value})} 
                      />
                    </div>
                    
                    <div>
                      <label className={labelStyle}>
                        <Receipt size={14} />
                        ประเภทใบเสร็จ (Receipt Type)
                      </label>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, receipt_type: 'normal'})}
                          className={`${formData.receipt_type === 'normal' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-emerald-300'} rounded-2xl border p-4 flex items-center gap-2 transition-all duration-300`}
                        >
                          <span className="text-xl">📄</span>
                          <div>
                            <p className="text-sm font-bold">Normal</p>
                            <p className="text-xs text-slate-500">ฟอร์มใบเสร็จทั่วไป</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, receipt_type: 'tax_invoice'})}
                          className={`${formData.receipt_type === 'tax_invoice' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-emerald-300'} rounded-2xl border p-4 flex items-center gap-2 transition-all duration-300`}
                        >
                          <span className="text-xl">🧾</span>
                          <div>
                            <p className="text-sm font-bold">Tax Invoice</p>
                            <p className="text-xs text-slate-500">ใบแจ้งภาษีถูกต้อง</p>
                          </div>
                        </button>
                      </div>
                      <input type="hidden" name="receipt_type" value={formData.receipt_type} />
                    </div>
                    
                    <div>
                      <label className={labelStyle}>
                        <Building2 size={14} />
                        สาขา / Branch
                      </label>
                      <input 
                        type="text" 
                        className={inputStyle} 
                        value={formData.branch} 
                        onChange={(e) => setFormData({...formData, branch: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-6">
                <div className={cardStyle}>
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-emerald-100 dark:border-emerald-900">
                    <ImageIcon size={20} className="text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">เอกสารประกอบ</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                      รูปภาพใบเสร็จ / หลักฐาน
                    </label>
                    <div className="relative h-64 group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        onChange={handleFileChange} 
                      />
                      <div className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${
                        imagePreview 
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-400 hover:bg-emerald-50/30'
                      }`}>
                        {imagePreview ? (
                          <div className="relative w-full h-full group">
                            <img 
                              src={imagePreview} 
                              className="w-full h-full object-contain p-2" 
                              alt="preview" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                              <span className="text-white text-sm font-bold">คลิกเพื่อเปลี่ยนรูป</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-8">
                            <div className="w-20 h-20 mx-auto bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-4">
                              <ImageIcon size={40} className="text-emerald-500" />
                            </div>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                              คลิกหรือลากรูปมาวาง
                            </span>
                            <p className="text-xs text-slate-400 mt-2">รองรับไฟล์ .jpg, .png, .jpeg</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Section */}
            <div className={cardStyle}>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-emerald-100 dark:border-emerald-900">
                <Calendar size={20} className="text-emerald-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">กำหนดการ</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>
                    <CalendarDays size={14} />
                    วันที่ซื้อ
                  </label>
                  <input 
                    type="date" 
                    required 
                    className={`${inputStyle} cursor-pointer`} 
                    value={formData.purchase_date} 
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} 
                  />
                </div>
                <div>
                  <label className={labelStyle}>
                    <ShieldCheck size={14} />
                    วันที่หมดประกัน
                  </label>
                  <input 
                    type="date" 
                    required 
                    className={`${inputStyle} cursor-pointer border-rose-200 focus:border-rose-500`} 
                    value={formData.warranty_expire_date} 
                    onChange={(e) => setFormData({...formData, warranty_expire_date: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Financial Section - Enhanced */}
            <div className={`${cardStyle} bg-gradient-to-r from-emerald-50/50 to-slate-50/50 dark:from-emerald-950/20 dark:to-slate-900/30`}>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-emerald-200 dark:border-emerald-800">
                <Calculator size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">สรุปยอดเงิน</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    <CreditCard size={14} />
                    ราคาไม่รวม VAT
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      className={`${inputStyle} pl-8 font-bold text-lg`} 
                      value={formData.item_value} 
                      onChange={(e) => handleValueChange(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                    <BadgePercent size={14} />
                    ภาษีมูลค่าเพิ่ม (7%)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                    <input 
                      type="text" 
                      readOnly 
                      className={`${inputStyle} pl-8 bg-slate-100 dark:bg-slate-800/50 cursor-default font-medium`} 
                      value={formData.vat_amount} 
                    />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 shadow-lg">
                  <label className="flex items-center gap-2 text-xs font-black text-white/90 mb-2 uppercase tracking-wider">
                    <Calculator size={14} />
                    ยอดเงินสุทธิ
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-black text-xl">฿</span>
                    <input 
                      type="text" 
                      readOnly 
                      className="w-full px-5 py-4 pl-12 rounded-xl bg-white/20 text-white font-black text-2xl border-2 border-white/30 outline-none cursor-default" 
                      value={formData.total_amount} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className={cardStyle}>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-emerald-100 dark:border-emerald-900">
                <NotebookPen size={20} className="text-emerald-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">หมายเหตุเพิ่มเติม</h3>
              </div>
              
              <textarea 
                rows="3" 
                className={`${inputStyle} resize-none font-medium`} 
                placeholder="ระบุรายละเอียดเพิ่มเติม เช่น เงื่อนไขการรับประกัน, รายการสินค้า, หรือหมายเหตุอื่นๆ..."
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
              />
            </div>

            {/* Submit Button - Enhanced */}
            <button 
              type="submit" 
              disabled={loading} 
              className="group relative w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-2xl font-black text-lg transition-all duration-300 shadow-xl shadow-emerald-200/50 hover:shadow-2xl hover:shadow-emerald-300/50 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
              <span className="relative z-10">{loading ? 'กำลังบันทึกข้อมูล...' : 'บันทึกคำสั่งซื้อ'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}