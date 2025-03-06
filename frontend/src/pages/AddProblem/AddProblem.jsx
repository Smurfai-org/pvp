import React from 'react'
import { TextBox } from '../../components/textBox/TextBox'
import Dropdown from '../../components/Dropdown'
import Button from '../../components/Button'

function AddProblem() {
  return (
    <>
        <TextBox text='Problemos pavadinimas'></TextBox>
        <TextBox text='Problemos aprašymas'></TextBox>
        <TextBox text='Problemos sprendiniai'></TextBox>
        <Dropdown options={['Lengvas', 'Sudėtingas', 'Sunkus']} placeholder='Sudėtingumas'></Dropdown>
        <Button>Išsaugoti</Button>
    </>
  )
}

export default AddProblem