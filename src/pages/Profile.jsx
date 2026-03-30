import { useState, useEffect } from 'react';
import axios from 'axios';
import { BaseURL } from '../endpoint/URL';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Loader2, 
  Camera, 
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      
      try {
        setLoading(true);
        const res = await axios.get(`${BaseURL}/auth/me`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (res.data.user) {
          setProfile(res.data.user);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
        // ถ้า Unauthorized (401) อาจจะให้ Logout
        if (err.response?.status === 401) {
            localStorage.clear();
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <p className="text-rose-500 mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">ลองใหม่อีกครั้ง</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>ย้อนกลับ</span>
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          
          {/* Cover Header */}
          <div className="h-32 bg-linear-to-r from-indigo-500 to-blue-600 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-700 border-4 border-white dark:border-slate-800 flex items-center justify-center text-indigo-600 shadow-lg">
                  <User size={48} />
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-slate-100 dark:bg-slate-600 rounded-lg border-2 border-white dark:border-slate-800 hover:bg-white transition shadow-sm">
                  <Camera size={14} className="text-slate-600 dark:text-slate-200" />
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 px-8 pb-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.name}</h1>
              <p className="text-slate-500 dark:text-slate-400">สมาชิก AddPay IT System</p>
            </div>

            <div className="space-y-4">
              {/* Info Rows */}
              <InfoRow 
                icon={<Mail className="text-indigo-500" size={20} />} 
                label="อีเมล" 
                value={profile?.email} 
              />
              <InfoRow 
                icon={<ShieldCheck className="text-emerald-500" size={20} />} 
                label="บทบาท (Role)" 
                value={profile?.role} 
                isBadge
              />
              <InfoRow 
                icon={<Calendar className="text-amber-500" size={20} />} 
                label="รหัสสมาชิก" 
                value={`#${String(profile?.id).padStart(4, '0')}`} 
              />
            </div>

            <hr className="my-8 border-slate-100 dark:border-slate-700" />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition shadow-md">
                แก้ไขโปรไฟล์
              </button>
              <button className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition">
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-slate-400 text-sm mt-8">
          ข้อมูลนี้เป็นความลับเฉพาะเจ้าหน้าที่ของ AddPay เท่านั้น
        </p>
      </div>
    </div>
  );
}

// Sub-component สำหรับแสดงแถวข้อมูล
function InfoRow({ icon, label, value, isBadge = false }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition">
      <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        {isBadge ? (
          <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md">
            {value}
          </span>
        ) : (
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
        )}
      </div>
    </div>
  );
}