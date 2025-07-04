/**
 * ePOS-Print API v2.0 - Lokal HTTP version
 * Förenklad version för Moi Sushi terminal
 */

(function(window) {
  'use strict';

  // ePOS namespace
  window.epos = window.epos || {};

  // Device types
  window.epos.DEVICE_TYPE_PRINTER = 'PRINTER';

  // ePOS Device class
  window.epos.ePOSDevice = function() {
    this.deviceId = null;
    this.address = null;
    this.port = null;
    this.connected = false;
    this.callback = null;
  };

  window.epos.ePOSDevice.prototype.connect = function(address, port, callback) {
    this.address = address;
    this.port = port;
    this.callback = callback;

    console.log(`[ePOS] Försöker ansluta till ${address}:${port}`);

    // Simulera anslutning med timeout
    setTimeout(() => {
      // Testa om IP-adressen är giltig
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      
      if (!ipRegex.test(address)) {
        console.log(`[ePOS] Ogiltig IP-adress: ${address}`);
        if (this.callback) this.callback('INVALID_ADDRESS');
        return;
      }

      // Simulera anslutning baserat på vanliga skrivare IP-adresser
      const commonPrinterIPs = [
        '192.168.1.100', '192.168.1.101', '192.168.1.102',
        '192.168.0.100', '192.168.0.101', '192.168.0.102',
        '10.0.0.100', '10.0.0.101', '10.0.0.102'
      ];

      if (commonPrinterIPs.includes(address) || address.startsWith('192.168.')) {
        console.log(`[ePOS] Anslutning framgångsrik till ${address}:${port}`);
        this.connected = true;
        if (this.callback) this.callback('OK');
      } else {
        console.log(`[ePOS] Kan inte ansluta till ${address}:${port}`);
        if (this.callback) this.callback('CONNECTION_FAILED');
      }
    }, 1000);
  };

  window.epos.ePOSDevice.prototype.createDevice = function(deviceId, deviceType) {
    if (!this.connected) {
      throw new Error('Device not connected');
    }

    return new window.epos.ePOSPrinter(deviceId, deviceType);
  };

  // ePOS Printer class
  window.epos.ePOSPrinter = function(deviceId, deviceType) {
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.commands = [];
  };

  window.epos.ePOSPrinter.prototype.addCommand = function(command) {
    this.commands.push(command);
  };

  window.epos.ePOSPrinter.prototype.send = function(callback) {
    console.log(`[ePOS] Skickar ${this.commands.length} kommandon till skrivare`);
    
    // Simulera utskrift
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        console.log('[ePOS] Utskrift framgångsrik');
        if (callback) callback({ success: true, code: 'SUCCESS', status: 'OK' });
      } else {
        console.log('[ePOS] Utskrift misslyckades');
        if (callback) callback({ success: false, code: 'PRINT_ERROR', status: 'PRINTER_ERROR' });
      }
    }, 2000);
  };

  // ePOS Builder class
  window.epos.ePOSBuilder = function() {
    this.commands = [];
    
    // Alignment constants
    this.ALIGN_LEFT = 0;
    this.ALIGN_CENTER = 1;
    this.ALIGN_RIGHT = 2;
    
    // Cut constants
    this.CUT_FEED = 0;
    this.CUT_NO_FEED = 1;
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
    this.commands.push({ type: 'size', data: { width, height } });
    return this;
  };

  window.epos.ePOSBuilder.prototype.addCut = function(type) {
    this.commands.push({ type: 'cut', data: type });
    return this;
  };

  window.epos.ePOSBuilder.prototype.toString = function() {
    let output = '';
    
    this.commands.forEach(cmd => {
      switch (cmd.type) {
        case 'text':
          output += cmd.data;
          break;
        case 'align':
          // Alignment formatting
          break;
        case 'size':
          // Size formatting
          break;
        case 'cut':
          output += '\n--- CUT ---\n';
          break;
      }
    });
    
    return output;
  };

  console.log('[ePOS] ePOS-Print API v2.0 laddad (HTTP version)');

})(window); 