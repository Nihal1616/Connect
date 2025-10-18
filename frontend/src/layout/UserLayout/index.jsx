import NavBarComponent from '@/Components/Navbar'
import React from 'react'

export default function UserLayout({children}) {
  return (
    <div>
      <NavBarComponent/>
      {children}
    </div>
  )
}
