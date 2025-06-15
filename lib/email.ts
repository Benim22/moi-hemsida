import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Email templates
const getOrderConfirmationTemplate = (orderData: {
  customerName: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; price: number }>
  totalPrice: number
  location: string
  orderType: 'delivery' | 'pickup'
  deliveryAddress?: string
  pickupTime?: string
  phone: string
  notes?: string
}) => {
  const itemsList = orderData.items
    .map(item => `${item.quantity}x ${item.name} - ${item.price * item.quantity} kr`)
    .join('\n')

  return {
    subject: `Orderbekräftelse #${orderData.orderNumber} - Moi Sushi`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e4d699; margin: 0;">Moi Sushi</h1>
          <p style="color: #e4d699; margin: 5px 0;">Tack för din beställning!</p>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #e4d699;">
          <h2 style="color: #e4d699; margin-top: 0;">Orderbekräftelse</h2>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #e4d699;">Ordernummer:</strong> #${orderData.orderNumber}<br>
            <strong style="color: #e4d699;">Kund:</strong> ${orderData.customerName}<br>
            <strong style="color: #e4d699;">Telefon:</strong> ${orderData.phone}<br>
            <strong style="color: #e4d699;">Restaurang:</strong> ${orderData.location}<br>
            <strong style="color: #e4d699;">Typ:</strong> ${orderData.orderType === 'delivery' ? 'Leverans' : 'Avhämtning'}
          </div>
          
          ${orderData.orderType === 'delivery' && orderData.deliveryAddress ? 
            `<div style="margin-bottom: 20px;">
              <strong style="color: #e4d699;">Leveransadress:</strong><br>
              ${orderData.deliveryAddress}
            </div>` : ''
          }
          
          ${orderData.orderType === 'pickup' && orderData.pickupTime ? 
            `<div style="margin-bottom: 20px;">
              <strong style="color: #e4d699;">Avhämtningstid:</strong> ${orderData.pickupTime}
            </div>` : ''
          }
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #e4d699;">Din beställning:</h3>
            <div style="background-color: #000; padding: 15px; border-radius: 4px;">
              ${orderData.items.map(item => 
                `<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>${item.quantity}x ${item.name}</span>
                  <span>${item.price * item.quantity} kr</span>
                </div>`
              ).join('')}
              <hr style="border: 1px solid #e4d699; margin: 15px 0;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; color: #e4d699;">
                <span>Totalt:</span>
                <span>${orderData.totalPrice} kr</span>
              </div>
            </div>
          </div>
          
          ${orderData.notes ? 
            `<div style="margin-bottom: 20px;">
              <strong style="color: #e4d699;">Anteckningar:</strong><br>
              ${orderData.notes}
            </div>` : ''
          }
          
          <div style="background-color: #e4d699; color: #000; padding: 15px; border-radius: 4px; text-align: center;">
            <strong>Vi förbereder din beställning nu!</strong><br>
            ${orderData.orderType === 'delivery' ? 
              'Du kommer att få ett meddelande när maten är på väg.' : 
              'Du kommer att få ett meddelande när maten är redo för avhämtning.'
            }
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #888;">
          <p>Har du frågor? Kontakta oss på info@moisushi.se eller ring ${orderData.location === 'Trelleborg' ? '0410-28110' : orderData.location === 'Malmö' ? '040-123456' : '0411-55120'}</p>
          <p style="font-size: 12px;">Moi Sushi - Färsk sushi och poké bowls i Skåne</p>
        </div>
      </div>
    `,
    text: `
Orderbekräftelse #${orderData.orderNumber} - Moi Sushi

Tack för din beställning!

Ordernummer: #${orderData.orderNumber}
Kund: ${orderData.customerName}
Telefon: ${orderData.phone}
Restaurang: ${orderData.location}
Typ: ${orderData.orderType === 'delivery' ? 'Leverans' : 'Avhämtning'}

${orderData.orderType === 'delivery' && orderData.deliveryAddress ? `Leveransadress: ${orderData.deliveryAddress}\n` : ''}
${orderData.orderType === 'pickup' && orderData.pickupTime ? `Avhämtningstid: ${orderData.pickupTime}\n` : ''}

Din beställning:
${itemsList}

Totalt: ${orderData.totalPrice} kr

${orderData.notes ? `Anteckningar: ${orderData.notes}\n` : ''}

Vi förbereder din beställning nu!
${orderData.orderType === 'delivery' ? 
  'Du kommer att få ett meddelande när maten är på väg.' : 
  'Du kommer att få ett meddelande när maten är redo för avhämtning.'
}

Har du frågor? Kontakta oss på info@moisushi.se
    `
  }
}

const getBookingConfirmationTemplate = (bookingData: {
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  guests: string
  location: string
  message?: string
}) => {
  return {
    subject: `Bordsbokning bekräftad - Moi Sushi ${bookingData.location}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e4d699; margin: 0;">Moi Sushi</h1>
          <p style="color: #e4d699; margin: 5px 0;">Bordsbokning bekräftad!</p>
        </div>
        
        <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #e4d699;">
          <h2 style="color: #e4d699; margin-top: 0;">Bokningsbekräftelse</h2>
          
          <div style="margin-bottom: 20px;">
            <strong style="color: #e4d699;">Namn:</strong> ${bookingData.customerName}<br>
            <strong style="color: #e4d699;">E-post:</strong> ${bookingData.customerEmail}<br>
            <strong style="color: #e4d699;">Telefon:</strong> ${bookingData.customerPhone}<br>
            <strong style="color: #e4d699;">Restaurang:</strong> Moi Sushi ${bookingData.location}<br>
            <strong style="color: #e4d699;">Datum:</strong> ${bookingData.date}<br>
            <strong style="color: #e4d699;">Tid:</strong> ${bookingData.time}<br>
            <strong style="color: #e4d699;">Antal gäster:</strong> ${bookingData.guests}
          </div>
          
          ${bookingData.message ? 
            `<div style="margin-bottom: 20px;">
              <strong style="color: #e4d699;">Meddelande:</strong><br>
              ${bookingData.message}
            </div>` : ''
          }
          
          <div style="background-color: #e4d699; color: #000; padding: 15px; border-radius: 4px; text-align: center;">
            <strong>Vi ser fram emot ditt besök!</strong><br>
            Om du behöver ändra eller avboka din bokning, kontakta oss så snart som möjligt.
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #888;">
          <p>Har du frågor? Kontakta oss på info@moisushi.se eller ring ${bookingData.location === 'Trelleborg' ? '0410-28110' : '040-123456'}</p>
          <p style="font-size: 12px;">Moi Sushi - Färsk sushi och poké bowls i Skåne</p>
        </div>
      </div>
    `,
    text: `
Bordsbokning bekräftad - Moi Sushi ${bookingData.location}

Bokningsbekräftelse:

Namn: ${bookingData.customerName}
E-post: ${bookingData.customerEmail}
Telefon: ${bookingData.customerPhone}
Restaurang: Moi Sushi ${bookingData.location}
Datum: ${bookingData.date}
Tid: ${bookingData.time}
Antal gäster: ${bookingData.guests}

${bookingData.message ? `Meddelande: ${bookingData.message}\n` : ''}

Vi ser fram emot ditt besök!
Om du behöver ändra eller avboka din bokning, kontakta oss så snart som möjligt.

Har du frågor? Kontakta oss på info@moisushi.se
    `
  }
}

const getContactNotificationTemplate = (contactData: {
  name: string
  email: string
  message: string
}) => {
  return {
    subject: `Nytt meddelande från kontaktformuläret - ${contactData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e4d699; margin: 0; background-color: #000; padding: 20px; border-radius: 8px;">Moi Sushi</h1>
          <p style="color: #333; margin: 10px 0;">Nytt meddelande från kontaktformuläret</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #ddd;">
          <h2 style="color: #333; margin-top: 0;">Kontaktformulär</h2>
          
          <div style="margin-bottom: 20px;">
            <strong>Namn:</strong> ${contactData.name}<br>
            <strong>E-post:</strong> ${contactData.email}<br>
            <strong>Datum:</strong> ${new Date().toLocaleDateString('sv-SE')} ${new Date().toLocaleTimeString('sv-SE')}
          </div>
          
          <div style="margin-bottom: 20px;">
            <strong>Meddelande:</strong><br>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #e4d699; margin-top: 10px;">
              ${contactData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="background-color: #e4d699; color: #000; padding: 15px; border-radius: 4px; text-align: center;">
            <strong>Svara på:</strong> ${contactData.email}
          </div>
        </div>
      </div>
    `,
    text: `
Nytt meddelande från kontaktformuläret - Moi Sushi

Namn: ${contactData.name}
E-post: ${contactData.email}
Datum: ${new Date().toLocaleDateString('sv-SE')} ${new Date().toLocaleTimeString('sv-SE')}

Meddelande:
${contactData.message}

Svara på: ${contactData.email}
    `
  }
}

// Email sending functions
export const sendOrderConfirmation = async (orderData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  items: Array<{ name: string; quantity: number; price: number }>
  totalPrice: number
  location: string
  orderType: 'delivery' | 'pickup'
  deliveryAddress?: string
  pickupTime?: string
  phone: string
  notes?: string
}) => {
  try {
    const template = getOrderConfirmationTemplate(orderData)
    
    // Send confirmation to customer
    await transporter.sendMail({
      from: `"Moi Sushi" <${process.env.SMTP_USER}>`,
      to: orderData.customerEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })

    // Send notification to restaurant
    await transporter.sendMail({
      from: `"Moi Sushi System" <${process.env.SMTP_USER}>`,
      to: process.env.RESTAURANT_EMAIL || 'info@moisushi.se',
      subject: `Ny beställning #${orderData.orderNumber} - ${orderData.location}`,
      text: `
Ny beställning mottagen!

Ordernummer: #${orderData.orderNumber}
Kund: ${orderData.customerName} (${orderData.customerEmail})
Telefon: ${orderData.phone}
Restaurang: ${orderData.location}
Typ: ${orderData.orderType === 'delivery' ? 'Leverans' : 'Avhämtning'}

${orderData.orderType === 'delivery' && orderData.deliveryAddress ? `Leveransadress: ${orderData.deliveryAddress}\n` : ''}
${orderData.orderType === 'pickup' && orderData.pickupTime ? `Avhämtningstid: ${orderData.pickupTime}\n` : ''}

Beställning:
${orderData.items.map(item => `${item.quantity}x ${item.name} - ${item.price * item.quantity} kr`).join('\n')}

Totalt: ${orderData.totalPrice} kr

${orderData.notes ? `Anteckningar: ${orderData.notes}` : ''}
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending order confirmation:', error)
    return { success: false, error: 'Failed to send order confirmation' }
  }
}

export const sendBookingConfirmation = async (bookingData: {
  customerName: string
  customerEmail: string
  customerPhone: string
  date: string
  time: string
  guests: string
  location: string
  message?: string
}) => {
  try {
    const template = getBookingConfirmationTemplate(bookingData)
    
    // Send confirmation to customer
    await transporter.sendMail({
      from: `"Moi Sushi" <${process.env.SMTP_USER}>`,
      to: bookingData.customerEmail,
      subject: template.subject,
      text: template.text,
      html: template.html,
    })

    // Send notification to restaurant
    await transporter.sendMail({
      from: `"Moi Sushi System" <${process.env.SMTP_USER}>`,
      to: process.env.RESTAURANT_EMAIL || 'info@moisushi.se',
      subject: `Ny bordsbokning - ${bookingData.location} (${bookingData.date})`,
      text: `
Ny bordsbokning mottagen!

Namn: ${bookingData.customerName}
E-post: ${bookingData.customerEmail}
Telefon: ${bookingData.customerPhone}
Restaurang: Moi Sushi ${bookingData.location}
Datum: ${bookingData.date}
Tid: ${bookingData.time}
Antal gäster: ${bookingData.guests}

${bookingData.message ? `Meddelande: ${bookingData.message}` : ''}
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending booking confirmation:', error)
    return { success: false, error: 'Failed to send booking confirmation' }
  }
}

export const sendContactNotification = async (contactData: {
  name: string
  email: string
  message: string
}) => {
  try {
    const template = getContactNotificationTemplate(contactData)
    
    // Send notification to restaurant
    await transporter.sendMail({
      from: `"Moi Sushi System" <${process.env.SMTP_USER}>`,
      to: process.env.RESTAURANT_EMAIL || 'info@moisushi.se',
      subject: template.subject,
      text: template.text,
      html: template.html,
      replyTo: contactData.email, // Allow direct reply to customer
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending contact notification:', error)
    return { success: false, error: 'Failed to send contact notification' }
  }
}

// Test email connection
export const testEmailConnection = async () => {
  try {
    await transporter.verify()
    return { success: true, message: 'Email connection successful' }
  } catch (error) {
    console.error('Email connection failed:', error)
    return { success: false, error: 'Email connection failed' }
  }
} 