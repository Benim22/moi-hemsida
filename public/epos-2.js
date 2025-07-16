/**
 * ePOS-Print API v2.0 - Riktig HTTP implementation
 * Förenklad version för Moi Sushi terminal med korrekt XML-schema
 */

(function(window) {
  'use strict';

  // ePOS namespace
  window.epos = window.epos || {};

  // Device types
  window.epos.DEVICE_TYPE_PRINTER = 'PRINTER';

  // Response codes
  window.epos.SUCCESS = 'SUCCESS';
  window.epos.ERR_PARAM = 'ERR_PARAM';
  window.epos.ERR_CONNECT = 'ERR_CONNECT';
  window.epos.ERR_TIMEOUT = 'ERR_TIMEOUT';
  window.epos.ERR_PRINT = 'ERR_PRINT';

  // ePOS Device class
  window.epos.ePOSDevice = function() {
    this.deviceId = null;
    this.address = null;
    this.port = null;
    this.connected = false;
    this.callback = null;
    this.useSSL = false;
  };

  window.epos.ePOSDevice.prototype.connect = function(address, port, callback) {
    this.address = address;
    this.port = port;
    this.callback = callback;

    console.log(`[ePOS] Ansluter till ${address}:${port}`);

    // Bestäm om vi ska använda SSL baserat på port
    this.useSSL = port === 443 || port === 8443;
    const protocol = this.useSSL ? 'https' : 'http';
    
    // Förbättrad anslutningstest med längre timeout för utskrift
    this.testConnection(15000) // 15 sekunder timeout för utskrift
      .then(() => {
        console.log(`[ePOS] Anslutning framgångsrik till ${address}:${port}`);
        this.connected = true;
        if (this.callback) this.callback('OK');
      })
      .catch((error) => {
        console.log(`[ePOS] Anslutning misslyckades till ${address}:${port}:`, error.message);
        console.log(`[ePOS] Försöker backend proxy som fallback...`);
        this.connected = false;
        if (this.callback) this.callback('ERR_CONNECT');
      });
  };

  window.epos.ePOSDevice.prototype.testConnection = async function(timeout = 5000) {
    const protocol = this.useSSL ? 'https' : 'http';
    
    // Prova flera endpoints för att hitta den som fungerar
    const testEndpoints = [
      '/cgi-bin/epos/service.cgi',
      '/status',
      '/',
      '/info'
    ];
    
    console.log(`[ePOS] Testar anslutning med ${timeout}ms timeout...`);
    
    for (const endpoint of testEndpoints) {
      const url = `${protocol}://${this.address}:${this.port}${endpoint}`;
      
      try {
        console.log(`[ePOS] Provar endpoint: ${endpoint}`);
        const response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(timeout),
          mode: 'no-cors' // Tillåt CORS för att testa anslutning
        });
        
        console.log(`[ePOS] Endpoint ${endpoint} svarade (no-cors mode)`);
        
        // I no-cors mode får vi inte läsa response.ok, men om vi inte får error så fungerar anslutningen
        console.log(`[ePOS] Anslutning till ${endpoint} framgångsrik`);
        return true;
        
      } catch (error) {
        console.log(`[ePOS] Endpoint ${endpoint} misslyckades: ${error.message}`);
        
        // Om det är timeout, avbryt alla försök
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          console.log(`[ePOS] Timeout på ${endpoint} - avbryter alla försök`);
          break;
        }
        
        // Om det är CORS-fel från HTTPS till HTTP, försök med backend proxy
        if (error.message.includes('CORS') || error.message.includes('Mixed Content')) {
          console.log('[ePOS] CORS/Mixed Content detected - will use backend proxy');
          return true; // Låt backend hantera det
        }
        
        // Fortsätt till nästa endpoint
        continue;
      }
    }
    
    // Om alla endpoints misslyckas, kasta fel
    throw new Error(`Alla endpoints misslyckades - skrivaren på ${this.address}:${this.port} svarar inte`);
  };

  window.epos.ePOSDevice.prototype.createDevice = function(deviceId, deviceType, options, callback) {
    if (!this.connected) {
      if (callback) callback(null, 'ERR_CONNECT');
      return null;
    }

    const printer = new window.epos.ePOSPrinter(deviceId, deviceType, this);
    if (callback) callback(printer, 'OK');
    return printer;
  };

  window.epos.ePOSDevice.prototype.disconnect = function(callback) {
    this.connected = false;
    this.address = null;
    this.port = null;
    if (callback) callback('OK');
  };

  // ePOS Printer class
  window.epos.ePOSPrinter = function(deviceId, deviceType, device) {
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.device = device;
    this.commands = [];
    this.builder = new window.epos.ePOSBuilder();
  };

  window.epos.ePOSPrinter.prototype.addCommand = function(command) {
    this.commands.push(command);
  };

  window.epos.ePOSPrinter.prototype.addText = function(text) {
    this.builder.addText(text);
    return this;
  };

  window.epos.ePOSPrinter.prototype.addFeedLine = function(lines) {
    this.builder.addFeedLine(lines || 1);
    return this;
  };

  window.epos.ePOSPrinter.prototype.addCut = function(type) {
    this.builder.addCut(type || this.builder.CUT_FEED);
    return this;
  };

  window.epos.ePOSPrinter.prototype.send = function(callback) {
    console.log(`[ePOS] Skickar utskrift till ${this.device.address}:${this.device.port}`);
    
    // Generera ePOS XML från builder
    const xml = this.builder.toString();
    console.log('[ePOS] Generated XML:', xml);
    
    this.sendToPrinter(xml, callback);
  };

  window.epos.ePOSPrinter.prototype.sendToPrinter = async function(xml, callback) {
    const protocol = this.device.useSSL ? 'https' : 'http';
    const url = `${protocol}://${this.device.address}:${this.device.port}/cgi-bin/epos/service.cgi`;
    
    console.log(`[ePOS] Skickar XML till skrivare: ${url}`);
    console.log(`[ePOS] XML längd: ${xml.length} tecken`);
    
    try {
      // Försök direkt anslutning först med längre timeout för utskrift
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'Accept': 'text/xml, application/xml, */*',
          'SOAPAction': '"urn:schemas-epson-com:service:EpsonEPOSService:SendData"'
        },
        body: xml,
        signal: AbortSignal.timeout(20000) // 20 sekunder för utskrift
      });

      const result = await response.text();
      console.log('[ePOS] Printer response status:', response.status);
      console.log('[ePOS] Printer response:', result);

      if (response.ok && !result.includes('SchemaError') && !result.includes('ERR_')) {
        console.log('[ePOS] ✅ Utskrift framgångsrik via direkt anslutning');
        if (callback) callback({ success: true, code: 'SUCCESS', status: 'OK' });
      } else {
        console.log('[ePOS] ❌ Utskrift misslyckades - fel i svar:', result);
        if (callback) callback({ success: false, code: 'ERR_PRINT', status: 'PRINT_ERROR', message: result });
      }
    } catch (error) {
      console.log('[ePOS] ❌ Direkt anslutning misslyckades:', error.message);
      console.log('[ePOS] Error type:', error.name);
      
      // Fallback till backend proxy för CORS/Mixed Content/Timeout
      if (error.message.includes('CORS') || 
          error.message.includes('Mixed Content') || 
          error.name === 'TypeError' ||
          error.name === 'AbortError' ||
          error.message.includes('timeout')) {
        
        console.log('[ePOS] 🔄 Använder backend proxy som fallback...');
        
        try {
          const response = await fetch('/api/printer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'print_xml',
              printerIP: this.device.address,
              printerPort: this.device.port,
              xml: xml,
              useSSL: this.device.useSSL
            }),
            signal: AbortSignal.timeout(25000) // 25 sekunder för backend proxy
          });

          const result = await response.json();
          
          if (result.success) {
            console.log('[ePOS] ✅ Backend proxy utskrift framgångsrik');
            if (callback) callback({ success: true, code: 'SUCCESS', status: 'OK' });
          } else {
            console.log('[ePOS] ❌ Backend proxy utskrift misslyckades:', result.error);
            if (callback) callback({ success: false, code: 'ERR_PRINT', status: 'PRINT_ERROR', message: result.error });
          }
        } catch (backendError) {
          console.log('[ePOS] ❌ Backend proxy misslyckades:', backendError.message);
          if (callback) callback({ success: false, code: 'ERR_CONNECT', status: 'CONNECTION_ERROR', message: `Backend proxy fel: ${backendError.message}` });
        }
      } else {
        console.log('[ePOS] ❌ Okänt fel vid utskrift:', error.message);
        if (callback) callback({ success: false, code: 'ERR_CONNECT', status: 'CONNECTION_ERROR', message: `Utskriftsfel: ${error.message}` });
      }
    }
  };

  // ePOS Builder class - Genererar korrekt ePOS XML
  window.epos.ePOSBuilder = function() {
    this.commands = [];
    
    // Alignment constants
    this.ALIGN_LEFT = 0;
    this.ALIGN_CENTER = 1;
    this.ALIGN_RIGHT = 2;
    
    // Cut constants
    this.CUT_FEED = 0;
    this.CUT_NO_FEED = 1;
    this.CUT_PARTIAL = 2;
    
    // Text size constants
    this.TEXT_1X = 0;
    this.TEXT_2X = 1;
    this.TEXT_3X = 2;
    this.TEXT_4X = 3;
  };

  window.epos.ePOSBuilder.prototype.addText = function(text) {
    this.commands.push({ type: 'text', data: text });
    return this;
  };

  window.epos.ePOSBuilder.prototype.addTextAlign = function(align) {
    this.commands.push({ type: 'align', data: align });
    return this;
  };

  window.epos.ePOSBuilder.prototype.addTextSize = function(width, height) {
    this.commands.push({ type: 'size', data: { width: width || 0, height: height || 0 } });
    return this;
  };

  window.epos.ePOSBuilder.prototype.addFeedLine = function(lines) {
    this.commands.push({ type: 'feed', data: lines || 1 });
    return this;
  };

  window.epos.ePOSBuilder.prototype.addCut = function(type) {
    this.commands.push({ type: 'cut', data: type || this.CUT_FEED });
    return this;
  };

  window.epos.ePOSBuilder.prototype.addTextStyle = function(reverse, ul, em, color) {
    this.commands.push({ 
      type: 'style', 
      data: { 
        reverse: reverse || false, 
        ul: ul || false, 
        em: em || false, 
        color: color || 'none' 
      } 
    });
    return this;
  };

  window.epos.ePOSBuilder.prototype.toString = function() {
    let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
    xml += '<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">\n';
    
    let currentAlign = this.ALIGN_LEFT;
    let currentSize = { width: 0, height: 0 };
    let currentStyle = { reverse: false, ul: false, em: false, color: 'none' };
    
    this.commands.forEach(cmd => {
      switch (cmd.type) {
        case 'text':
          xml += `  <text>${this.escapeXml(cmd.data)}</text>\n`;
          break;
          
        case 'align':
          if (cmd.data !== currentAlign) {
            currentAlign = cmd.data;
            const alignValue = cmd.data === this.ALIGN_CENTER ? 'center' : 
                             cmd.data === this.ALIGN_RIGHT ? 'right' : 'left';
            xml += `  <text align="${alignValue}"></text>\n`;
          }
          break;
          
        case 'size':
          if (cmd.data.width !== currentSize.width || cmd.data.height !== currentSize.height) {
            currentSize = cmd.data;
            xml += `  <text width="${cmd.data.width}" height="${cmd.data.height}"></text>\n`;
          }
          break;
          
        case 'feed':
          xml += `  <feed line="${cmd.data}"/>\n`;
          break;
          
        case 'cut':
          const cutType = cmd.data === this.CUT_NO_FEED ? 'no_feed' : 'feed';
          xml += `  <cut type="${cutType}"/>\n`;
          break;
          
        case 'style':
          const style = cmd.data;
          if (JSON.stringify(style) !== JSON.stringify(currentStyle)) {
            currentStyle = style;
            const attrs = [];
            if (style.reverse) attrs.push('reverse="true"');
            if (style.ul) attrs.push('ul="true"');
            if (style.em) attrs.push('em="true"');
            if (style.color !== 'none') attrs.push(`color="${style.color}"`);
            xml += `  <text ${attrs.join(' ')}></text>\n`;
          }
          break;
      }
    });
    
    xml += '</epos-print>';
    return xml;
  };

  window.epos.ePOSBuilder.prototype.escapeXml = function(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  window.epos.ePOSBuilder.prototype.clear = function() {
    this.commands = [];
    return this;
  };

  // Utility functions
  window.epos.isSupported = function() {
    return true; // Alltid supported i denna implementation
  };

  console.log('[ePOS] SDK loaded successfully');

})(window); 