import { useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import Navbar from './components/Navbar'
import Profile from './pages/Profile'
import DeviceList from './pages/devices/DeviceList'
import DeviceDetail from './pages/devices/DeviceDetail'
import DeviceEdit from './pages/devices/EditDevice'
import AddParentDevice from './pages/devices/AddParentDevice'
import AddDevice from './pages/devices/AddDevice'



import { Routes, Route } from 'react-router-dom'
import PurchaseList from './pages/purchases/PurchaseList'
import AddPurchase from './pages/purchases/AddPurchase'
import PurchaseDetail from './pages/purchases/PurchaseDetail'
import EditPurchase from './pages/purchases/EditPurchase'
import ParentDeviceList from './pages/devices/ParentDeviceList'
import ParentDeviceView from './pages/devices/ParentDeviceView'
import EditParentDevice from './pages/devices/EditParentDevice'
import ComponentParentView from './pages/devices/ComponentParentView'
import Repairs from './pages/Repairs'
import AddRepair from './pages/AddRepair'
import RepairDetail from './pages/RepairDetail'
import RepairHistory from './pages/RepairHistory'



import DeviceSearch from './pages/devices/DeviceSearch'



function App() {

  return (
    <>
      <Navbar />
      <div className='bg-indigo-600'>
        <Routes>
          <Route path='/' element={<DeviceList />} />
          <Route path='/login' element={<Login />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/user-management' element={<UserManagement />} />

          //device routes
          <Route path='/devices' element={<DeviceList />} />
          <Route path='/devices/:id' element={<DeviceDetail />} />
          <Route path='/devices/edit/:id' element={<DeviceEdit />} />
          <Route path="/devices/add-parent" element={<AddParentDevice />} />
          <Route path="/devices/add" element={<AddDevice />} />

          <Route path="/devices/parents" element={<ParentDeviceList />} />
          <Route path="/devices/parents/:id/edit" element={<EditParentDevice />} />
          <Route path="/devices/parents/:id" element={<ParentDeviceView />} />
          <Route path="/devices/search" element={<DeviceSearch />} />
          <Route path="/devices/component-parent/:id" element={<ComponentParentView />} />



          //purchase routes
          <Route path="/purchases" element={<PurchaseList />} />
          <Route path="/purchases/add" element={<AddPurchase />} />
          <Route path="/purchases/:id" element={<PurchaseDetail />} />
          <Route path="/purchases/edit/:id" element={<EditPurchase />} />

          //repairs routes
          <Route path="/repairs" element={<Repairs />} />
          <Route path="/repairs/add" element={<AddRepair />} />
          <Route path="/repairs/:deviceId/:repairId" element={<RepairDetail />} />
          <Route path="/repairs/history/all" element={<RepairHistory />} />

          <Route path='/profile' element={<Profile />} />

        </Routes>
      </div>
    </>
  )
}

export default App
