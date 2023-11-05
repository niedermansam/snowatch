'use client'
import React from 'react'
import ReactModal from 'react-modal'

ReactModal.setAppElement('#modal')

function ModalProvider() {
  return <div id="modal"/>
}

export default ModalProvider