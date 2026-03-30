import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BaseURL, ImgURL } from '../../endpoint/URL';
import { 
  ArrowLeft, Loader2, Store, Tag, ReceiptText, Image as ImageIcon,
  Pencil, ExternalLink, Cpu, Monitor, Box, ChevronRight
} from 'lucide-react';

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const sectionCard = "bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700";
  const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1";
  const valueStyle = "text-slate-900 dark:text-white font-bold";

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        setLoading(true);
        const [purchaseRes, devicesRes] = await Promise.all([
          axios.get(`${BaseURL}/purchases/${id}`, { headers }),
          axios.get(`${BaseURL}/purchases/${id}/devices`, { headers })
        ]);
        setPurchase(purchaseRes.data);
        setDeviceData(devicesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ─────────────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  if (!purchase) return (
    <div className="p-8 text-center dark:text-white font-bold">ไม่พบข้อมูลการจัดซื้อ</div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-all cursor-pointer"
          >
            <ArrowLeft size={18} /> ย้อนกลับ
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/purchases/edit/${id}`)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <Pencil size={16} /> แก้ไขข้อมูล
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`${sectionCard} text-center overflow-hidden`}>
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800">
                <ReceiptText size={40} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {purchase.po_number}
              </h1>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                Sequence: {purchase.sequence || "N/A"}
              </p>

              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 text-left space-y-6">
                <div>
                  <p className={labelStyle}>ยอดชำระสุทธิ</p>
                  <p className="text-3xl font-black text-emerald-600">
                    {parseFloat(purchase.total_amount).toLocaleString()} ฿
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={labelStyle}>วันที่สั่งซื้อ</p>
                    <p className="text-sm font-bold dark:text-slate-200">
                      {new Date(purchase.purchase_date).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                  <div>
                    <p className={`${labelStyle} text-rose-500`}>ประกันหมดอายุ</p>
                    <p className="text-sm font-bold text-rose-500">
                      {new Date(purchase.warranty_expire_date).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={sectionCard}>
              <p className={labelStyle}>เอกสารอ้างอิง</p>
              <div className="mt-4 aspect-[3/4] rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                {purchase.image_path ? (
                  <>
                    <img
                      src={`${ImgURL}/${purchase.image_path}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt="PO"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={`${ImgURL}/${purchase.image_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white text-slate-900 p-3 rounded-full shadow-xl"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">ไม่มีรูปภาพเอกสาร</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (8/12) */}
          <div className="lg:col-span-8 space-y-6">

            <div className={sectionCard}>
              <h2 className="text-lg font-black mb-6 flex items-center gap-2 dark:text-white">
                <Store className="text-emerald-500" size={22} /> ข้อมูลผู้จำหน่าย
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className={labelStyle}>บริษัทผู้จำหน่าย</p>
                  <p className={valueStyle}>{purchase.vendor_name}</p>
                </div>
                <div>
                  <p className={labelStyle}>สาขา</p>
                  <p className={valueStyle}>{purchase.branch || "สำนักงานใหญ่"}</p>
                </div>
                <div>
                  <p className={labelStyle}>ประเภทใบเสร็จ</p>
                  <p className={valueStyle}>{purchase.receipt_type || "-"}</p>
                </div>
                <div>
                  <p className={labelStyle}>เลขประจำตัวผู้เสียภาษี</p>
                  <p className={valueStyle}>{purchase.tax_id || "-"}</p>
                </div>
              </div>
            </div>

            {/* รายการอุปกรณ์ */}
            <div className={sectionCard}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black flex items-center gap-2 dark:text-white">
                  <Box className="text-indigo-500" size={22} /> รายการอุปกรณ์ใน PO นี้
                </h2>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Main Units</p>
                    <p className="font-black text-indigo-600">{deviceData?.parent_device_count || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Components</p>
                    <p className="font-black text-emerald-600">{deviceData?.device_count || 0}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {deviceData?.devices?.map((dev) => (
                  <div
                    key={`${dev.type}-${dev.id}`}
                    onClick={() => navigate(dev.type === "parent_device" ? `/devices/parent/${dev.id}` : `/devices/${dev.id}`)}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${dev.type === "parent_device" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {dev.type === "parent_device" ? <Monitor size={20} /> : <Cpu size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700 dark:text-white group-hover:text-indigo-600 transition-colors">
                          {dev.name}
                        </p>
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{dev.serial_number}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 uppercase">
                            {dev.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${dev.status === "In-repair" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {dev.status_label}
                      </span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-all" />
                    </div>
                  </div>
                ))}
                {(!deviceData?.devices || deviceData.devices.length === 0) && (
                  <p className="text-center py-6 text-slate-400 text-sm italic">
                    ยังไม่มีอุปกรณ์ผูกกับใบสั่งซื้อนี้
                  </p>
                )}
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
              <h2 className="text-xs font-black mb-3 flex items-center gap-2 opacity-70 uppercase tracking-[0.2em]">
                <Tag size={16} /> บันทึกช่วยจำ
              </h2>
              <p className="text-sm font-medium leading-relaxed">
                {purchase.notes || "ไม่มีบันทึกหมายเหตุ"}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}