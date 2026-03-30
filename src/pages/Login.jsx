import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import axios from 'axios'; // นำเข้า axios
import { BaseURL } from '../endpoint/URL';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // ใช้ axios.post แทน fetch
      const response = await axios.post(`${BaseURL}/auth/login`, {
        email: email,
        password: password
      });

      // Axios จะเก็บข้อมูลไว้ใน data โดยอัตโนมัติ
      const data = response.data;

      // เก็บ Token และข้อมูล User ลง LocalStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Login Success:', data.message);
      
      // Redirect ไปหน้า Dashboard
      window.location.href = '/dashboard'; 

    } catch (err) {
      // การจัดการ Error ของ Axios
      if (err.response) {
        // Server ตอบกลับมาแต่สถานะไม่ใช่ 2xx (เช่น 401, 400)
        setError(err.response.data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (err.request) {
        // ส่ง Request ไปแล้วแต่ไม่มีการตอบกลับ (Server ตาย หรือเน็ตหลุด)
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      } else {
        // เกิดข้อผิดพลาดอื่นๆ
        setError('เกิดข้อผิดพลาดในการตั้งค่าคำขอ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-blue-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
          
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                IT
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">ยินดีต้อนรับ</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">เข้าสู่ระบบเพื่อจัดการอุปกรณ์ไอที</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-10">
            <form className="space-y-5" onSubmit={handleLogin}>
              
              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  อีเมล
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@addpay.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    รหัสผ่าน
                  </label>
                  <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 transition">
                    ลืมรหัสผ่าน?
                  </a>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-md mt-6 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> กำลังเข้าสู่ระบบ...</>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}