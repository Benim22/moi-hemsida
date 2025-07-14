// Test script för WebSocket-servern
const fetch = require('node-fetch');

const WEBSOCKET_SERVER_URL = 'http://localhost:3001';

async function testWebSocketServer() {
  console.log('🧪 Testar WebSocket-servern...\n');

  // Test 1: Hälsokontroll
  console.log('1. Testar hälsokontroll...');
  try {
    const response = await fetch(`${WEBSOCKET_SERVER_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check OK:', data.status);
    console.log('   Aktiva anslutningar:', data.connections.activeConnections);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Skicka testorder
  console.log('\n2. Skickar testorder...');
  try {
    const orderData = {
      id: `test-order-${Date.now()}`,
      location: 'trelleborg',
      customer_name: 'Test Kund',
      customer_email: 'test@example.com',
      total_amount: 299,
      items: [
        { name: 'Sushi Mix', price: 299, quantity: 1 }
      ],
      order_type: 'avhämtning',
      special_instructions: 'Testorder från script'
    };

    const response = await fetch(`${WEBSOCKET_SERVER_URL}/send-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Order skickad!');
      console.log('   Order ID:', orderData.id);
      console.log('   Anslutna terminaler:', result.connectedTerminals);
      console.log('   Meddelande ID:', result.messageId);
    } else {
      console.error('❌ Order failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Order test failed:', error.message);
  }

  // Test 3: Skicka testbokning
  console.log('\n3. Skickar testbokning...');
  try {
    const bookingData = {
      id: `test-booking-${Date.now()}`,
      location: 'malmo',
      customer_name: 'Test Bokning',
      customer_email: 'booking@example.com',
      customer_phone: '0701234567',
      booking_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      guests: 4,
      message: 'Testbokning från script'
    };

    const response = await fetch(`${WEBSOCKET_SERVER_URL}/send-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Bokning skickad!');
      console.log('   Bokning ID:', bookingData.id);
      console.log('   Anslutna terminaler:', result.connectedTerminals);
      console.log('   Meddelande ID:', result.messageId);
    } else {
      console.error('❌ Booking failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Booking test failed:', error.message);
  }

  // Test 4: Skicka status uppdatering
  console.log('\n4. Skickar status uppdatering...');
  try {
    const statusData = {
      orderId: 'test-order-123',
      status: 'ready',
      location: 'ystad'
    };

    const response = await fetch(`${WEBSOCKET_SERVER_URL}/send-status-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Status uppdatering skickad!');
      console.log('   Order ID:', statusData.orderId);
      console.log('   Ny status:', statusData.status);
      console.log('   Anslutna terminaler:', result.connectedTerminals);
    } else {
      console.error('❌ Status update failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Status update test failed:', error.message);
  }

  // Test 5: Kontrollera statistik
  console.log('\n5. Kontrollerar statistik...');
  try {
    const response = await fetch(`${WEBSOCKET_SERVER_URL}/stats`);
    const data = await response.json();
    console.log('✅ Statistik hämtad:');
    console.log('   Totala anslutningar:', data.totalConnections);
    console.log('   Aktiva anslutningar:', data.activeConnections);
    console.log('   Skickade meddelanden:', data.messagesSent);
    console.log('   Senaste aktivitet:', new Date(data.lastActivity).toLocaleString('sv-SE'));
  } catch (error) {
    console.error('❌ Stats test failed:', error.message);
  }

  console.log('\n🎉 Test avslutat!');
  console.log('\nFör att se resultatet:');
  console.log('1. Öppna restaurant-terminal.tsx på iPad');
  console.log('2. Kontrollera debug-loggar för WebSocket-meddelanden');
  console.log('3. Verifiera att utskrift triggas automatiskt');
}

// Kör test om scriptet körs direkt
if (require.main === module) {
  testWebSocketServer().catch(console.error);
}

module.exports = { testWebSocketServer }; 