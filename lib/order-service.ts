import type { CartItem } from "@/context/cart-context"

interface OrderDetails {
  customerName: string
  customerEmail: string
  customerPhone: string
  pickupTime: string
  items: CartItem[]
  totalPrice: number
  orderNumber: string
  location: string
  orderType: 'delivery' | 'pickup'
}

// Send order confirmation email using our new API
export async function sendOrderConfirmationEmail(orderDetails: OrderDetails): Promise<boolean> {
  try {
    const response = await fetch('/api/send-order-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: orderDetails.customerName,
        customerEmail: orderDetails.customerEmail,
        orderNumber: orderDetails.orderNumber,
        items: orderDetails.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: orderDetails.totalPrice,
        location: orderDetails.location,
        orderType: orderDetails.orderType,
        phone: orderDetails.customerPhone,
        pickupTime: orderDetails.pickupTime,
      }),
    })

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return false
  }
}

// Generate a simple order number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${timestamp}${random}`
}

