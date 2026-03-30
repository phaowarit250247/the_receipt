import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react' // เพิ่ม icon เพื่อความสวยงาม

function Navbar() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    // เช็คสถานะ Login ทุกครั้งที่ Component โหลด หรือมีการเปลี่ยนหน้า
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        } else {
            setUser(null);
        }
    }, [window.location.pathname]); // เช็คใหม่เมื่อ path เปลี่ยน

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14 items-center">
                    {/* Logo */}


                    <div className="flex items-center gap-3 cursor-pointer" 
                    onClick={() => navigate(user ? '/dashboard' : '/')}
                    >
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow">
                            IT
                        </div>
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">Toolbox</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            // ส่วนแสดงผลเมื่อ Login แล้ว
                            <div className="flex items-center gap-4">
                                <div 
                                    className="hidden md:flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-600 transition"
                                    onClick={() => navigate('/profile')}
                                >
                                    <User className="w-4 h-4" />
                                    <span>สวัสดี, {user.name}</span>
                                </div>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>ออกจากระบบ</span>
                                </button>
                            </div>
                        ) : (
                            // ส่วนแสดงผลเมื่อยังไม่ได้ Login
                            <button 
                                onClick={() => navigate('/login')} 
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium cursor-pointer shadow-sm"
                            >
                                เข้าสู่ระบบ
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar