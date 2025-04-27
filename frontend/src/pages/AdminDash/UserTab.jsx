import React from 'react'
import Button from '../../components/Button'
import { SearchBar } from '../../components/SearchBar'
import Dropdown from '../../components/Dropdown'
import ToggleSwitch from '../../components/Toggle'

function UserTab() {
    const toggleState = false
  return (
    <div className="dashboard">
        <h1>Naudotojai</h1>
        <div className="admin-dash-actions">
        <SearchBar onSearch={() => {}} />
        <Dropdown placeholder="Rikiuoti" options={() => {}} onSelect={() => {}}/>
        <ToggleSwitch onToggleChange={() => {}}>{toggleState ? 'Ištrinti kursai' : 'Esami kursai'}</ToggleSwitch>
        </div>
    </div>
  )
}

export default UserTab