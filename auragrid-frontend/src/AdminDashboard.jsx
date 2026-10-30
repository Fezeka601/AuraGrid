import { useEffect, useState } from 'react'
import './AdminDashboard.css'

const API_URL = 'http://localhost:8080'

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
})

function formatPrice(amount) {
  return currencyFormatter.format(Number(amount ?? 0))
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

async function readResponse(response) {
  const text = await response.text()

  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}.`
    )
  }

  return data
}

export default function AdminDashboard({ token, onBack }) {
  const [dashboard, setDashboard] = useState(null)
  const [orders, setOrders] = useState([])
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [ordersError, setOrdersError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [statusChanges, setStatusChanges] = useState({})
  const [actionMessage, setActionMessage] = useState('')

  async function loadDashboard() {
    setLoadingDashboard(true)
    setDashboardError('')

    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await readResponse(response)
      setDashboard(data)
    } catch (error) {
      setDashboardError(
        error.message || 'Unable to load dashboard statistics.'
      )
    } finally {
      setLoadingDashboard(false)
    }
  }

  async function loadOrders() {
    setLoadingOrders(true)
    setOrdersError('')

    try {
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await readResponse(response)

      if (!Array.isArray(data)) {
        throw new Error('The server returned an unexpected orders response.')
      }

      setOrders(data)

      setStatusChanges(
        Object.fromEntries(
          data.map((order) => [
            order.orderId,
            order.status,
          ])
        )
      )
    } catch (error) {
      setOrdersError(error.message || 'Unable to load orders.')
    } finally {
      setLoadingOrders(false)
    }
  }

  async function refreshDashboard() {
    await Promise.all([loadDashboard(), loadOrders()])
  }

  useEffect(() => {
    if (!token) {
      setDashboardError('Please log in to access the admin dashboard.')
      setOrdersError('Please log in to access orders.')
      setLoadingDashboard(false)
      setLoadingOrders(false)
      return
    }

    loadDashboard()
    loadOrders()
  }, [token])

  async function updateOrderStatus(orderId) {
    const newStatus = statusChanges[orderId]

    if (!newStatus) {
      setActionMessage('Please select an order status.')
      return
    }

    const currentOrder = orders.find(
      (order) => order.orderId === orderId
    )

    if (!currentOrder || currentOrder.status === newStatus) {
      setActionMessage('Choose a different status before updating.')
      return
    }

    setUpdatingOrderId(orderId)
    setActionMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      )

      const updatedOrder = await readResponse(response)

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, ...updatedOrder }
            : order
        )
      )

      setStatusChanges((currentChanges) => ({
        ...currentChanges,
        [orderId]: updatedOrder.status ?? newStatus,
      }))

      setActionMessage(`Order #${orderId} status updated successfully.`)

      await loadDashboard()
    } catch (error) {
      setActionMessage(
        error.message || `Could not update order #${orderId}.`
      )

      await loadOrders()
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <main className="admin-dashboard">
      <section className="admin-heading">
        <div>
          <p className="admin-eyebrow">AURAGRID MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage your store, monitor sales and track customer orders.
          </p>
        </div>

        <button
          type="button"
          className="admin-back-button"
          onClick={onBack}
        >
          Back to store
        </button>
      </section>

      <section className="admin-stats" aria-label="Store statistics">
        <article className="admin-stat-card">
          <span className="admin-stat-label">Total products</span>
          <strong>
            {loadingDashboard
              ? '…'
              : dashboard?.totalProducts ?? '—'}
          </strong>
          <span className="admin-stat-note">Products in your catalogue</span>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-label">Total orders</span>
          <strong>
            {loadingDashboard
              ? '…'
              : dashboard?.totalOrders ?? '—'}
          </strong>
          <span className="admin-stat-note">Orders recorded by the store</span>
        </article>

        <article className="admin-stat-card">
          <span className="admin-stat-label">Total customers</span>
          <strong>
            {loadingDashboard
              ? '…'
              : dashboard?.totalCustomers ?? '—'}
          </strong>
          <span className="admin-stat-note">Registered customer accounts</span>
        </article>

        <article className="admin-stat-card admin-revenue-card">
          <span className="admin-stat-label">Total revenue</span>
          <strong>
            {loadingDashboard
              ? '…'
              : dashboard
                ? formatPrice(dashboard.totalRevenue)
                : '—'}
          </strong>
          <span className="admin-stat-note">
            Reported by the backend
          </span>
        </article>
      </section>

      {dashboardError && (
        <div className="admin-message admin-error" role="alert">
          <span>{dashboardError}</span>
          <button type="button" onClick={loadDashboard}>
            Retry
          </button>
        </div>
      )}

      <section className="admin-orders-section">
        <div className="admin-section-heading">
          <div>
            <p className="admin-eyebrow">ORDER MANAGEMENT</p>
            <h2>Customer Orders</h2>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={refreshDashboard}
            disabled={loadingDashboard || loadingOrders}
          >
            Refresh data
          </button>
        </div>

        {actionMessage && (
          <p className="admin-action-message" role="status">
            {actionMessage}
          </p>
        )}

        {ordersError && (
          <div className="admin-message admin-error" role="alert">
            <span>{ordersError}</span>
            <button type="button" onClick={loadOrders}>
              Retry
            </button>
          </div>
        )}

        {loadingOrders ? (
          <p className="admin-empty-state">Loading customer orders…</p>
        ) : ordersError ? null : orders.length === 0 ? (
          <p className="admin-empty-state">
            No orders have been recorded yet.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Current status</th>
                  <th>Date</th>
                  <th>Update status</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="admin-order-number">
                      #{order.orderId}
                    </td>

                    <td>{order.username}</td>

                    <td className="admin-order-total">
                      {formatPrice(order.totalAmount)}
                    </td>

                    <td>
                      <span
                        className={`admin-status status-${String(
                          order.status
                        ).toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td>
                      <div className="admin-status-controls">
                        <select
                          aria-label={`New status for order ${order.orderId}`}
                          value={
                            statusChanges[order.orderId] ?? order.status
                          }
                          onChange={(event) =>
                            setStatusChanges((currentChanges) => ({
                              ...currentChanges,
                              [order.orderId]: event.target.value,
                            }))
                          }
                          disabled={updatingOrderId === order.orderId}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.orderId)}
                          disabled={
                            updatingOrderId === order.orderId ||
                            (statusChanges[order.orderId] ?? order.status) ===
                              order.status
                          }
                        >
                          {updatingOrderId === order.orderId
                            ? 'Saving…'
                            : 'Save'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="admin-footnote">
          Revenue and order information come from your backend. Revenue is
          not the same as profit.
        </p>
      </section>
    </main>
  )
}