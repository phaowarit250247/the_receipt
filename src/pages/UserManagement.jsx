// src/pages/admin/UserManagement.jsx
import { useState } from 'react';

export default function UserManagement() {
  const [users, setUsers] = useState([
    // ข้อมูลตัวอย่าง (จริง ๆ ควร fetch จาก API)
    {
      id: 1,
      name: 'Teerawat',
      email: 'teerawat@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2025-01-15',
      lastLogin: '2026-03-01',
    },
    {
      id: 2,
      name: 'Somchai Jaidee',
      email: 'somchai.j@example.com',
      role: 'user',
      status: 'active',
      createdAt: '2025-07-10',
      lastLogin: '2026-02-25',
    },
    {
      id: 3,
      name: 'Nong Mai',
      email: 'nongmai@example.com',
      role: 'user',
      status: 'inactive',
      createdAt: '2026-01-05',
      lastLogin: '-',
    },
  ]);

  const [modalType, setModalType] = useState(null); // 'create', 'edit', 'reset', 'delete'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });
  const [generatedPassword, setGeneratedPassword] = useState('');

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (type === 'edit' && user) {
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setFormData({ name: '', email: '', role: 'user' });
    }
    setGeneratedPassword('');
  };

  const closeModal = () => {
    setModalType(null);
    setGeneratedPassword('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'create') {
      const newId = Math.max(...users.map((u) => u.id), 0) + 1;
      const tempPass = Math.random().toString(36).slice(-12) + '!'; // password ยาวขึ้นนิด
      setGeneratedPassword(tempPass);

      setUsers([
        ...users,
        {
          id: newId,
          ...formData,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: '-',
        },
      ]);

      alert(
        `สร้างผู้ใช้สำเร็จ!\n\nEmail: ${formData.email}\nPassword ชั่วคราว: ${tempPass}\n\nคัดลอกแล้วส่งให้ผู้ใช้ทันที\nแนะนำให้เปลี่ยนรหัสผ่านหลัง login ครั้งแรก`
      );
    } else if (modalType === 'edit') {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, ...formData } : u
        )
      );
      alert('อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว');
    }
    closeModal();
  };

  const handleResetPassword = () => {
    const tempPass = Math.random().toString(36).slice(-12) + '!';
    setGeneratedPassword(tempPass);
    alert(
      `รีเซ็ตรหัสผ่านเรียบร้อย!\n\nPassword ใหม่ชั่วคราว: ${tempPass}\n\nแจ้งผู้ใช้ทันที และแนะนำให้เปลี่ยนรหัสผ่าน`
    );
    // TODO: call API เพื่อ reset จริง
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(
      users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );
    alert(`เปลี่ยนสถานะเป็น "${newStatus === 'active' ? 'ใช้งานได้' : 'ถูกระงับ'}" เรียบร้อย`);
  };

  const handleDelete = () => {
    if (window.confirm(`ยืนยันการลบผู้ใช้ "${selectedUser?.name}" จริงหรือไม่?`)) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      alert('ลบผู้ใช้เรียบร้อยแล้ว');
      closeModal();
    }
  };

  return (
    <>
      {/* Navbar - วางด้านนอกสุด เพื่อให้ sticky ทำงานถูกต้อง */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                IT
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Toolbox</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-6">
              <span className="hidden md:block text-slate-700 dark:text-slate-300 font-medium">
                สวัสดี, Teerawat
              </span>

              <button className="hidden sm:flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-sm">
                <span className="text-lg">+</span> เพิ่มอุปกรณ์
              </button>

              <button className="text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition font-medium">
                ออกจากระบบ
              </button>

              <button className="md:hidden text-slate-700 dark:text-slate-200 text-2xl">
                ☰
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* เนื้อหาหลัก - เพิ่ม padding-top เพื่อไม่ให้ทับ navbar */}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              จัดการผู้ใช้
            </h1>
            <button
              onClick={() => openModal('create')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <span className="text-xl leading-none">+</span> เพิ่มผู้ใช้ใหม่
            </button>
          </div>

          {/* ตารางผู้ใช้ */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      ชื่อ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      อีเมล
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      บทบาท
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      สร้างเมื่อ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      เข้าสู่ระบบล่าสุด
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {user.status === 'active' ? 'ใช้งานได้' : 'ถูกระงับ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {user.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => openModal('edit', user)}
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => {
                            openModal('reset', user);
                            handleResetPassword();
                          }}
                          className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          รีเซ็ตรหัส
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300"
                        >
                          {user.status === 'active' ? 'ระงับ' : 'เปิดใช้งาน'}
                        </button>
                        <button
                          onClick={() => openModal('delete', user)}
                          className="text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {modalType && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {modalType === 'create' && 'เพิ่มผู้ใช้ใหม่'}
                    {modalType === 'edit' && 'แก้ไขผู้ใช้'}
                    {modalType === 'reset' && 'รีเซ็ตรหัสผ่าน'}
                    {modalType === 'delete' && 'ยืนยันการลบผู้ใช้'}
                  </h2>
                </div>

                {modalType === 'reset' ? (
                  <div className="p-6 space-y-4">
                    <p className="text-slate-700 dark:text-slate-300">
                      รหัสผ่านชั่วคราวใหม่สำหรับ{' '}
                      <strong>{selectedUser?.name}</strong>:
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg text-center font-mono text-lg font-semibold tracking-wide break-all">
                      {generatedPassword || 'กำลังสร้าง...'}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      คัดลอกแล้วแจ้งผู้ใช้ทันที • แนะนำเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ
                    </p>
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={closeModal}
                        className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        ปิด
                      </button>
                    </div>
                  </div>
                ) : modalType === 'delete' ? (
                  <div className="p-6 space-y-6">
                    <p className="text-slate-700 dark:text-slate-300">
                      คุณแน่ใจหรือไม่ที่จะลบผู้ใช้{' '}
                      <strong>{selectedUser?.name}</strong> (
                      {selectedUser?.email}) ?
                    </p>
                    <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">
                      การกระทำนี้ไม่สามารถกู้คืนได้
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={closeModal}
                        className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        ยกเลิก
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                      >
                        ลบผู้ใช้
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        ชื่อผู้ใช้
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        อีเมล
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        บทบาท
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="user">User (ทั่วไป)</option>
                        <option value="admin">Admin (จัดการระบบได้)</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                      >
                        {modalType === 'create' ? 'สร้างผู้ใช้' : 'บันทึกการแก้ไข'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}