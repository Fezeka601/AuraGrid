import { useEffect, useState } from 'react'
import './App.css'
import AdminDashboard from './AdminDashboard'

const API_URL = 'http://localhost:8080'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80'

const collections = [
  {
    name: 'Dresses',
    description: 'Made for your moments',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=85',
    number: '01',
  },
  {
    name: 'Everyday Essentials',
    description: 'Your style, every day',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85',
    number: '02',
  },
  {
    name: 'Statement Pieces',
    description: 'Be remembered',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85',
    number: '03',
  },
]

const EMPTY_ADDRESS = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'South Africa',
}

const formatPrice = (price) =>
  new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(Number(price) || 0)

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
    const message =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : '') ||
      `Request failed (${response.status})`

    throw new Error(message)
  }

  return data
}

function normalizeCartItems(data) {
  const source = Array.isArray(data)
    ? data
    : data?.items ??
      data?.cartItems ??
      data?.cartItemResponses ??
      data?.products ??
      []

  if (!Array.isArray(source)) return []

  return source.map((item) => {
    const product = item.product ?? item.productResponse ?? item
    const quantity = Number(item.quantity ?? item.cartQuantity ?? 1)

    return {
      ...item,
      productId:
        item.productId ?? product.productId ?? product.id ?? item.id,
      name:
        item.productName ??
        item.name ??
        product.name ??
        product.productName ??
        'AuraGrid product',
      description: item.description ?? product.description ?? '',
      imageUrl:
        item.imageUrl ??
        item.productImageUrl ??
        product.imageUrl ??
        FALLBACK_IMAGE,
      price: Number(
        item.price ??
          item.unitPrice ??
          item.productPrice ??
          product.price ??
          0
      ),
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      stockQuantity: Number(
        item.stockQuantity ?? product.stockQuantity ?? 999
      ),
      categoryName:
        item.categoryName ?? product.categoryName ?? 'Fashion',
    }
  })
}

function App() {
  

  // Order history state
  const [showOrderHistory, setShowOrderHistory] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false)
const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [reviewsByProduct, setReviewsByProduct] = useState({})
const [expandedReviewProductId, setExpandedReviewProductId] = useState(null)
const [reviewForms, setReviewForms] = useState({})
const [reviewMessages, setReviewMessages] = useState({})
const [reviewLoadingProductId, setReviewLoadingProductId] = useState(null)
const [reviewSubmittingProductId, setReviewSubmittingProductId] = useState(null)
const [reviewErrors, setReviewErrors] = useState({})
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [categoriesError, setCategoriesError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
const [role, setRole] = useState(
  sessionStorage.getItem('auraRole') || ''
)
  const [token, setToken] = useState(
    () => sessionStorage.getItem('auraToken') || ''
  )
  const [username, setUsername] = useState(
    () => sessionStorage.getItem('auraUsername') || ''
  )
const [stylistOpen, setStylistOpen] = useState(false)
const [stylistOccasion, setStylistOccasion] = useState('Everyday')
const [stylistPreference, setStylistPreference] = useState('Casual')
const [stylistColour, setStylistColour] = useState('Any colour')
const [stylistBudget, setStylistBudget] = useState('1500')
const [stylistResults, setStylistResults] = useState([])
const [stylistMessage, setStylistMessage] = useState('')
const [showAdminDashboard, setShowAdminDashboard] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [cartMessage, setCartMessage] = useState('')
  const [addingProductId, setAddingProductId] = useState(null)

  const [showBag, setShowBag] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState('')
  const [updatingProductId, setUpdatingProductId] = useState(null)

  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [addressFormOpen, setAddressFormOpen] = useState(false)
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS)
  const [addressLoading, setAddressLoading] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState(null)
  const [paymentResult, setPaymentResult] = useState(null)
  const [cartClearWarning, setCartClearWarning] = useState('')
  const [authMode, setAuthMode] = useState('login')

const [registerUsername, setRegisterUsername] = useState('')
const [registerEmail, setRegisterEmail] = useState('')
const [registerPassword, setRegisterPassword] = useState('')
const [registerFirstName, setRegisterFirstName] = useState('')
const [registerLastName, setRegisterLastName] = useState('')
const [registerMessage, setRegisterMessage] = useState('')
const [isRegistering, setIsRegistering] = useState(false)

  const authHeaders = (activeToken = token) => ({
    Authorization: `Bearer ${activeToken}`,
    'Content-Type': 'application/json',
  })

  useEffect(() => {
  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}/api/products`)
      setProducts((await readResponse(response)) || [])
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const response = await fetch(`${API_URL}/api/categories`)
      const data = await readResponse(response)

      if (!Array.isArray(data)) {
        throw new Error('Unexpected categories response.')
      }

      setCategories(data)
      setCategoriesError('')
    } catch (err) {
      setCategoriesError(
        err.message || 'Unable to load product categories.'
      )
    }
  }

  loadProducts()
  loadCategories()
}, [])
  async function handleLogin(event) {
    event.preventDefault()
    setLoginMessage('')
    setIsLoggingIn(true)


    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      })

      const data = await readResponse(response)

      if (!data?.token || !data?.username || !data?.role) {
  throw new Error(
    'The login response did not contain a token, username, and role.'
  )
}

      sessionStorage.setItem('auraToken', data.token)
      sessionStorage.setItem('auraUsername', data.username)
sessionStorage.setItem('auraRole', data.role)

setToken(data.token)
setUsername(data.username)
setRole(data.role)
      setLoginPassword('')
      setLoginOpen(false)
      setLoginMessage('')
      setCartMessage(`Welcome back, ${data.username}.`)

      if (showBag) await loadCart(data.token, data.username)
      if (showCheckout) await loadAddresses(data.token, data.username)
      if (showOrderHistory) {
        await loadOrders(data.token, data.username)
      }
    } catch (err) {
      setLoginMessage(err.message || 'Unable to log in.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  async function handleRegister(event) {
  event.preventDefault()
  setRegisterMessage('')
  setLoginMessage('')

  if (registerUsername.trim().length < 3) {
    setRegisterMessage('Username must contain at least 3 characters.')
    return
  }

  if (registerPassword.length < 8) {
    setRegisterMessage('Password must contain at least 8 characters.')
    return
  }

  setIsRegistering(true)

  try {
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerUsername.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        firstName: registerFirstName.trim(),
        lastName: registerLastName.trim(),
      }),
    })

    if (response.status === 409) {
      throw new Error(
        'That username or email is already registered. Please use different details or sign in.'
      )
    }

    const data = await readResponse(response)

    setLoginMessage(
      `Account created successfully for ${data.username}. You can now sign in.`
    )

    setLoginUsername(data.username)
    setLoginPassword('')

    setRegisterUsername('')
    setRegisterEmail('')
    setRegisterPassword('')
    setRegisterFirstName('')
    setRegisterLastName('')

    setAuthMode('login')
  } catch (err) {
    setRegisterMessage(
      err.message || 'Unable to create your account. Please try again.'
    )
  } finally {
    setIsRegistering(false)
  }
}

  function handleLogout() {
    
    sessionStorage.removeItem('auraToken')
    sessionStorage.removeItem('auraUsername')
sessionStorage.removeItem('auraRole')
setRole('')
    setToken('')
    setUsername('')
    setLoginPassword('')
    setLoginOpen(false)
    setLoginMessage('')
    setCartItems([])
    setCartError('')
    setCartMessage('You have logged out.')
    setShowCheckout(false)
    setShowBag(false)
    setShowOrderHistory(false)
    setOrders([])
    setSelectedOrder(null)
    setOrdersError('')
    setAddresses([])
    setPendingOrderId(null)
    setPaymentResult(null)
    setRole('')
setShowAdminDashboard(false)
  }

  async function loadCart(
    activeToken = token,
    activeUsername = username
  ) {
    if (!activeToken || !activeUsername) {
      setCartItems([])
      setCartError('Please sign in to view your shopping bag.')
      return
    }

    setCartLoading(true)
    setCartError('')

    try {
      const response = await fetch(
        `${API_URL}/api/cart/${encodeURIComponent(activeUsername)}`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      )

      setCartItems(normalizeCartItems(await readResponse(response)))
    } catch (err) {
      setCartError(err.message || 'Unable to load your shopping bag.')
    } finally {
      setCartLoading(false)
    }
  }

  async function openBag() {
    setShowBag(true)
    setShowCheckout(false)
    setShowOrderHistory(false)
    setSelectedOrder(null)
    setCartMessage('')
    setCartError('')

    if (!token || !username) {
      setCartItems([])
      setCartError('Please sign in to view your shopping bag.')
      setLoginOpen(true)
      setLoginMessage('Sign in to see the items in your bag.')
      return
    }

    await loadCart()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleAddToCart(productId) {
    setCartMessage('')

    if (!token || !username) {
      setLoginOpen(true)
      setLoginMessage('Please log in before adding items to your bag.')
      return
    }

    setAddingProductId(productId)

    try {
      const params = new URLSearchParams({
        productId: String(productId),
        quantity: '1',
      })

      const response = await fetch(
        `${API_URL}/api/cart/${encodeURIComponent(username)}/add?${params}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      await readResponse(response)
      setCartMessage('Item added to your bag.')

      if (showBag) await loadCart()
    } catch (err) {
      setCartMessage(`Could not add item: ${err.message}`)
    } finally {
      setAddingProductId(null)
    }
  }

async function loadProductReviews(productId, activeToken = token) {
  if (!activeToken) {
    setReviewErrors((current) => ({
      ...current,
      [productId]: 'Please sign in to view product reviews.',
    }))
    setLoginOpen(true)
    setLoginMessage('Sign in to view and write product reviews.')
    return
  }

  setReviewLoadingProductId(productId)

  setReviewErrors((current) => ({
    ...current,
    [productId]: '',
  }))

  try {
    const response = await fetch(
      `${API_URL}/api/reviews/product/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      }
    )

    const data = await readResponse(response)

    if (!Array.isArray(data)) {
      throw new Error('The server returned an unexpected reviews response.')
    }

    setReviewsByProduct((current) => ({
      ...current,
      [productId]: data,
    }))
  } catch (err) {
    setReviewErrors((current) => ({
      ...current,
      [productId]: err.message || 'Unable to load reviews.',
    }))
  } finally {
    setReviewLoadingProductId(null)
  }
}

function toggleProductReviews(productId) {
  if (expandedReviewProductId === productId) {
    setExpandedReviewProductId(null)
    return
  }

  setExpandedReviewProductId(productId)

  if (!token) {
    setLoginOpen(true)
    setLoginMessage('Sign in to view and write product reviews.')
    return
  }

  // Fetch reviews when this product's reviews have not been loaded yet.
  if (!Object.prototype.hasOwnProperty.call(reviewsByProduct, productId)) {
    loadProductReviews(productId)
  }
}

function handleReviewFieldChange(productId, field, value) {
  setReviewForms((current) => ({
    ...current,
    [productId]: {
      rating: current[productId]?.rating ?? 5,
      comment: current[productId]?.comment ?? '',
      [field]: value,
    },
  }))
}

async function handleSubmitReview(event, productId) {
  event.preventDefault()

  if (!token || !username) {
    setLoginOpen(true)
    setLoginMessage('Please sign in before submitting a review.')
    return
  }

  const form = reviewForms[productId] ?? {
    rating: 5,
    comment: '',
  }

  const rating = Number(form.rating)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    setReviewMessages((current) => ({
      ...current,
      [productId]: 'Please select a rating from 1 to 5.',
    }))
    return
  }

  const existingReviews = reviewsByProduct[productId] ?? []
  const alreadyReviewed = existingReviews.some(
    (review) => review.username === username
  )

  if (alreadyReviewed) {
    setReviewMessages((current) => ({
      ...current,
      [productId]: 'You have already reviewed this product.',
    }))
    return
  }

  setReviewSubmittingProductId(productId)

  setReviewMessages((current) => ({
    ...current,
    [productId]: '',
  }))

  setReviewErrors((current) => ({
    ...current,
    [productId]: '',
  }))

  try {
    const response = await fetch(
      `${API_URL}/api/reviews/${encodeURIComponent(username)}/${productId}`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          rating,
          comment: form.comment.trim(),
        }),
      }
    )

    const savedReview = await readResponse(response)

    // Refresh from the backend so the displayed list stays authoritative.
    await loadProductReviews(productId)

    setReviewForms((current) => ({
      ...current,
      [productId]: {
        rating: 5,
        comment: '',
      },
    }))

    setReviewMessages((current) => ({
      ...current,
      [productId]: 'Thank you! Your review has been submitted.',
    }))
  } catch (err) {
    setReviewMessages((current) => ({
      ...current,
      [productId]:
        err.message || 'Unable to submit your review. Please try again.',
    }))
  } finally {
    setReviewSubmittingProductId(null)
  }
}

  async function updateQuantity(item, newQuantity) {
    if (!token || !username) {
      setCartError('Please sign in to update your bag.')
      return
    }

    if (newQuantity < 1) {
      await removeItem(item)
      return
    }

    if (newQuantity > item.stockQuantity) {
      setCartError(
        `Only ${item.stockQuantity} of ${item.name} are available.`
      )
      return
    }

    setUpdatingProductId(item.productId)
    setCartError('')

    try {
      const params = new URLSearchParams({
        productId: String(item.productId),
        quantity: String(newQuantity),
      })

      const response = await fetch(
        `${API_URL}/api/cart/${encodeURIComponent(username)}/update?${params}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setCartItems(normalizeCartItems(await readResponse(response)))
      setCartMessage('Bag updated.')
    } catch (err) {
      setCartError(err.message || 'Could not update this item.')
    } finally {
      setUpdatingProductId(null)
    }
  }

  async function removeItem(item) {
    if (!token || !username) {
      setCartError('Please sign in to update your bag.')
      return
    }

    setUpdatingProductId(item.productId)
    setCartError('')

    try {
      const params = new URLSearchParams({
        productId: String(item.productId),
      })

      const response = await fetch(
        `${API_URL}/api/cart/${encodeURIComponent(username)}/remove?${params}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setCartItems(normalizeCartItems(await readResponse(response)))
      setCartMessage('Item removed from your bag.')
    } catch (err) {
      setCartError(err.message || 'Could not remove this item.')
    } finally {
      setUpdatingProductId(null)
    }
  }

  async function loadAddresses(
    activeToken = token,
    activeUsername = username
  ) {
    if (!activeToken || !activeUsername) return

    setAddressLoading(true)
    setCheckoutError('')

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${encodeURIComponent(activeUsername)}`,
        { headers: { Authorization: `Bearer ${activeToken}` } }
      )

      const data = await readResponse(response)
      const list = Array.isArray(data) ? data : []

      setAddresses(list)
      setSelectedAddressId((current) => {
        if (
          current &&
          list.some((address) => String(address.id) === String(current))
        ) {
          return current
        }

        return list.length ? String(list[0].id) : ''
      })

      if (list.length === 0) setAddressFormOpen(true)
    } catch (err) {
      setCheckoutError(
        `Could not load your saved addresses: ${err.message}`
      )
    } finally {
      setAddressLoading(false)
    }
  }

  async function openCheckout() {
    if (!token || !username) {
      setLoginOpen(true)
      setLoginMessage('Please sign in before checking out.')
      return
    }

    if (cartItems.length === 0) {
      setCartError('Your bag is empty.')
      return
    }

    setShowBag(false)
    setShowOrderHistory(false)
    setShowCheckout(true)
    setCheckoutError('')
    setCheckoutMessage('')
    setCartClearWarning('')
    setPaymentResult(null)

    await loadAddresses()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleAddressFieldChange(event) {
    const { name, value } = event.target
    setAddressForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSaveAddress(event) {
    event.preventDefault()
    setSavingAddress(true)
    setCheckoutError('')
    setCheckoutMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/addresses/${encodeURIComponent(username)}`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(addressForm),
        }
      )

      const savedAddress = await readResponse(response)

      if (savedAddress?.id == null) {
        await loadAddresses()
        setAddressForm(EMPTY_ADDRESS)
        setAddressFormOpen(false)
        setCheckoutMessage(
          'Address saved. Select it from your saved addresses.'
        )
        return
      }

      setAddresses((current) => [
        ...current.filter((address) => address.id !== savedAddress.id),
        savedAddress,
      ])

      setSelectedAddressId(String(savedAddress.id))
      setAddressForm(EMPTY_ADDRESS)
      setAddressFormOpen(false)
      setCheckoutMessage('Shipping address saved.')
    } catch (err) {
      setCheckoutError(`Could not save your address: ${err.message}`)
    } finally {
      setSavingAddress(false)
    }
  }

  async function handlePlaceOrder(event) {
    event.preventDefault()
    setCheckoutError('')
    setCheckoutMessage('')
    setCartClearWarning('')

    if (!selectedAddressId) {
      setCheckoutError('Please select or add a shipping address.')
      return
    }

    if (!token || !username) {
      setCheckoutError('Your session is missing. Please sign in again.')
      return
    }

    setPlacingOrder(true)

    try {
      let orderId = pendingOrderId

      // Reuse an existing order when retrying payment.
      if (!orderId) {
        const orderResponse = await fetch(
          `${API_URL}/api/orders/${encodeURIComponent(username)}`,
          {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
              shippingAddressId: Number(selectedAddressId),
            }),
          }
        )

        const order = await readResponse(orderResponse)
        orderId = order?.orderId ?? order?.id

        if (orderId == null) {
          throw new Error(
            'The order endpoint did not return an order ID. Check OrderResponse before retrying.'
          )
        }

        setPendingOrderId(orderId)
        setCheckoutMessage(
          `Order #${orderId} created. Submitting payment...`
        )
      }

      const paymentResponse = await fetch(
        `${API_URL}/api/payments/${encodeURIComponent(username)}/${orderId}`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ paymentMethod }),
        }
      )

      const payment = await readResponse(paymentResponse)
      setPaymentResult({
        ...payment,
        orderId: payment?.orderId ?? orderId,
      })

      const status = String(payment?.paymentStatus ?? '').toUpperCase()

      if (status === 'SUCCESS') {
        setCheckoutMessage('Payment was confirmed by AuraGrid.')
        setPendingOrderId(null)

        try {
          const clearResponse = await fetch(
            `${API_URL}/api/cart/${encodeURIComponent(username)}/clear`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            }
          )

          if (!clearResponse.ok) {
            setCartClearWarning(
              'Payment succeeded, but the bag could not be cleared automatically. Please reopen your bag and check it.'
            )
          } else {
            setCartItems([])
          }
        } catch {
          setCartClearWarning(
            'Payment succeeded, but the bag could not be cleared automatically. Please reopen your bag and check it.'
          )
        }
      } else {
        setCheckoutMessage(
          `Payment status: ${payment?.paymentStatus ?? 'Not provided'}. Your order is retained so you can retry payment.`
        )
      }
    } catch (err) {
      setCheckoutError(err.message || 'Checkout could not be completed.')
    } finally {
      setPlacingOrder(false)
    }
  }

  // Load all orders belonging to the signed-in user.
  async function loadOrders(
    activeToken = token,
    activeUsername = username
  ) {
    if (!activeToken || !activeUsername) {
      setOrders([])
      setOrdersError('Please sign in to view your order history.')
      return
    }

    setOrdersLoading(true)
    setOrdersError('')

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${encodeURIComponent(activeUsername)}`,
        {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        }
      )

      const data = await readResponse(response)

      if (!Array.isArray(data)) {
        throw new Error(
          'The server returned an unexpected order history response.'
        )
      }

      setOrders(data)
    } catch (err) {
      setOrdersError(err.message || 'Unable to load your order history.')
    } finally {
      setOrdersLoading(false)
    }
  }

  async function openOrderHistory() {
    setShowBag(false)
    setShowCheckout(false)
    setShowOrderHistory(true)
    setSelectedOrder(null)
    setCartMessage('')
    setOrdersError('')

    if (!token || !username) {
      setOrders([])
      setOrdersError('Please sign in to view your order history.')
      setLoginOpen(true)
      setLoginMessage('Sign in to see your previous orders.')
      return
    }

    await loadOrders()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Load one order using the existing order-details endpoint.
  async function openOrderDetails(orderId) {
    if (!token || !username) {
      setOrdersError('Please sign in to view order details.')
      return
    }

    setOrderDetailsLoading(true)
    setOrdersError('')
    setSelectedOrder(null)

    try {
      const response = await fetch(
        `${API_URL}/api/orders/${encodeURIComponent(username)}/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const order = await readResponse(response)
      setSelectedOrder(order)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setOrdersError(err.message || 'Unable to load this order.')
    } finally {
      setOrderDetailsLoading(false)
    }
  }

  function formatOrderDate(dateValue) {
    if (!dateValue) return 'Date unavailable'

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) return 'Date unavailable'

    return new Intl.DateTimeFormat('en-ZA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  function returnToOrderHistory() {
    setSelectedOrder(null)
    setOrdersError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function returnToShop() {
    setShowOrderHistory(false)
    setSelectedOrder(null)
    setShowBag(false)
    setShowCheckout(false)
    etShowAdminDashboard(false)
  setShowOrderHistory(false)
  setSelectedOrder(null)
  setShowBag(false)
  setShowCheckout(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const getProductCategoryId = (product) =>
  product.categoryId ??
  product.category?.id ??
  product.category?.categoryId ??
  product.categoryResponse?.id ??
  null

const getProductCategoryName = (product) => {
  const categoryId = getProductCategoryId(product)

  return (
    product.categoryName ??
    product.category?.name ??
    product.categoryResponse?.name ??
    categories.find(
      (category) => String(category.id) === String(categoryId)
    )?.name ??
    'Fashion'
  )
}

const filteredProducts =
  selectedCategoryId === 'all'
    ? products
    : products.filter((product) => {
        const productCategoryId = getProductCategoryId(product)

        if (productCategoryId != null) {
          return String(productCategoryId) === selectedCategoryId
        }

        const productCategoryName = getProductCategoryName(product)

        const category = categories.find(
          (item) => item.name === productCategoryName
        )

        return String(category?.id) === selectedCategoryId
      })

      function getStylistRecommendations(event) {
  event.preventDefault()

  setStylistMessage('')
  setStylistResults([])

  const budget = Number(stylistBudget)

  if (!Number.isFinite(budget) || budget <= 0) {
    setStylistMessage('Please enter a valid budget greater than zero.')
    return
  }

  if (!Array.isArray(products)) {
    setStylistMessage(
      'The product catalogue is not available yet. Please try again.'
    )
    return
  }

  const selectedColour = stylistColour.toLowerCase()
  const selectedStyle = stylistPreference.toLowerCase()
  const selectedOccasion = stylistOccasion.toLowerCase()

  const rankedProducts = products
    .filter((product) => {
      const price = Number(product.price)
      const stock = Number(product.stock ?? 0)

      return (
        Number.isFinite(price) &&
        price >= 0 &&
        price <= budget &&
        stock > 0
      )
    })
    .map((product) => {
      const category =
        typeof product.category === 'string'
          ? product.category
          : product.category?.name ?? product.categoryName ?? ''

      const searchableText = [
        product.name,
        product.description,
        category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      let score = 0

      if (
        selectedStyle !== 'any style' &&
        searchableText.includes(selectedStyle)
      ) {
        score += 3
      }

      if (
        selectedOccasion !== 'everyday' &&
        searchableText.includes(selectedOccasion)
      ) {
        score += 2
      }

      if (
        selectedColour !== 'any colour' &&
        searchableText.includes(selectedColour)
      ) {
        score += 3
      }

      return {
        product,
        score,
      }
    })
    .sort((a, b) => b.score - a.score)

  const recommendations = rankedProducts
    .slice(0, 4)
    .map(({ product }) => product)

  setStylistResults(recommendations)

  if (recommendations.length === 0) {
    setStylistMessage(
      'No in-stock products were found within your budget. Try increasing your budget or changing your preferences.'
    )
    return
  }

  setStylistMessage(
    `We found ${recommendations.length} product${
      recommendations.length === 1 ? '' : 's'
    } for you to explore.`
  )
}

function handleCollectionClick(collectionName) {
  const matchingCategory = categories.find(
    (category) =>
      category.name.toLowerCase() === collectionName.toLowerCase()
  )

  setSelectedCategoryId(
    matchingCategory ? String(matchingCategory.id) : 'all'
  )

  returnToShop()
}

  return (
    <div className="site-wrapper">
      <div className="announcement-bar">
        A NEW SEASON. A NEW PERSPECTIVE. <span>DISCOVER AURAGRID</span>
      </div>

      <header className="site-header">
        <a
          className="brand"
          href="#"
          aria-label="AuraGrid home"
          onClick={returnToShop}
        >
          AURA<span>GRID</span>
          <small>YOUR STYLE, REDEFINED</small>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#products" onClick={returnToShop}>Shop</a>
          <a href="#collections" onClick={returnToShop}>Collections</a>
          <a href="#stylist" onClick={returnToShop}>AI Stylist</a>
          <a href="#about" onClick={returnToShop}>Our Story</a>
        </nav>

        <div className="header-actions">
          <button
            className="text-action account-action"
            type="button"
            onClick={() => {
              setLoginOpen(!loginOpen)
              setLoginMessage('')
            }}
          >
            {token ? username : 'Account'}
          </button>

          {token && (
            <>
              <button
                className="text-action"
                type="button"
                onClick={openOrderHistory}
              >
                Orders
              </button>

{role === 'ADMIN' && (
  <button
    className="text-action"
    type="button"
    onClick={() => {
      setShowAdminDashboard(true)
      setShowBag(false)
      setShowCheckout(false)
      setShowOrderHistory(false)
      setSelectedOrder(null)
      setLoginOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }}
  >
    Admin Dashboard
  </button>
)}
              <button
                className="text-action"
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          )}

          <button className="bag-button" type="button" onClick={openBag}>
            Bag ({cartCount})
          </button>
        </div>
      </header>

      {loginOpen && (
  <section className="auth-panel" aria-label="AuraGrid account">
    <div className="auth-panel-heading">
      <div>
        <p className="eyebrow">YOUR AURAGRID ACCOUNT</p>
        <h2>
          {token ? (
            <>Your <em>account.</em></>
          ) : authMode === 'register' ? (
            <>Join <em>AuraGrid.</em></>
          ) : (
            <>Welcome <em>back.</em></>
          )}
        </h2>
      </div>

      <button
        className="auth-close"
        type="button"
        aria-label="Close account panel"
        onClick={() => {
          setLoginOpen(false)
          setLoginMessage('')
          setRegisterMessage('')
        }}
      >
        ×
      </button>
    </div>

    {token ? (
      <div>
        <p>You are logged in as {username}.</p>

        <button
          className="add-to-cart-button"
          type="button"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    ) : authMode === 'register' ? (
      <form className="auth-form" onSubmit={handleRegister}>
        <label htmlFor="register-first-name">First name (optional)</label>
        <input
          id="register-first-name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          maxLength={100}
          value={registerFirstName}
          onChange={(event) => setRegisterFirstName(event.target.value)}
        />

        <label htmlFor="register-last-name">Last name (optional)</label>
        <input
          id="register-last-name"
          name="lastName"
          type="text"
          autoComplete="family-name"
          maxLength={100}
          value={registerLastName}
          onChange={(event) => setRegisterLastName(event.target.value)}
        />

        <label htmlFor="register-username">Username</label>
        <input
          id="register-username"
          name="username"
          type="text"
          autoComplete="username"
          minLength={3}
          maxLength={50}
          value={registerUsername}
          onChange={(event) => setRegisterUsername(event.target.value)}
          required
        />

        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={150}
          value={registerEmail}
          onChange={(event) => setRegisterEmail(event.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={255}
          value={registerPassword}
          onChange={(event) => setRegisterPassword(event.target.value)}
          required
        />

        <button
          className="add-to-cart-button"
          type="submit"
          disabled={isRegistering}
        >
          {isRegistering ? 'Creating account...' : 'Create account'}
        </button>

        {registerMessage && (
          <p
            className="catalogue-message"
            role="status"
            aria-live="polite"
          >
            {registerMessage}
          </p>
        )}

        <p className="auth-note">
          Username must be 3–50 characters. Password must be at least
          8 characters.
        </p>

        <p className="auth-note">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => {
              setAuthMode('login')
              setRegisterMessage('')
              setLoginMessage('')
            }}
          >
            Sign in
          </button>
        </p>
      </form>
    ) : (
      <form className="auth-form" onSubmit={handleLogin}>
        <label htmlFor="login-username">Username</label>
        <input
          id="login-username"
          name="username"
          autoComplete="username"
          value={loginUsername}
          onChange={(event) => setLoginUsername(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={loginPassword}
          onChange={(event) => setLoginPassword(event.target.value)}
          required
        />

        <button
          className="add-to-cart-button"
          type="submit"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Signing in...' : 'Sign in'}
        </button>

        {loginMessage && (
          <p className="catalogue-message" role="alert">
            {loginMessage}
          </p>
        )}

        <p className="auth-note">
          Sign in using your existing AuraGrid account.
        </p>

        <p className="auth-note">
          New to AuraGrid?{' '}
          <button
            type="button"
            onClick={() => {
              setAuthMode('register')
              setLoginMessage('')
              setRegisterMessage('')
            }}
          >
            Create an account
          </button>
        </p>
      </form>
    )}
  </section>
)}

      {showAdminDashboard ? (
  <AdminDashboard
    token={token}
    onBack={() => setShowAdminDashboard(false)}
  />
) : showOrderHistory ? (
        <main className="bag-page order-history-page">
          <div className="bag-heading">
            <div>
              <p className="eyebrow">YOUR AURAGRID ACCOUNT</p>
              <h1>Your <em>orders.</em></h1>
              <p>Every order, all in one place.</p>
            </div>

            <div className="order-history-actions">
              <button
                className="button button-dark"
                type="button"
                onClick={() => loadOrders()}
                disabled={ordersLoading}
              >
                {ordersLoading ? 'Refreshing...' : 'Refresh orders'}
              </button>

              <button
                className="button button-dark"
                type="button"
                onClick={returnToShop}
              >
                Continue shopping ↗
              </button>
            </div>
          </div>

          {ordersError && (
            <div className="bag-notice" role="alert">
              <p>{ordersError}</p>
              {!token && (
                <button
                  className="add-to-cart-button"
                  type="button"
                  onClick={() => {
                    setLoginOpen(true)
                    setLoginMessage('Sign in to see your previous orders.')
                  }}
                >
                  Sign in
                </button>
              )}
              {token && (
                <button
                  className="add-to-cart-button"
                  type="button"
                  onClick={() => loadOrders()}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {ordersLoading && (
            <p className="catalogue-message">Loading your orders...</p>
          )}

          {orderDetailsLoading && (
            <p className="catalogue-message">Loading order details...</p>
          )}

          {!ordersLoading && !ordersError && !selectedOrder && (
            <section className="order-history-list">
              {orders.length === 0 ? (
                <div className="empty-bag">
                  <span className="empty-bag-icon">◇</span>
                  <h2>No orders yet.</h2>
                  <p>
                    When you place an order, you will find its details here.
                  </p>
                  <button
                    className="button button-dark"
                    type="button"
                    onClick={returnToShop}
                  >
                    Explore the collection ↗
                  </button>
                </div>
              ) : (
                <>
                  <p className="eyebrow">
                    {orders.length} {orders.length === 1 ? 'ORDER' : 'ORDERS'}
                  </p>

                  {orders.map((order) => (
                    <article className="bag-item order-history-item" key={order.id}>
                      <div className="bag-item-details">
                        <p className="eyebrow">
                          ORDER #{order.id}
                        </p>
                        <h2>{formatOrderDate(order.createdAt)}</h2>
                        <p>
                          Status:{' '}
                          <strong>{order.status || 'Unknown'}</strong>
                        </p>
                        <p>
                          {Array.isArray(order.items)
                            ? `${order.items.length} ${
                                order.items.length === 1 ? 'item' : 'items'
                              }`
                            : 'Order items'}
                        </p>
                        <strong>{formatPrice(order.totalAmount)}</strong>
                      </div>

                      <button
                        className="button button-dark"
                        type="button"
                        onClick={() => openOrderDetails(order.id)}
                        disabled={orderDetailsLoading}
                      >
                        View order
                      </button>
                    </article>
                  ))}
                </>
              )}
            </section>
          )}

          {selectedOrder && (
            <section className="order-details-panel">
              <div className="bag-heading">
                <div>
                  <p className="eyebrow">ORDER DETAILS</p>
                  <h2>Order <em>#{selectedOrder.id}</em></h2>
                  <p>{formatOrderDate(selectedOrder.createdAt)}</p>
                </div>

                <button
                  className="button button-dark"
                  type="button"
                  onClick={returnToOrderHistory}
                >
                  ← Back to orders
                </button>
              </div>

              <div className="confirmation-details">
                <div>
                  <span>Order number</span>
                  <strong>#{selectedOrder.id}</strong>
                </div>
                <div>
                  <span>Order status</span>
                  <strong>{selectedOrder.status || 'Unknown'}</strong>
                </div>
                <div>
                  <span>Shipping address ID</span>
                  <strong>
                    {selectedOrder.shippingAddressId ?? 'Not provided'}
                  </strong>
                </div>
                <div>
                  <span>Order total</span>
                  <strong>{formatPrice(selectedOrder.totalAmount)}</strong>
                </div>
              </div>

              <h2>Items in this order</h2>

              {Array.isArray(selectedOrder.items) &&
              selectedOrder.items.length > 0 ? (
                <div className="bag-items">
                  {selectedOrder.items.map((item, index) => (
                    <article
                      className="bag-item order-history-item"
                      key={`${item.productId ?? item.productName}-${index}`}
                    >
                      <div className="bag-item-details">
                        <h3>{item.productName || 'AuraGrid product'}</h3>
                        <p>Product ID: {item.productId ?? 'Not provided'}</p>
                        <p>Quantity: {item.quantity ?? 0}</p>
                        <p>Unit price: {formatPrice(item.unitPrice)}</p>
                      </div>

                      <strong className="bag-line-total">
                        {formatPrice(
                          item.subtotal ??
                            Number(item.unitPrice || 0) *
                              Number(item.quantity || 0)
                        )}
                      </strong>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="catalogue-message">
                  No item details were returned for this order.
                </p>
              )}

              <div className="summary-total">
                <span>Order total</span>
                <strong>{formatPrice(selectedOrder.totalAmount)}</strong>
              </div>

              <button
                className="button button-dark"
                type="button"
                onClick={returnToOrderHistory}
              >
                ← Back to all orders
              </button>
            </section>
          )}
        </main>
      ) : showCheckout ? (
        <main className="bag-page checkout-page">
          <div className="bag-heading">
            <div>
              <p className="eyebrow">ALMOST YOURS</p>
              <h1>Secure <em>checkout.</em></h1>
              <p>Confirm your delivery details and payment method.</p>
            </div>

            <button
              className="button button-dark"
              type="button"
              onClick={() => {
                setShowCheckout(false)
                setShowBag(true)
              }}
            >
              Back to bag
            </button>
          </div>

          {paymentResult &&
          String(paymentResult.paymentStatus).toUpperCase() === 'SUCCESS' ? (
            <section className="checkout-confirmation">
              <span className="checkout-success-mark">✓</span>
              <p className="eyebrow">PAYMENT CONFIRMED</p>
              <h2>Thank you for your order.</h2>
              <p>Your payment was confirmed by the AuraGrid backend.</p>

              <div className="confirmation-details">
                <div>
                  <span>Order number</span>
                  <strong>#{paymentResult.orderId}</strong>
                </div>
                <div>
                  <span>Payment status</span>
                  <strong>{paymentResult.paymentStatus}</strong>
                </div>
                <div>
                  <span>Payment method</span>
                  <strong>{paymentResult.paymentMethod}</strong>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>{formatPrice(paymentResult.amount)}</strong>
                </div>
                <div>
                  <span>Transaction reference</span>
                  <strong>
                    {paymentResult.transactionReference || 'Not provided'}
                  </strong>
                </div>
              </div>

              {cartClearWarning && (
                <p className="checkout-error" role="alert">
                  {cartClearWarning}
                </p>
              )}

              <button
                className="button button-dark"
                type="button"
                onClick={() => {
                  setShowCheckout(false)
                  setShowBag(false)
                  setPaymentResult(null)
                  setPendingOrderId(null)
                  setCheckoutMessage('')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Continue shopping ↗
              </button>
            </section>
          ) : (
            <div className="checkout-layout">
              <section className="checkout-main">
                <div className="checkout-section">
                  <p className="eyebrow">STEP 01</p>
                  <h2>Delivery address</h2>

                  {addressLoading ? (
                    <p className="catalogue-message">
                      Loading your saved addresses...
                    </p>
                  ) : addresses.length > 0 ? (
                    <div className="address-list">
                      {addresses.map((address) => (
                        <label
                          className={`address-option ${
                            String(selectedAddressId) === String(address.id)
                              ? 'selected'
                              : ''
                          }`}
                          key={address.id}
                        >
                          <input
                            type="radio"
                            name="shippingAddress"
                            value={address.id}
                            checked={
                              String(selectedAddressId) === String(address.id)
                            }
                            onChange={() =>
                              setSelectedAddressId(String(address.id))
                            }
                          />
                          <span>
                            <strong>{address.addressLine1}</strong>
                            {address.addressLine2 && (
                              <span>{address.addressLine2}</span>
                            )}
                            <span>
                              {address.city}, {address.province}{' '}
                              {address.postalCode}
                            </span>
                            <span>{address.country}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    !addressLoading && (
                      <p className="checkout-muted">
                        No saved addresses yet. Add a delivery address below.
                      </p>
                    )
                  )}

                  <button
                    className="checkout-link-button"
                    type="button"
                    onClick={() => setAddressFormOpen(!addressFormOpen)}
                  >
                    {addressFormOpen
                      ? '− Close address form'
                      : '+ Add a new address'}
                  </button>

                  {addressFormOpen && (
                    <form
                      className="address-form"
                      onSubmit={handleSaveAddress}
                    >
                      <label htmlFor="addressLine1">Address line 1 *</label>
                      <input
                        id="addressLine1"
                        name="addressLine1"
                        maxLength="255"
                        value={addressForm.addressLine1}
                        onChange={handleAddressFieldChange}
                        required
                      />

                      <label htmlFor="addressLine2">Address line 2</label>
                      <input
                        id="addressLine2"
                        name="addressLine2"
                        maxLength="255"
                        value={addressForm.addressLine2}
                        onChange={handleAddressFieldChange}
                      />

                      <div className="checkout-form-grid">
                        <div>
                          <label htmlFor="city">City *</label>
                          <input
                            id="city"
                            name="city"
                            maxLength="100"
                            value={addressForm.city}
                            onChange={handleAddressFieldChange}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="province">Province *</label>
                          <input
                            id="province"
                            name="province"
                            maxLength="100"
                            value={addressForm.province}
                            onChange={handleAddressFieldChange}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="postalCode">Postal code *</label>
                          <input
                            id="postalCode"
                            name="postalCode"
                            maxLength="20"
                            value={addressForm.postalCode}
                            onChange={handleAddressFieldChange}
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="country">Country *</label>
                          <input
                            id="country"
                            name="country"
                            maxLength="100"
                            value={addressForm.country}
                            onChange={handleAddressFieldChange}
                            required
                          />
                        </div>
                      </div>

                      <button
                        className="add-to-cart-button"
                        type="submit"
                        disabled={savingAddress}
                      >
                        {savingAddress ? 'Saving address...' : 'Save address'}
                      </button>
                    </form>
                  )}
                </div>

                <form
                  className="checkout-section payment-section"
                  onSubmit={handlePlaceOrder}
                >
                  <p className="eyebrow">STEP 02</p>
                  <h2>Payment method</h2>

                  <label htmlFor="paymentMethod">
                    Choose a payment method
                  </label>

                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    disabled={placingOrder || Boolean(pendingOrderId)}
                  >
                    <option value="CARD">Card</option>
                    <option value="EFT">Electronic funds transfer (EFT)</option>
                    <option value="PAYFAST">PayFast</option>
                  </select>

                  <p className="checkout-muted">
                    This submits the selected method to your current backend.
                    A live card/EFT gateway is only involved if you have
                    separately integrated one.
                  </p>

                  {pendingOrderId && (
                    <p className="checkout-notice">
                      Order #{pendingOrderId} already exists. Retrying will
                      submit payment for this order rather than create another
                      order.
                    </p>
                  )}

                  {checkoutError && (
                    <p className="checkout-error" role="alert">
                      {checkoutError}
                    </p>
                  )}

                  {checkoutMessage && (
                    <p className="checkout-notice" role="status">
                      {checkoutMessage}
                    </p>
                  )}

                  <button
                    className="button button-dark checkout-submit"
                    type="submit"
                    disabled={
                      placingOrder ||
                      addressLoading ||
                      !selectedAddressId ||
                      cartItems.length === 0
                    }
                  >
                    {placingOrder
                      ? 'Processing...'
                      : pendingOrderId
                        ? 'Retry payment'
                        : `Place order · ${formatPrice(cartTotal)}`}
                  </button>
                </form>
              </section>

              <aside className="bag-summary checkout-summary">
                <p className="eyebrow">YOUR SELECTION</p>
                <h2>Order summary</h2>

                {cartItems.map((item) => (
                  <div
                    className="checkout-summary-item"
                    key={item.productId}
                  >
                    <img
                      src={item.imageUrl || FALLBACK_IMAGE}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = FALLBACK_IMAGE
                      }}
                    />
                    <div>
                      <strong>{item.name}</strong>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <strong>
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}

                <div className="summary-row">
                  <span>Items ({cartCount})</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <span>Not included</span>
                </div>

                <div className="summary-total">
                  <span>Subtotal</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>

                <p className="summary-note">
                  The subtotal is calculated from your current bag. Any final
                  order total returned by the backend remains authoritative.
                </p>
              </aside>
            </div>
          )}
        </main>
      ) : showBag ? (
        <main className="bag-page">
          <div className="bag-heading">
            <div>
              <p className="eyebrow">YOUR AURAGRID SELECTION</p>
              <h1>Shopping <em>bag.</em></h1>
              <p>Considered pieces, chosen by you.</p>
            </div>

            <button
              className="button button-dark"
              type="button"
              onClick={() => {
                setShowBag(false)
                setCartError('')
                setCartMessage('')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            >
              Continue shopping ↗
            </button>
          </div>

          {cartLoading && (
            <p className="catalogue-message">
              Loading your shopping bag...
            </p>
          )}

          {cartError && (
            <div className="bag-notice" role="alert">
              <p>{cartError}</p>

              {!token && (
                <button
                  className="add-to-cart-button"
                  type="button"
                  onClick={() => {
                    setLoginOpen(true)
                    setLoginMessage('Sign in to see the items in your bag.')
                  }}
                >
                  Sign in
                </button>
              )}

              {token && (
                <button
                  className="add-to-cart-button"
                  type="button"
                  onClick={() => loadCart()}
                >
                  Try again
                </button>
              )}
            </div>
          )}

          {!cartLoading && !cartError && cartItems.length === 0 && (
            <div className="empty-bag">
              <span className="empty-bag-icon">◇</span>
              <h2>Your bag is waiting.</h2>
              <p>You haven't added anything to your bag just yet.</p>

              <button
                className="button button-dark"
                type="button"
                onClick={() => {
                  setShowBag(false)
                  document.getElementById('products')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }}
              >
                Explore the collection ↗
              </button>
            </div>
          )}

          {!cartLoading && !cartError && cartItems.length > 0 && (
            <div className="bag-layout">
              <section className="bag-items" aria-label="Items in your bag">
                {cartItems.map((item) => (
                  <article className="bag-item" key={item.productId}>
                    <img
                      className="bag-item-image"
                      src={item.imageUrl || FALLBACK_IMAGE}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = FALLBACK_IMAGE
                      }}
                    />

                    <div className="bag-item-details">
                      <p className="eyebrow">{item.categoryName}</p>
                      <h2>{item.name}</h2>
                      {item.description && <p>{item.description}</p>}
                      <strong>{formatPrice(item.price)}</strong>

                      <div className="bag-item-controls">
                        <div
                          className="quantity-control"
                          aria-label={`Quantity for ${item.name}`}
                        >
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={updatingProductId === item.productId}
                            onClick={() =>
                              updateQuantity(item, item.quantity - 1)
                            }
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            aria-label="Increase quantity"
                            disabled={
                              updatingProductId === item.productId ||
                              item.quantity >= item.stockQuantity
                            }
                            onClick={() =>
                              updateQuantity(item, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="remove-item-button"
                          type="button"
                          disabled={updatingProductId === item.productId}
                          onClick={() => removeItem(item)}
                        >
                          {updatingProductId === item.productId
                            ? 'Updating...'
                            : 'Remove'}
                        </button>
                      </div>
                    </div>

                    <strong className="bag-line-total">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </article>
                ))}
              </section>

              <aside className="bag-summary">
                <p className="eyebrow">YOUR ORDER</p>
                <h2>Order summary</h2>

                <div className="summary-row">
                  <span>Items ({cartCount})</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>

                <div className="summary-total">
                  <span>Subtotal</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>

                <p className="summary-note">
                  Delivery costs and payment will be confirmed at checkout.
                </p>

                <button
                  className="button button-dark checkout-button"
                  type="button"
                  onClick={openCheckout}
                >
                  Proceed to checkout
                </button>

                <p className="summary-note">
                  Your bag is linked to your AuraGrid account.
                </p>
              </aside>
            </div>
          )}

          {cartMessage && (
            <p className="catalogue-message" role="status">
              {cartMessage}
            </p>
          )}
        </main>
      ) : (
        <main>
          <section className="hero">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=90"
              alt="Fashion-forward women exploring a clothing collection"
            />
            <div className="hero-overlay" />

            <div className="hero-content">
              <p className="eyebrow light-eyebrow">
                THE AURAGRID EXPERIENCE
              </p>
              <h1>Style that<br />speaks <em>you.</em></h1>
              <p className="hero-description">
                Discover pieces that feel like you. Find your look, express
                your mood, and make every outfit your own.
              </p>

              <div className="hero-buttons">
                <a className="button button-light" href="#collections">
                  Explore the collection <span>↗</span>
                </a>
                <a className="hero-secondary-link" href="#stylist">
                  Meet your AI Stylist <span>↗</span>
                </a>
              </div>
            </div>

            <div className="hero-caption">
              <span>01 / THE NEW COLLECTION</span>
              <span>CONFIDENCE IN EVERY THREAD</span>
            </div>
          </section>

          <section className="intro-section" id="about">
            <div className="intro-label">
              <span className="section-number">01</span>
              <span>MORE THAN WHAT YOU WEAR</span>
            </div>

            <div className="intro-content">
              <h2>Your wardrobe.<br /><span>Your rules.</span></h2>
              <p>
                Great style isn't about following every trend. It's about
                discovering what makes you feel confident. AuraGrid brings
                together considered fashion and intelligent styling to help
                you find it.
              </p>
            </div>
          </section>

          <section className="collections-section" id="collections">
            <div className="section-heading">
              <div>
                <p className="eyebrow">CURATED FOR YOU</p>
                <h2>Find your <em>next favourite.</em></h2>
              </div>
              <a className="underlined-link" href="#stylist">
                Find your style <span>↗</span>
              </a>
            </div>

            <div className="collection-grid">
              {collections.map((collection) => (
                <article className="collection-card" key={collection.number}>
                  <a
  href="#products"
  className="collection-image-link"
  onClick={() => handleCollectionClick(collection.name)}
>
                    <img
                      src={collection.image}
                      alt={collection.name}
                      loading="lazy"
                    />
                    <span className="collection-number">
                      {collection.number}
                    </span>
                    <span className="collection-arrow">↗</span>
                  </a>

                  <div className="collection-info">
                    <div>
                      <h3>{collection.name}</h3>
                      <p>{collection.description}</p>
                    </div>
                    <span className="collection-plus">+</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="products-section" id="products">
            <div className="section-heading">
              <div>
                <p className="eyebrow">FROM OUR CATALOGUE</p>
                <h2>Pieces to <em>love.</em></h2>
              </div>
              <span className="catalogue-label">THE AURAGRID EDIT</span>
            </div>

<div className="category-filter" aria-label="Filter products by category">
  <button
    type="button"
    className={`category-filter-button ${
      selectedCategoryId === 'all' ? 'active' : ''
    }`}
    aria-pressed={selectedCategoryId === 'all'}
    onClick={() => setSelectedCategoryId('all')}
  >
    All
  </button>

  {categories.map((category) => (
    <button
      type="button"
      key={category.id}
      className={`category-filter-button ${
        selectedCategoryId === String(category.id) ? 'active' : ''
      }`}
      aria-pressed={selectedCategoryId === String(category.id)}
      onClick={() => setSelectedCategoryId(String(category.id))}
    >
      {category.name}
    </button>
  ))}
</div>

{categoriesError && (
  <p className="catalogue-message" role="status">
    Category filters could not be loaded. {categoriesError}
  </p>
)}
            {loading && (
              <p className="catalogue-message">Loading our collection...</p>
            )}

            {!loading && error && (
              <p className="catalogue-message">
                We couldn't load the products. {error}
              </p>
            )}

            {!loading && !error && products.length === 0 && (
              <p className="catalogue-message">
                Our collection is being prepared. Check back soon.
              </p>
            )}


{!loading &&
  !error &&
  products.length > 0 &&
  filteredProducts.length === 0 && (
    <p className="catalogue-message">
      No products are currently available in this category.
    </p>
  )}

{!loading && !error && filteredProducts.length > 0 && (
  <div className="product-grid">
    {filteredProducts.map((product) => (
      <article className="product-card" key={product.id}>
        <div className="product-image">
          <img
            src={product.imageUrl || FALLBACK_IMAGE}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src = FALLBACK_IMAGE
            }}
          />
          <span className="product-category">
            {getProductCategoryName(product)}
          </span>
        </div>

        <div className="product-details">
          <div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
          <span className="product-price">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="product-stock">
          {product.stockQuantity > 0
            ? 'Available'
            : 'Currently out of stock'}
        </p>

        <button
          className="add-to-cart-button"
          type="button"
          disabled={
            product.stockQuantity <= 0 ||
            addingProductId === product.id
          }
          onClick={() => handleAddToCart(product.id)}
        >
          {addingProductId === product.id
            ? 'Adding...'
            : 'Add to bag'}
        </button>

        <div className="product-reviews">
  <button
    className="reviews-toggle"
    type="button"
    aria-expanded={expandedReviewProductId === product.id}
    onClick={() => toggleProductReviews(product.id)}
  >
    {expandedReviewProductId === product.id
      ? 'Hide reviews −'
      : 'Ratings & reviews +'}
  </button>

  {expandedReviewProductId === product.id && (
    <div className="reviews-panel">
      {!token && (
        <p className="review-notice">
          Sign in to view reviews and share your experience.
        </p>
      )}

      {token && reviewLoadingProductId === product.id && (
        <p className="review-notice">Loading reviews...</p>
      )}

      {token && reviewErrors[product.id] && (
        <p className="review-error" role="alert">
          {reviewErrors[product.id]}
          <button
            type="button"
            className="review-retry"
            onClick={() => loadProductReviews(product.id)}
          >
            Try again
          </button>
        </p>
      )}

      {token &&
        !reviewLoadingProductId === false &&
        false}

      {token &&
        reviewErrors[product.id] === '' &&
        reviewLoadingProductId !== product.id &&
        Array.isArray(reviewsByProduct[product.id]) && (
          <div className="review-list">
            {reviewsByProduct[product.id].length === 0 ? (
              <p className="review-notice">
                No reviews yet. Be the first to share your thoughts.
              </p>
            ) : (
              reviewsByProduct[product.id].map((review) => (
                <article className="review-item" key={review.id}>
                  <div className="review-item-heading">
                    <strong>{review.username}</strong>
                    <span aria-label={`${review.rating} out of 5 stars`}>
                      {'★'.repeat(Number(review.rating) || 0)}
                      {'☆'.repeat(5 - (Number(review.rating) || 0))}
                    </span>
                  </div>

                  {review.comment && <p>{review.comment}</p>}

                  {review.createdAt && (
                    <small>
                      {formatOrderDate(review.createdAt)}
                    </small>
                  )}
                </article>
              ))
            )}
          </div>
        )}

      {token &&
        Array.isArray(reviewsByProduct[product.id]) &&
        !reviewsByProduct[product.id].some(
          (review) => review.username === username
        ) && (
          <form
            className="review-form"
            onSubmit={(event) => handleSubmitReview(event, product.id)}
          >
            <h4>Write a review</h4>

            <label htmlFor={`review-rating-${product.id}`}>
              Your rating
            </label>

            <select
              id={`review-rating-${product.id}`}
              value={reviewForms[product.id]?.rating ?? 5}
              onChange={(event) =>
                handleReviewFieldChange(
                  product.id,
                  'rating',
                  Number(event.target.value)
                )
              }
            >
              <option value={5}>5 — Excellent</option>
              <option value={4}>4 — Very good</option>
              <option value={3}>3 — Good</option>
              <option value={2}>2 — Fair</option>
              <option value={1}>1 — Poor</option>
            </select>

            <label htmlFor={`review-comment-${product.id}`}>
              Your comments (optional)
            </label>

            <textarea
              id={`review-comment-${product.id}`}
              rows={3}
              maxLength={2000}
              placeholder="What did you think of this piece?"
              value={reviewForms[product.id]?.comment ?? ''}
              onChange={(event) =>
                handleReviewFieldChange(
                  product.id,
                  'comment',
                  event.target.value
                )
              }
            />

            <button
              className="add-to-cart-button"
              type="submit"
              disabled={reviewSubmittingProductId === product.id}
            >
              {reviewSubmittingProductId === product.id
                ? 'Submitting...'
                : 'Submit review'}
            </button>
          </form>
        )}

      {reviewMessages[product.id] && (
        <p className="review-notice" role="status">
          {reviewMessages[product.id]}
        </p>
      )}
    </div>
  )}
</div>
      </article>
    ))}
  </div>
)}

            {cartMessage && (
              <p className="catalogue-message" role="status">
                {cartMessage}
              </p>
            )}
          </section>

          <section className="stylist-section" id="stylist">
            <div className="stylist-image">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85"
                alt="A curated fashion shopping experience"
                loading="lazy"
              />
              <span className="stylist-image-label">
                YOUR PERSONAL STYLE SPACE
              </span>
            </div>

            <div className="stylist-content">
              <p className="eyebrow">INTRODUCING YOUR STYLE PARTNER</p>
              <h2>Meet your<br /><em>AI Stylist.</em></h2>
              <p className="stylist-description">
                Not sure what to wear? Tell us the occasion, share your
                inspiration, and discover outfit ideas tailored to your taste.
              </p>

              <ul className="stylist-features">
                <li><span>01</span> Outfit inspiration for every occasion</li>
                <li><span>02</span> Recommendations for your personal style</li>
                <li><span>03</span> Looks built around your preferences</li>
              </ul>

              <button
  className="button button-dark"
  type="button"
  onClick={() => {
    setStylistOpen(true)

    setTimeout(() => {
      document.getElementById('stylist-tool')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)
  }}
>
  Discover your style <span>↗</span>
</button>

              <p className="stylist-note" id="stylist-message">
                YOUR STYLE JOURNEY STARTS HERE.
              </p>
            </div>
          </section>

{stylistOpen && (
  <section className="stylist-tool" id="stylist-tool">
    <div className="stylist-tool-heading">
      <p className="eyebrow">YOUR PERSONAL STYLE SPACE</p>
      <h2>Let's find your <em>look.</em></h2>
      <p>
        Tell us what you're shopping for and we'll explore products
        from the AuraGrid catalogue that fit your preferences.
      </p>
    </div>

    <form
      className="stylist-form"
      onSubmit={getStylistRecommendations}
    >
      <label>
        What's the occasion?
        <select
          value={stylistOccasion}
          onChange={(event) => setStylistOccasion(event.target.value)}
        >
          <option>Everyday</option>
          <option>Work</option>
          <option>Date night</option>
          <option>Party</option>
          <option>Vacation</option>
        </select>
      </label>

      <label>
        What's your style?
        <select
          value={stylistPreference}
          onChange={(event) => setStylistPreference(event.target.value)}
        >
          <option>Casual</option>
          <option>Elegant</option>
          <option>Streetwear</option>
          <option>Minimalist</option>
          <option>Any style</option>
        </select>
      </label>

      <label>
        Preferred colour
        <select
          value={stylistColour}
          onChange={(event) => setStylistColour(event.target.value)}
        >
          <option>Any colour</option>
          <option>Black</option>
          <option>White</option>
          <option>Blue</option>
          <option>Pink</option>
          <option>Beige</option>
          <option>Green</option>
          <option>Red</option>
        </select>
      </label>

      <label>
        Maximum budget (ZAR)
        <input
          type="number"
          min="1"
          step="0.01"
          value={stylistBudget}
          onChange={(event) => setStylistBudget(event.target.value)}
          required
        />
      </label>

      <button className="button button-dark" type="submit">
        Find my look
      </button>

      <button
        className="stylist-close-button"
        type="button"
        onClick={() => setStylistOpen(false)}
      >
        Close stylist
      </button>
    </form>

    {stylistMessage && (
      <p className="stylist-results-message" role="status">
        {stylistMessage}
      </p>
    )}

    {stylistResults.length > 0 && (
      <div className="stylist-results">
        {stylistResults.map((product) => (
          <article
            className="stylist-result-card"
            key={product.id}
          >
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
              />
            )}

            <h3>{product.name}</h3>

            <p>
              {new Intl.NumberFormat('en-ZA', {
                style: 'currency',
                currency: 'ZAR',
              }).format(Number(product.price))}
            </p>

            <button
              className="button button-dark"
              type="button"
              onClick={() => addToCart(product)}
            >
              Add to bag
            </button>
          </article>
        ))}
      </div>
    )}
  </section>
)}
          <section className="closing-section">
            <p className="eyebrow">THIS IS YOUR MOMENT</p>
            <h2>Wear what feels<br /><em>like you.</em></h2>
            <a className="button button-light" href="#collections">
              Explore AuraGrid <span>↗</span>
            </a>
          </section>
        </main>
      )}

      <footer className="site-footer">
        <a className="footer-brand" href="#" onClick={returnToShop}>
          AURA<span>GRID</span>
        </a>
        <p>Fashion, with a perspective of your own.</p>
        <span>© 2026 AURAGRID</span>
      </footer>
    </div>
  )
}

export default App