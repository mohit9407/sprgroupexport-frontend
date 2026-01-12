'use client'

import { AddEditCustomerAddressModal } from '@/components/admin/AddEditCustomerAddressModal'
import { TanstackTable } from '@/components/admin/TanstackTable'
import {
  deleteCustomerAddress,
  getCustomerAddress,
} from '@/features/customers/customersSlice'
import { createColumnHelper } from '@tanstack/react-table'
import React, { use, useEffect, useState } from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'

const columnHelper = createColumnHelper()

export const addressColumns = ({ onEdit, onDelete }) => [
  columnHelper.accessor((row) => row._id, {
    id: 'id',
    header: 'ID',
    cell: (info) => info.getValue(),
  }),

  columnHelper.accessor((row) => row, {
    id: 'basicInfo',
    header: 'Basic Info',
    cell: (info) => {
      const a = info.getValue()
      return (
        <div className="space-y-1 text-sm">
          {a.company && (
            <div>
              <strong>Company:</strong> {a.company}
            </div>
          )}
          <div>
            <strong>Full Name:</strong> {a.fullName}
          </div>
        </div>
      )
    },
  }),

  columnHelper.accessor((row) => row, {
    id: 'addressInfo',
    header: 'Address Info',
    cell: (info) => {
      const a = info.getValue()
      return (
        <div className="space-y-1 text-sm">
          <div>
            <strong>Street:</strong> {a.address}
          </div>
          <div>
            <strong>Suburb:</strong> {a.suburb}
          </div>
          <div>
            <strong>Postcode:</strong> {a.zip}
          </div>
          <div>
            <strong>City:</strong> {a.city}
          </div>
          <div>
            <strong>State:</strong> {a.state}
          </div>
          <div>
            <strong>Country:</strong> {a.country}
          </div>
        </div>
      )
    },
  }),

  columnHelper.accessor((row) => row, {
    id: 'actions',
    header: 'Action',
    enableSorting: false,
    cell: (info) => {
      const row = info.getValue()
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="p-1 text-blue-600 hover:bg-gray-300 rounded"
            title="Edit"
          >
            <FaEdit />
          </button>

          <button
            onClick={() => onDelete(row)}
            className="p-1 text-red-600 hover:bg-gray-300 rounded"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      )
    },
  }),
]

export const CustomerAddressPage = ({ params }) => {
  const { _id: userId } = use(params)
  const dispatch = useDispatch()
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(false)
  const {
    data: addresses,
    isLoading,
    isError,
  } = useSelector((state) => state.customers?.addresses)

  const handleEdit = (row) => {
    setEditData(row)
    setShowModal(true)
  }

  const handleDelete = () => {
    dispatch(deleteCustomerAddress())
    setShowModal(false)
  }

  useEffect(() => {
    dispatch(getCustomerAddress({ userId }))
  }, [userId])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Listing Customer Addresses</h2>
        <button
          onClick={() => {
            setEditData(null)
            setShowModal(true)
          }}
          className="bg-sky-600 text-white px-4 py-2 rounded"
        >
          Add Address
        </button>
      </div>

      <TanstackTable
        columns={addressColumns({
          onEdit: handleEdit,
          onDelete: handleDelete,
        })}
        data={addresses?.[userId] || []}
        isLoading={isLoading}
        mode="client"
      />

      {showModal && (
        <AddEditCustomerAddressModal
          userId={userId}
          defaultValues={editData}
          onClose={() => setShowModal(false)}
          onSuccess={() => dispatch(getCustomerAddress({ userId }))}
        />
      )}
    </div>
  )
}

export default CustomerAddressPage
